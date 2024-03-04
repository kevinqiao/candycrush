import React, { useEffect, useRef, useState } from "react";
interface IconProps {
  //   color: string; // Define the type of the color prop
  rank: string | number;
}
const PrizeIcon: React.FC<IconProps> = ({ rank }) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (divRef.current) {
        const width = divRef.current.offsetWidth;
        const height = divRef.current.offsetHeight;
        const size = Math.min(width, height * 0.5);
        setDimensions({ width: size, height: size });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  return (
    <div
      ref={divRef}
      style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}
    >
      {dimensions && (
        <svg
          id="Layer_1"
          height={dimensions.height}
          width={dimensions.width}
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          data-name="Layer 1"
        >
          <path d="m20.67 11-3.67-8h30l-3.67 8z" fill="#c20000" />
          <path d="m42 33 11-23-6-7-10.34 22.56" fill="#3d9139" />
          <path d="m22 33-11-23 6-7 10.34 22.56" fill="#3d9139" />
          <path
            d="m51 43-4.73 4.62 1.1 6.5-6.55.97-2.95 5.91-5.87-3.06-5.87 3.06-2.95-5.91-6.55-.97 1.1-6.5-4.73-4.62 4.73-4.62-1.1-6.5 6.55-.97 2.95-5.91 5.87 3.06 5.87-3.06 2.95 5.91 6.55.97-1.1 6.5z"
            fill="#e2900e"
          />
          <circle cx="32" cy="43" fill="#73aad8" r="11" />
          <path d="m32 32a11 11 0 0 1 0 22" fill="#6090bf" />
          <path d="m53.76 9.35-6-7a1 1 0 0 0 -.76-.35h-30a1 1 0 0 0 -.76.35l-6 7a1 1 0 0 0 -.14 1.08l9.52 20-3.14.46a1 1 0 0 0 -.84 1.11l1 6-4.34 4.28a1 1 0 0 0 0 1.44l4.36 4.28-1 6a1 1 0 0 0 .84 1.15l6 .89 2.71 5.45a1 1 0 0 0 .59.5 1 1 0 0 0 .77-.06l5.43-2.86 5.41 2.82a1 1 0 0 0 .46.11 1.06 1.06 0 0 0 .31 0 1 1 0 0 0 .59-.5l2.71-5.5 6-.89a1 1 0 0 0 .88-1.11l-1-6 4.36-4.25a1 1 0 0 0 0-1.44l-4.38-4.31 1-6a1 1 0 0 0 -.84-1.15l-3.14-.46 9.52-20a1 1 0 0 0 -.12-1.04zm-8.32-5.35-2.75 6h-21.38l-2.75-6zm-3.66 8-5.93 12.93-3.85 2-3.85-2-5.93-12.93zm-29.6-1.84 4.56-5.32 8.86 19.33a1 1 0 0 0 -.37.38l-2.71 5.45-.83.12zm34 22.56-.93 5.49a1 1 0 0 0 .29.89l4 3.9-4 3.9a1 1 0 0 0 -.29.89l.93 5.49-5.54.82a1 1 0 0 0 -.75.54l-2.49 5-5-2.59a1 1 0 0 0 -.92 0l-5 2.59-2.49-5a1 1 0 0 0 -.75-.54l-5.54-.82.93-5.49a1 1 0 0 0 -.29-.89l-4-3.9 4-3.9a1 1 0 0 0 .29-.89l-.93-5.49 5.54-.82a1 1 0 0 0 .75-.54l2.49-5 5 2.59a1 1 0 0 0 .92 0l5-2.59 2.49 5a1 1 0 0 0 .75.54zm-3.9-2.6-.8-.12-2.71-5.45a1 1 0 0 0 -.37-.38l8.86-19.33 4.56 5.32z" />
          <path d="m32 31a12 12 0 1 0 12 12 12 12 0 0 0 -12-12zm0 22a10 10 0 1 1 10-10 10 10 0 0 1 -10 10z" />
          <text x="35" y="50" textAnchor="end" fill="white" className="roboto-bold" style={{ fontSize: "15px" }}>
            {rank}
          </text>
        </svg>
      )}
    </div>
  );
};

export default PrizeIcon;