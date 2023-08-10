
import { useEffect, useRef } from "react";

import Phaser from "phaser";
import { CellItem } from "../model/CellItem";
import { checkForMatches, checkMatchAt } from "./GameEngine";
import { useGameManager } from "./GameManager";

const useSceneManager = (scene: Phaser.Scene | undefined) => {
    const dragRef = useRef<{ startX: number; startY: number; cellId: number }>({ startX: 0, startY: 0, cellId: -1 });
    const cellMapRef = useRef(new Map())
    const { cells, updateCells, handleMatch } = useGameManager();

    useEffect(() => {
        console.log(cells)
        const matches = checkForMatches(cells);
        console.log(matches)
        if (matches?.length > 0) {
            const result = handleMatch(matches[0])
            if (result?.toMoves)
                setTimeout(() => moveCandies(result.toMoves), 100);
            if (result?.toRemoves)
                removeCandies(result.toRemoves)
            if (result?.toCreates) {
                console.log(result.toCreates)
                createCandies(result.toCreates, matches[0]['direction'])
            }
        }
    }, [cells])
    useEffect(() => {
        if (scene && cells?.length > 0 && cellMapRef.current.size === 0) {

            const m = cellMapRef.current;
            cells.forEach((c) => {
                const candy = scene.add.image(c.column * 100 + 50, c.row * 100 + 50, "candies", c.asset);
                candy.setInteractive();
                m.set(c.id, candy)
                candy.on("pointerdown", (event: PointerEvent) => selectCandy(event, c.id));
                candy.on("pointermove", (event: PointerEvent) => startSwipe(event, c.id, cells));
                candy.on("pointerup", (event: PointerEvent) => {
                    console.log("pointer up")
                    const drag = dragRef.current;
                    drag.cellId = -1
                });
            })
        }

    }, [scene, cells])

    const selectCandy = (pointer: PointerEvent, cid: number) => {
        const drag = dragRef.current;
        drag.startX = pointer.x;
        drag.startY = pointer.y;
        drag.cellId = cid;
        console.log("select x:" + pointer.x + " cid:" + cid)
    }
    const startSwipe = (pointer: PointerEvent, cid: number, cells: CellItem[]) => {

        const drag = dragRef.current;
        console.log("start swipe;" + cid + ":" + drag.cellId)
        if (drag?.cellId && cid === drag.cellId) {

            const deltaX = pointer.x - drag.startX;
            const deltaY = pointer.y - drag.startY;
            console.log(cid + ":" + deltaX + ":" + deltaY)
            let direction = 0;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20)
                direction = deltaX > 0 ? 1 : 3;
            else if (Math.abs(deltaY) > 20)
                direction = deltaY > 0 ? 2 : 4;
            console.log(cells)
            const cs = cells.find((c) => c.id === cid);
            console.log(cs)
            console.log("direction:" + direction)
            if (cs && direction) {
                drag.cellId = -1;
                const target = swapTarget(cs, direction);
                console.log(target)
                if (target) {
                    const swappedCell = Object.assign({}, cs, { row: target.row, column: target.column });
                    const swappedTarget = Object.assign({}, target, { row: cs.row, column: cs.column });
                    if (checkMatchAt(cells, swappedCell) || checkMatchAt(cells, swappedTarget)) {
                        console.log("match found")
                        updateCells([swappedCell, swappedTarget])
                    } else if (target) {
                        setTimeout(() => cancelSwap(cs, target), 400)
                    }
                }
            }

        }
    }
    const removeCandies = (candies: CellItem[]) => {

        candies.forEach((c) => {
            const sprite = cellMapRef.current.get(c.id);
            scene?.tweens.add({
                targets: sprite,
                alpha: 0,
                duration: 500,
                onComplete: function (tween, targets) {
                    cellMapRef.current.delete(c.id)
                    // targets[0].destroy();
                }
            });

        })
    }
    const createCandies = (candies: CellItem[], direction: number) => {

        if (!scene)
            return;
        console.log(candies)
        candies.sort((a, b) => (b.row + b.column) - (a.row + a.column)).forEach((c, index) => {
            const candy = scene.add.image(c.column * 100 + 50, direction === 1 ? -100 : -100 * (index + 1) - 50, "candies", c.asset);
            candy.setInteractive();
            cellMapRef.current.set(c.id, candy)
            candy.on("pointerdown", (event: PointerEvent) => selectCandy(event, c.id));
            candy.on("pointermove", (event: PointerEvent) => startSwipe(event, c.id, cells));
            candy.on("pointerup", (event: PointerEvent) => {
                console.log("pointer up")
                const drag = dragRef.current;
                drag.cellId = -1
            });

            scene?.tweens.add({
                targets: candy,
                x: c.column * 100 + 50,
                y: c.row * 100 + 50,
                duration: 1200,
                ease: 'Power2',
            });
        })
    }
    const moveCandies = (candies: CellItem[]) => {
        candies.forEach((c) => {
            const sprite = cellMapRef.current.get(c.id);
            scene?.tweens.add({
                targets: sprite,
                x: c.column * 100 + 50,
                y: c.row * 100 + 50,
                duration: 1000,
                ease: 'Power2',
            })

        })
    }
    const cancelSwap = (cell: CellItem, target: CellItem) => {
        scene?.tweens.add({
            targets: cellMapRef.current.get(cell.id),
            x: cell.column * 100 + 50,
            y: cell.row * 100 + 50,
            duration: 1000,
            ease: 'Power2',
        })

        scene?.tweens.add({
            targets: cellMapRef.current.get(target.id),
            x: target.column * 100 + 50,
            y: target.row * 100 + 50,
            duration: 1000,
            ease: 'Power2',
        })

    }
    const swapTarget = (cell: CellItem, direction: number) => {
        let next;
        console.log("direction:" + direction)
        switch (direction) {
            //right move
            case 1:
                next = cells.find((c) => c.row === cell.row && c.column === cell.column + 1);
                break;
            //down move
            case 2:
                next = cells.find((c) => c.row === cell.row + 1 && c.column === cell.column)
                break;
            //left mo
            case 3:
                next = cells.find((c) => c.row === cell.row && c.column === cell.column - 1)
                break;
            //up move
            case 4:
                next = cells.find((c) => c.row === cell.row - 1 && c.column === cell.column)
                break;
            default:
                break;
        }
        if (cell && next && scene) {
            scene.tweens.add({
                targets: cellMapRef.current.get(next.id),
                x: cell.column * 100 + 50,
                y: cell.row * 100 + 50,
                duration: 400,
                ease: 'Power2',
            })

            scene.tweens.add({
                targets: cellMapRef.current.get(cell.id),
                x: next.column * 100 + 50,
                y: next.row * 100 + 50,
                duration: 400,
                ease: 'Power2',
            })
        }
        return next;

    }


}
export default useSceneManager