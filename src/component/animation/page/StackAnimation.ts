
import gsap from "gsap";
import { useCallback, useEffect } from "react";
import { STACK_PAGE_DIRECTION } from "../../../model/Constants";
import useCoord from "../../../service/CoordManager";
interface StackProps {
    scene: any;
    mask: any;
    closeBtn: any;
    pageProp: any;
    pagePattern: any;
    // position: { top: number; left: number; width: number; height: number, direction: number } | null;
}
const useStackAnimation = ({ scene, mask, closeBtn, pageProp, pagePattern }: StackProps) => {
    const { width, height } = useCoord();


    const fit = useCallback((vwidth: number, vheight: number) => {
        if (!scene || !pageProp || !pagePattern) {
            return
        }
        const tl = gsap.timeline({ onComplete: () => { tl.kill() } });
        // tl.to(scene.current, { width: pagePattern.width, height: pagePattern.height })
        switch (pagePattern.direction) {
            case STACK_PAGE_DIRECTION.CENTER:
                tl.to(scene.current, { x: (vwidth - pagePattern.width) / 2, y: 0 }, "<");
                break;
            case STACK_PAGE_DIRECTION.RIGHT:
                tl.to(scene.current, { x: vwidth - pagePattern.width }, "<");
                break;
            case STACK_PAGE_DIRECTION.BOTTOM:
                tl.to(scene.current, { x: (vwidth - pagePattern.width) / 2, y: vheight - pagePattern.height }, "<");
                break;
            case STACK_PAGE_DIRECTION.LEFT:
                tl.to(scene.current, { x: 0, y: 0 }, "<");
                break;
            default:
                break;
        }
        tl.play();

    }, [scene, pageProp, pagePattern])
    const play = useCallback((timeline: any) => {
        if (!scene || !pageProp || !pagePattern) {
            return
        }
        const tl = timeline ?? gsap.timeline({ onComplete: () => { tl.kill() } });
        switch (pagePattern.direction) {
            case STACK_PAGE_DIRECTION.CENTER:
                // tl.to(scene.current, { scale: 0, autoAlpha: 0, x: (width - pageProp.position.width) / 2, duration: 0 });
                // tl.to(scene.current, { scale: 1, autoAlpha: 1, duration: 0.9 })
                // tl.to(scene.current, { scale: 0.4, x: (width - pageProp.position.width) / 2, y: 0 }, { duration: 0.9, autoAlpha: 1, scale: 1, ease: "back.out(1.4)" });

                tl.fromTo(scene.current, { scale: 0, x: (width - pagePattern.width) / 2, y: 0 }, { duration: 1.5, autoAlpha: 1, scale: 1 });
                tl.to(mask.current, { autoAlpha: 0.7, duration: 1.5 }, "<");
                // if (pageProp.config.closeType !== CLOSE_TYPE.NO_BUTTON)
                tl.to(closeBtn.current, { autoAlpha: 1, duration: 1.5 }, ">")
                break;
            case STACK_PAGE_DIRECTION.RIGHT:
                tl.to(scene.current, { scale: 1, autoAlpha: 0, x: width, y: 0, duration: 0 });
                tl.to(scene.current, { autoAlpha: 1, x: width - pagePattern.width, duration: 0.8 });
                tl.to(mask.current, { autoAlpha: 0.7, duration: 0.8 }, "<");
                tl.to(closeBtn.current, { autoAlpha: 1, duration: 0.8 }, "<")
                break;
            case STACK_PAGE_DIRECTION.BOTTOM:
                tl.to(scene.current, { scale: 1, autoAlpha: 0, x: (width - pagePattern.width) / 2, y: height, duration: 0 });
                tl.to(scene.current, { autoAlpha: 1, y: height - pagePattern.height, duration: 0.8 });
                tl.to(mask.current, { autoAlpha: 0.7, duration: 0.3 }, "<");
                tl.to(closeBtn.current, { autoAlpha: 1, duration: 0.3 }, "<")
                break;
            case STACK_PAGE_DIRECTION.LEFT:
                tl.to(scene.current, { scale: 1, autoAlpha: 0, x: - pagePattern.width, y: 0, duration: 0 });
                tl.to(scene.current, { autoAlpha: 1, x: 0, duration: 0.8 });
                tl.to(mask.current, { autoAlpha: 0.7, duration: 0.8 }, "<");
                tl.to(closeBtn.current, { autoAlpha: 1, duration: 0.8 }, "<")
                break;
            default:
                break;
        }

        tl.play();


    }, [width, height, pageProp])

    const close = useCallback((timeline: any) => {
        if (pageProp && pagePattern) {
            const tl = timeline ?? gsap.timeline();
            switch (pagePattern.direction) {
                case STACK_PAGE_DIRECTION.CENTER:
                    tl.to(scene.current, { autoAlpha: 0, scale: 0, duration: 0.3 });
                    tl.to(mask.current, { autoAlpha: 0, duration: 0.3 }, "<");
                    tl.to(closeBtn.current, { autoAlpha: 0, duration: 0.3 }, "<")
                    break;
                case STACK_PAGE_DIRECTION.RIGHT:
                    tl.to(scene.current, { duration: 0.7, x: width });
                    tl.to(mask.current, { autoAlpha: 0, duration: 0.3 }, "<");
                    tl.to(scene.current, { autoAlpha: 0, duration: 0 });
                    tl.to(closeBtn.current, { autoAlpha: 0, duration: 0 }, "<")
                    break;
                case STACK_PAGE_DIRECTION.BOTTOM:
                    tl.to(scene.current, { duration: 0.7, y: height });
                    tl.to(mask.current, { autoAlpha: 0, duration: 0.7 }, "<");
                    tl.to(scene.current, { autoAlpha: 0, duration: 0 });
                    tl.to(closeBtn.current, { autoAlpha: 0, duration: 0 }, "<")
                    break;
                case STACK_PAGE_DIRECTION.LEFT:
                    tl.to(scene.current, { duration: 0.7, x: - pagePattern.width });
                    tl.to(mask.current, { autoAlpha: 0, duration: 0.7 }, "<");
                    tl.to(scene.current, { autoAlpha: 0, duration: 0 });
                    tl.to(closeBtn.current, { autoAlpha: 0, duration: 0 }, "<")
                    break;
                default:
                    break;
            }
            tl.play()
        }

    }, [pageProp, pagePattern, scene, width])
    useEffect(() => {
        if (pagePattern)
            fit(width, height)
    }, [pagePattern, width, height, fit])

    return { play, close, fit }
}
export default useStackAnimation