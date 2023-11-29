import { CellItem } from "../../model/CellItem";
import { CandySprite } from "../pixi/CandySprite";
const useRemoveCandies = () => {
    // const { createEvent } = useEventSubscriber([], [])
    const playRemove = (cells: CellItem[], candyMap: Map<Number, CandySprite>, tl: any) => {
        // createEvent({ name: "candyRemoved", data: cells, delay: 0 })
        cells.forEach((c, index) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                candyMap.delete(c.id);
                tl.to(
                    candy,
                    {
                        alpha: 0,
                        duration: 0.3,
                        ease: 'power2.out',
                        onComplete: function () {
                            candy.destroy()
                        },

                    }, "<");
            } else {
                console.log("the sprite to remove not exist with id:" + c.id + ";row:" + c.row + ";column:" + c.column)
            }
        })
    }
    return { playRemove }


}
export default useRemoveCandies