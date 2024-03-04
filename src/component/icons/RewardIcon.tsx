import React, { useEffect, useRef, useState } from "react";
interface IconProps {
  //   color: string; // Define the type of the color prop
  amount: string;
}
const RewardIcon: React.FC<IconProps> = ({ amount }) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState(20);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const calculateFontSize = () => {
    if (divRef.current) {
      const divWidth = divRef.current.offsetWidth;
      const divHeight = divRef.current.offsetHeight;
      const newFontSize = divHeight / 9; // 示例计算方法
      setFontSize(Math.max(newFontSize, 12));
      // const size = Math.min(divWidth, divHeight * 0.8);
      setDimensions({ width: divHeight * 0.6, height: divHeight * 0.6 });
    }
  };

  useEffect(() => {
    calculateFontSize();
    window.addEventListener("resize", calculateFontSize);

    return () => {
      window.removeEventListener("resize", calculateFontSize);
    };
  }, [divRef.current]);
  return (
    <div
      ref={divRef}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {dimensions && (
        <>
          <svg
            height={dimensions.height}
            width={dimensions.width}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Layer_32" data-name="Layer 32">
              <path
                d="m32 1 2.931 1.954a36 36 0 0 0 19.969 6.046h.1v22.325a30 30 0 0 1 -12.868 24.627l-10.132 7.048-10.132-7.048a30 30 0 0 1 -12.868-24.627v-22.325h.1a36 36 0 0 0 19.969-6.046z"
                fill="#f8c460"
              />
              <path
                d="m10.453 40.526a30.008 30.008 0 0 0 7.332 12 66.9 66.9 0 0 1 28.43 0 30.008 30.008 0 0 0 7.332-12 67.877 67.877 0 0 0 -43.094 0z"
                fill="#faaf42"
              />
              <path
                d="m32 58-9.326-6.938a24 24 0 0 1 -9.674-19.256v-18.806c6.756-.854 13.222-3.637 19-7 5.778 3.363 12.244 6.146 19 7v18.806a24 24 0 0 1 -9.674 19.255z"
                fill="#fcab68"
              />
              <path
                d="m14.241 39.394a24 24 0 0 0 8.433 11.668l.678.5a66.408 66.408 0 0 1 17.3 0l.678-.505a23.993 23.993 0 0 0 8.433-11.667 67.31 67.31 0 0 0 -35.522.004z"
                fill="#ea8e49"
              />
              <path
                d="m25.674 50.062a24 24 0 0 1 -9.674-19.256v-18.325c-.994.209-1.992.392-3 .519v18.806a24 24 0 0 0 9.674 19.256l9.326 6.938 2.172-1.616z"
                fill="#ea8e49"
              />
              <path d="m16 59a36.306 36.306 0 0 0 -15 4l4-9-4-5q8.5-4 15-4z" fill="#f96464" />
              <path d="m7 59a74.12 74.12 0 0 1 9-2.511v-11.489a29.331 29.331 0 0 0 -9 1.6z" fill="#d34444" />
              <path d="m48 59a36.306 36.306 0 0 1 15 4l-4-9 4-5q-8.5-4-15-4z" fill="#f96464" />
              <g fill="#d34444">
                <path d="m57 59a74.12 74.12 0 0 0 -9-2.511v-11.489a29.331 29.331 0 0 1 9 1.6z" />
                <path d="m9 57 7 2v-6h-7z" />
                <path d="m55 57-7 2v-6h7z" />
              </g>
              <path d="m55 57a68.129 68.129 0 0 0 -46 0v-14a68.129 68.129 0 0 1 46 0z" fill="#f96464" />
              <path d="m63.914 62.594-3.753-8.444 3.62-4.525a1 1 0 0 0 -.355-1.53 50.3 50.3 0 0 0 -7.426-2.844v-2.251a1 1 0 0 0 -.672-.944c-.373-.13-.747-.242-1.12-.365a30.848 30.848 0 0 0 1.792-10.366v-22.325a1.09 1.09 0 0 0 -1.1-1 34.9 34.9 0 0 1 -19.415-5.878l-2.93-1.954a1 1 0 0 0 -1.11 0l-2.93 1.954a34.981 34.981 0 0 1 -19.515 5.878 1 1 0 0 0 -1 1v22.325a30.856 30.856 0 0 0 1.792 10.366c-.374.123-.747.235-1.12.365a1 1 0 0 0 -.672.944v2.251a50.539 50.539 0 0 0 -7.426 2.849 1 1 0 0 0 -.355 1.53l3.62 4.525-3.753 8.439a1 1 0 0 0 1.346 1.306 35.454 35.454 0 0 1 14.582-3.9 1 1 0 0 0 .986-1v-3.254q1.155-.264 2.311-.486c.643.529 1.306 1.04 1.986 1.512l10.132 7.049a1 1 0 0 0 1.142 0l10.129-7.049c.68-.473 1.343-.984 1.986-1.512q1.157.224 2.311.487v3.253a1 1 0 0 0 .986 1 35.454 35.454 0 0 1 14.582 3.9 1 1 0 0 0 1.346-1.308zm-53.914-6.972v-11.908a67.363 67.363 0 0 1 44 0v11.907a69.2 69.2 0 0 0 -44 .001zm25.531-1.5-3.531 2.631-3.534-2.628a65.552 65.552 0 0 1 7.065.001zm-21.531-22.315v-17.936a51.777 51.777 0 0 0 18-6.716 51.8 51.8 0 0 0 18 6.716v17.935a22.847 22.847 0 0 1 -1.549 8.229 68.551 68.551 0 0 0 -32.9 0 22.854 22.854 0 0 1 -1.551-8.228zm-4-.482v-21.336a36.878 36.878 0 0 0 19.624-6.2l2.376-1.589 2.376 1.584a36.934 36.934 0 0 0 19.624 6.203v21.338a28.891 28.891 0 0 1 -1.7 9.751c-.629-.19-1.257-.36-1.886-.532a24.857 24.857 0 0 0 1.586-8.738v-18.806a1 1 0 0 0 -.875-.992c-5.857-.74-11.948-2.988-18.625-6.872a1 1 0 0 0 -1.006 0c-6.672 3.884-12.764 6.132-18.622 6.872a1 1 0 0 0 -.872.992v18.807a24.868 24.868 0 0 0 1.581 8.737c-.628.172-1.257.342-1.885.532a28.872 28.872 0 0 1 -1.696-9.751zm-4.086 23.081a1 1 0 0 0 -.133-1.031l-3.2-4a47.449 47.449 0 0 1 5.419-2.041v9.666a1 1 0 0 0 .726.961l2.083.6a39.976 39.976 0 0 0 -7.831 2.456zm9.086 3.268-2.567-.733q1.283-.384 2.567-.717zm26.561-2.543-9.561 6.651-9.562-6.652c-.153-.107-.3-.222-.455-.333q1.724-.262 3.449-.437l5.968 4.44a1 1 0 0 0 1.194 0l5.969-4.441q1.726.173 3.451.436c-.15.113-.299.229-.453.336zm10.008 1.809-2.569.734v-1.448c.857.223 1.713.458 2.569.714zm1.622 1.617 2.083-.6a1 1 0 0 0 .726-.957v-9.666a47.543 47.543 0 0 1 5.419 2.042l-3.2 4a1 1 0 0 0 -.133 1.031l2.936 6.607a39.976 39.976 0 0 0 -7.831-2.457z" />
            </g>

            <svg
              id="Layer_1"
              x="15"
              y="20"
              height="25%"
              viewBox="0 0 53 53"
              width="25%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <linearGradient id="lg1">
                <stop offset=".3063063" stopColor="#fff" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <radialGradient
                id="SVGID_1_"
                cx="38.207"
                cy="21.388"
                gradientUnits="userSpaceOnUse"
                r="4.807"
                xlinkHref="#lg1"
              />
              <radialGradient
                id="SVGID_2_"
                cx="32.625"
                cy="34.778"
                gradientUnits="userSpaceOnUse"
                r="11.299"
                xlinkHref="#lg1"
              />
              <radialGradient id="SVGID_3_" cx="16.037" cy="24.436" gradientUnits="userSpaceOnUse" r="7.172">
                <stop offset=".3063062" stopColor="#fff" stopOpacity=".999" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <g id="_x34_4">
                <g>
                  <path
                    d="m8.8644638 11.4574461 9.5639648 8.2840586h.0075073 16.1264648.0175781l9.5493164-8.2888803c-.1571045-.1991577-.3328247-.3833618-.5241699-.5495605l-7.9000243-6.8699952c-.7299805-.6300046-1.6599731-.9799802-2.6300049-.9799802h-13.1499633c-.9686279 0-1.8972168.3493042-2.6265869.9775388l-.605835.5264282-7.3076172 6.3560181c-.1897583.1647949-.364502.3471069-.5206299.5443725z"
                    fill="#78ccff"
                  />
                  <path
                    d="m34.5624008 19.7415047h-16.1264648l-.0202637.0065918-3.4489136 11.5632324h23.0648194l-3.4497071-11.5634766z"
                    fill="#3da6e8"
                  />
                  <path
                    d="m44.1292953 11.4526243-9.5493164 8.2888803.0018921.0063477.0007935.0002441 3.4489136 11.5632324 11.15979-7.6446533c.31073-.9805298.2467651-2.0587769-.2348633-3.0067139l-1.7893066-3.4738159-2.6320801-5.1030283c-.1141968-.2233886-.2509766-.434204-.4058228-.6304931z"
                    fill="#0079dd"
                  />
                  <path
                    d="m3.8131938 23.6793709 11.1508789 7.6385498 3.4515991-11.5698242-9.5512695-8.2905893c-.15625.1973267-.2935181.4096069-.4085693.6344604l-4.4067388 8.5553598c-.4895015.9550171-.5527339 2.0438843-.2359004 3.0320435z"
                    fill="#55b4fb"
                  />
                  <path
                    d="m49.1913681 23.6666756-11.15979 7.6446533-10.8094483 18.5023193c.2645264-.1016846.5082397-.2619629.7177734-.4801636l20.5375977-24.3354492c.3277588-.4019165.5629273-.8551025.7138672-1.3313598z"
                    fill="#005f93"
                  />
                  <path
                    d="m14.9640732 31.3179207-11.1508794-7.6385498c.1566772.4887085.3989258.9547119.7419434 1.3637085l15.6765137 18.5784302 4.75 5.6278076c.2230225.2623901.4983521.4443359.7943115.5603027z"
                    fill="#0079dd"
                  />
                  <path
                    d="m25.7759628 49.8096199c.4624634.1812134.9746704.1826782 1.4385986.0065308l10.8170166-18.5048218-23.0674438.0065918z"
                    fill="#006db7"
                  />
                </g>
                <g>
                  <g>
                    <path
                      d="m37.5100327 5.6027098-1.8049317-1.5696411c-.7299805-.6300046-1.6599731-.9799802-2.6300049-.9799802h-13.1499633c-.9686279 0-1.8972168.3493042-2.6265869.9775388l-.605835.5264282-7.3076172 6.3560181c-.1897583.1647949-.364502.3471069-.5206299.5443726l6.7310543 5.8302965c13.5965576-.4678346 20.6434574-7.1302234 21.9145146-11.6850329z"
                      fill="#9df"
                    />
                  </g>
                </g>
                <path
                  d="m39.047245 21.8273964 1.5992127 2.0000229-2.0000305-1.6005554-.4396782 3.9678821-.4396897-3.9678821-2.000019 1.6005554 1.6005554-2.0000229-3.9678726-.4396782 3.9678726-.4410305-1.6005554-1.9986801 2.000019 1.5992145.4396897-3.9665393.4396782 3.9678821 2.0000305-1.6005573-1.5992127 1.9986801 3.9665299.4410305z"
                  fill="url(#SVGID_1_)"
                />
                <g opacity=".3">
                  <path
                    d="m38.0351181 31.3130989-10.8200073 18.5 6.2846489-18.5-.5046807-11.5700073h1.5900269z"
                    fill="url(#SVGID_2_)"
                  />
                </g>
                <path
                  d="m15.6446362 17.2740288c-3.9552116.2169456-6.98561 3.5990372-6.7686653 7.5543518.2168427 3.9552116 3.5990362 6.9856091 7.5542488 6.7686653 3.9552116-.2168427 6.9857121-3.5991383 6.7687664-7.5543518-.2169438-3.9552116-3.5991383-6.9857121-7.5543499-6.7686653z"
                  fill="url(#SVGID_3_)"
                  opacity=".4"
                />
                <path
                  d="m22.8419628 12.6818066-3.8897476.5269832-.5365143 3.8993378-.5365734-3.8993378-3.8897467-.5269832 3.8993369-.5269251.5269832-3.9088679.5269241 3.9088679z"
                  fill="#fff"
                />
                <g>
                  <path
                    d="m18.415123 19.7430916-3.4500122 11.5700073 10.8099975 18.5-11.9699707-19.289978 2.9899903-12.1800537-7.9299927-6.8899546 10.5699463 5.8699961 14.6900024 1.2699585 10-7.1399546-9.5499878 8.289979z"
                    fill="#9df"
                  />
                </g>
              </g>
            </svg>
            <text x="45" y="30" textAnchor="end" fill="white" style={{ fontSize: "12px" }}>
              40
            </text>
            <text x="50" y="50" textAnchor="end" fill="white" style={{ fontSize: "10px" }}>
              You won
            </text>
          </svg>

          <div style={{ height: 10 }}></div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: dimensions.width,
              height: "20%",
              backgroundColor: "blue",
              borderRadius: 4,
            }}
          >
            <span style={{ fontSize, color: "white" }}>Collect</span>
          </div>
        </>
      )}
    </div>
  );
};

export default RewardIcon;