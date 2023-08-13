
import { useEffect, useRef } from "react";

import Phaser from "phaser";
import useSleep from "../common/useSleep";
import { CellItem } from "../model/CellItem";
import { checkForMatches, getMatches, initGame, processMatch } from "./GameEngine";
interface Candy {
    id: number;
    sprite: Phaser.GameObjects.Image;
    data: CellItem;
}
const useSceneManager = (scene: Phaser.Scene | undefined) => {
    const dragRef = useRef<{ startX: number; startY: number; cellId: number }>({ startX: 0, startY: 0, cellId: -1 });
    const candyMapRef = useRef(new Map());
    const matchingRef = useRef(0);
    const [isSleeping, sleep] = useSleep(300);
    // const { cells, updateCells, handleMatch } = useGameManager();
    useEffect(() => {
        if (!isSleeping) {

            if (candyMapRef.current.size > 0) {

                const cells = Array.from(candyMapRef.current.values()).map((c) => c.data);
                cells.sort((a, b) => {
                    if (a.row !== b.row) return a.row - b.row;
                    else return a.column - b.column;
                })

                const matches = getMatches(cells);

                if (matches && matches.length > 0) {
                    matches.sort((a, b) => b.size - a.size);
                    matchingRef.current = 1;
                    const result = processMatch(cells, matches[0])

                    if (result?.toMoves)
                        moveCandies(result.toMoves);
                    if (result?.toRemoves)
                        removeCandies(result.toRemoves)
                    if (result?.toCreates) {
                        createCandies(result.toCreates, matches[0]['direction'])
                    }
                    setTimeout(() => matchingRef.current = 0, 1200)
                } else
                    matchingRef.current = 0;

            }
            sleep();
        }
    }, [isSleeping])


    useEffect(() => {
        if (scene && candyMapRef.current.size === 0) {
            const cells = initGame();
            cells.forEach((c) => {
                const candy = scene.add.image(c.column * 100 + 50, c.row * 100 + 50, "candies", c.asset);
                candy.setInteractive();
                candyMapRef.current.set(c.id, { id: c.id, sprite: candy, data: c })
                candy.on("pointerdown", (event: PointerEvent) => selectCandy(event, c.id));
                candy.on("pointermove", (event: PointerEvent) => startSwipe(event, c.id));
                candy.on("pointerup", (event: PointerEvent) => {
                    const drag = dragRef.current;
                    drag.cellId = -1
                });
            })
        }

    }, [scene])

    const selectCandy = (pointer: PointerEvent, cid: number) => {
        const drag = dragRef.current;
        drag.startX = pointer.x;
        drag.startY = pointer.y;
        drag.cellId = cid;

    }
    const startSwipe = (pointer: PointerEvent, cid: number) => {

        if (matchingRef.current > 0) return;

        const drag = dragRef.current;
        // console.log("start swipe;" + cid + ":" + drag.cellId)
        if (drag?.cellId && cid === drag.cellId) {

            const deltaX = pointer.x - drag.startX;
            const deltaY = pointer.y - drag.startY;
            // console.log(cid + ":" + deltaX + ":" + deltaY)
            let direction = 0;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20)
                direction = deltaX > 0 ? 1 : 3;
            else if (Math.abs(deltaY) > 20)
                direction = deltaY > 0 ? 2 : 4;

            if (direction) {
                drag.cellId = -1;
                const candies = Array.from(candyMapRef.current.values()).map((c) => c.data)
                const candy = candyMapRef.current.get(cid).data;
                const next = swapTarget(cid, direction);

                if (next) {
                    const target = next.data
                    const swappedCell = Object.assign({}, candy, { row: target.row, column: target.column });
                    const swappedTarget = Object.assign({}, target, { row: candy.row, column: candy.column });
                    const unswappedList = candies.filter((c) => c.id !== candy.id && c.id !== target.id)
                    if (checkForMatches([...unswappedList, swappedTarget, swappedCell])) {
                        Object.assign(target, swappedTarget);
                        Object.assign(candy, swappedCell)
                    } else if (target) {
                        setTimeout(() => cancelSwap(candy, target), 400)
                    }
                }
            }

        }
    }
    const removeCandies = (candies: CellItem[]) => {

        candies.forEach((c) => {

            const sprite = candyMapRef.current.get(c.id).sprite;
            scene?.tweens.add({
                targets: sprite,
                alpha: 0,
                duration: 300,
                onComplete: function (tween, targets) {
                    candyMapRef.current.delete(c.id)
                    targets[0].destroy();
                }
            });

        })
    }
    const createCandies = (candies: CellItem[], direction: number) => {

        if (!scene)
            return;

        candies.sort((a, b) => (b.row + b.column) - (a.row + a.column)).forEach((c, index) => {
            const candy = scene.add.image(c.column * 100 + 50, direction === 1 ? -100 : -100 * (index + 1) - 50, "candies", c.asset);
            candy.setInteractive();
            candyMapRef.current.set(c.id, { id: c.id, sprite: candy, data: c })

            candy.on("pointerdown", (event: PointerEvent) => selectCandy(event, c.id));
            candy.on("pointermove", (event: PointerEvent) => startSwipe(event, c.id));
            candy.on("pointerup", (event: PointerEvent) => {
                const drag = dragRef.current;
                drag.cellId = -1
            });

            scene?.tweens.add({
                targets: candy,
                x: c.column * 100 + 50,
                y: c.row * 100 + 50,
                duration: 1000,
                ease: 'Power2',
            });
        })
    }
    const moveCandies = (candies: CellItem[]) => {

        candies.forEach((c) => {
            const candy = candyMapRef.current.get(c.id)
            if (candy) {
                Object.assign(candy.data, c)
                const sprite = candy.sprite
                if (sprite)
                    scene?.tweens.add({
                        targets: sprite,
                        x: c.column * 100 + 50,
                        y: c.row * 100 + 50,
                        duration: 1000,
                        ease: 'Power2',
                    })
            }

        })
    }
    const cancelSwap = (cell: CellItem, target: CellItem) => {
        scene?.tweens.add({
            targets: candyMapRef.current.get(cell.id).sprite,
            x: cell.column * 100 + 50,
            y: cell.row * 100 + 50,
            duration: 1000,
            ease: 'Power2',
        })

        scene?.tweens.add({
            targets: candyMapRef.current.get(target.id).sprite,
            x: target.column * 100 + 50,
            y: target.row * 100 + 50,
            duration: 1000,
            ease: 'Power2',
        })

    }
    const swapTarget = (cid: number, direction: number) => {
        const candy = candyMapRef.current.get(cid);
        let next;

        const candies = Array.from(candyMapRef.current.values());

        switch (direction) {
            //right move
            case 1:
                next = candies.find((c) => c.data.row === candy.data.row && c.data.column === candy.data.column + 1);
                break;
            //down move
            case 2:
                next = candies.find((c) => c.data.row === candy.data.row + 1 && c.data.column === candy.data.column)
                break;
            //left mo
            case 3:
                next = candies.find((c) => c.data.row === candy.data.row && c.data.column === candy.data.column - 1)
                break;
            //up move
            case 4:
                next = candies.find((c) => c.data.row === candy.data.row - 1 && c.data.column === candy.data.column)
                break;
            default:
                break;
        }
        // console.log(candy.data)
        // console.log(next)
        if (next && scene) {

            scene.tweens.add({
                targets: next.sprite,
                x: candy.data.column * 100 + 50,
                y: candy.data.row * 100 + 50,
                duration: 400,
                ease: 'Power2',
            })

            scene.tweens.add({
                targets: candy.sprite,
                x: next.data.column * 100 + 50,
                y: next.data.row * 100 + 50,
                duration: 400,
                ease: 'Power2',
            })
        }
        return next;

    }


}
export default useSceneManager