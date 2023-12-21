import gsap from "gsap";
import { useCallback } from "react";
import { STACK_PAGE_DIRECTION } from "../model/Constants";
import useCoord from "../service/CoordManager";
interface StackProps {
    scene: any;
    mask: any;
    closeBtn: any;
    position: { top: number; left: number; width: number; height: number, direction: number } | null;
}
const useStackAnimation = ({ scene, mask, closeBtn, position }: StackProps) => {
    const { width } = useCoord();
    const play = useCallback(() => {
        if (!scene || !position) {
            return
        }
        const tl = gsap.timeline();
        switch (position.direction) {
            case STACK_PAGE_DIRECTION.CENTER:
                tl.fromTo(scene.current, { scale: 0.4, x: (width - position.width) / 2, y: 0 }, { duration: 0.9, autoAlpha: 1, scale: 1, ease: "back.out(1.4)" });
                tl.to(mask.current, { autoAlpha: 0.7, duration: 0.5 }, "<");
                tl.to(closeBtn.current, { autoAlpha: 1, duration: 0.3 }, ">")
                break;
            case STACK_PAGE_DIRECTION.RIGHT:
                tl.to(scene.current, { autoAlpha: 0, duration: 0.1, x: width, y: 0 });
                tl.to(scene.current, { autoAlpha: 1, x: width - position.width, duration: 0.8, ease: "back.out(1.4)" });
                gsap.to(mask.current, { autoAlpha: 0.7, duration: 0.3 });
                break;
            default:
                break;
        }


    }, [])
    const close = (timeline: any) => {
        if (position) {
            const tl = timeline ?? gsap.timeline();
            switch (position.direction) {
                case STACK_PAGE_DIRECTION.CENTER:
                    tl.to(scene.current, { autoAlpha: 0, scale: 0.4, duration: 0.7, ease: "back.in(1.1)" });
                    tl.to(mask.current, { autoAlpha: 0, duration: 0.7 }, "<");
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