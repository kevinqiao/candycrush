
import { CLOSE_TYPE } from "component/StackPop";
import gsap from "gsap";
import { useCallback } from "react";
import { STACK_PAGE_DIRECTION } from "../../../model/Constants";
import useCoord from "../../../service/CoordManager";
interface StackProps {
    scene: any;
    mask: any;
    closeBtn: any;
    pageProp: any;
    // position: { top: number; left: number; width: number; height: number, direction: number } | null;
}
const useStackAnimation = ({ scene, mask, closeBtn, pageProp }: StackProps) => {
    const { width,height } = useCoord();
    const play = useCallback(() => {
        if (!scene ||!pageProp|| !pageProp.position) {
            return
        }
        const tl = gsap.timeline();
        switch (pageProp.position.direction) {
            case STACK_PAGE_DIRECTION.CENTER:
                tl.to(scene.current, {scale:0.4, x: (width - pageProp.position.width) / 2,duration:0});
                tl.to(scene.current, {scale:1,autoAlpha:1,duration:0.9, ease: "back.out(1.4)"})
                // tl.to(scene.current, { scale: 0.4, x: (width - pageProp.position.width) / 2, y: 0 }, { duration: 0.9, autoAlpha: 1, scale: 1, ease: "back.out(1.4)" });

                // tl.fromTo(scene.current, { scale: 0.4, x: (width - pageProp.position.width) / 2, y: 0 }, { duration: 0.9, autoAlpha: 1, scale: 1, ease: "back.out(1.4)" });
                tl.to(mask.current, { autoAlpha: 0.7, duration: 0.5 }, "<");
                if (pageProp.config.closeType !== CLOSE_TYPE.NO_BUTTON)
                    tl.to(closeBtn.current, { autoAlpha: 1, duration: 0.3 }, ">")
                break;
            case STACK_PAGE_DIRECTION.RIGHT:
                tl.to(scene.current, { autoAlpha: 0, duration: 0.1, x: width, y: 0 });
                tl.to(scene.current, { autoAlpha: 1, x: width - pageProp.position.width, duration: 0.8, ease: "back.out(1.4)" });
                gsap.to(mask.current, { autoAlpha: 0.7, duration: 0.3 });
                break;
            default:
                break;
        }


    }, [width,height,pageProp])
   
    const close = (timeline: any) => {
        if (pageProp.position) {
            const tl = timeline ?? gsap.timeline();
            switch (pageProp.position.direction) {
                case STACK_PAGE_DIRECTION.CENTER:
                    tl.to(scene.current, { autoAlpha: 0, scale: 0.4, duration: 0.3, ease: "back.in(1.1)" });
                    tl.to(mask.current, { autoAlpha: 0, duration: 0.3 }, "<");
                    break;
                case STACK_PAGE_DIRECTION.RIGHT:
                    tl.to(scene.current, { duration: 0.7, x: width });
                    tl.to(scene.current, { autoAlpha: 0, duration: 0.1 });
                    gsap.to(mask.current, { autoAlpha: 0, duration: 0.7 });
                    break;
                default:
                    break;
            }
            tl.play()
        }

    }
    return { play, close }
}
export default useStackAnimation