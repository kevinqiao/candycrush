import { useEffect, useState } from "react";

const useDimension = (eleRef: React.MutableRefObject<HTMLDivElement | null>) => {
    const [dimension, setDimension] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    useEffect(() => {
        const updateDimensions = () => {
            if (eleRef.current) {
                setDimension({
                    width: eleRef.current.offsetWidth,
                    height: eleRef.current.offsetHeight,
                });
            }
        };
        window.addEventListener("resize", updateDimensions);
        updateDimensions(); // Initial dimension setting
        return () => {
            window.removeEventListener("resize", updateDimensions);
        };
    }, [eleRef.current]);
    return dimension
}
export default useDimension;