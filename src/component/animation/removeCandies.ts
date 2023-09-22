import { CandyModel } from "../../model/CandyModel";
import { CellItem } from "../../model/CellItem";
const play = (cells: CellItem[], candyMap: Map<Number, CandyModel>, tl: any, mode: number) => {

    cells.forEach((c) => {
        const candy = candyMap.get(c.id);
        if (candy) {
            tl.to(
                candy.sprite,
                {
                    alpha: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: function () {
                        if (mode) setTimeout(() => {
                            console.log("remove sprite id:" + c.id)
                            candyMap.delete(c.id);
                            candy.sprite.destroy()
                        }, 350);
                    }
                }, 0);
        } else {
            console.log("the sprite to remove not exist with id:" + c.id)
        }
    })


}
export default play