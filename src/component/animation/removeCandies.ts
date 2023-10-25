import { CandyModel } from "../../model/CandyModel";
import { CellItem } from "../../model/CellItem";
const play = (cells: CellItem[], candyMap: Map<Number, CandyModel>, tl: any) => {

    cells.forEach((c) => {
        const candy = candyMap.get(c.id);
        if (candy) {
            candyMap.delete(c.id);
            tl.to(
                candy.sprite,
                {
                    alpha: 0,
                    duration: 0.2,
                    ease: 'power2.out',
                    onComplete: function () {
                        setTimeout(() => {
                            // console.log("remove sprite id:" + c.id)
                            candy.sprite.destroy()
                        }, 250);
                    }
                }, 0.2);
        } else {
            console.log("the sprite to remove not exist with id:" + c.id)
        }
    })


}
export default play