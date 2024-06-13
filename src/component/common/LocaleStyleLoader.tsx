import React from "react";
import useLocalization from "service/LocalizationManager";
import { createGlobalStyle } from "styled-components";

interface GlobalStyleProps {
  locale: string;
}

const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&family=ZCOOL+XiaoWei&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap');

  body {
    font-family: ${(props) => {
      switch (props.locale) {
        case "zh-CN":
          return "'ZCOOL QingKe HuangYou', sans-serif";
        case "ja-JP":
          return "'Noto Sans JP', sans-serif";
        case "en-US":
        default:
          return "'Roboto', sans-serif";
      }
    }};
    margin: 0;
    padding: 0;
  }
`;
const LocaleStyleLoader: React.FC = () => {
  const { locale } = useLocalization();
  return (
    <>
      <GlobalStyle locale={locale} />
    </>
  );
};

export default LocaleStyleLoader;
