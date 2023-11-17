import { CandyModel } from "../../model/CandyModel";
import { CellItem } from "../../model/CellItem";
const useRemoveCandies = () => {
    // const { createEvent } = useEventSubscriber([], [])
    const playRemove = (cells: CellItem[], candyMap: Map<Number, CandyModel>, tl: any) => {
        // createEvent({ name: "candyRemoved", data: cells, delay: 0 })
        cells.forEach((c, index) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                candyMap.delete(c.id);
                tl.to(
                    candy.sprite,
                    {
                        alpha: 0,
                        duration: 0.3,
                        ease: 'power2.out',
                        onComplete: function () {
                            // setTimeout(() => {
                            // console.log("remove sprite id:" + c.id)
                            candy.sprite.destroy()
                            // }, 250);
                        },

                    }, "<");
            } else {
                console.log("the sprite to remove not exist with id:" + c.id)
            }
        })
    }
    return { playRemove }


}
export default useRemoveCandies