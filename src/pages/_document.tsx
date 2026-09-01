import { Head, Html, Main, NextScript } from "next/document";

const BODY_BACKGROUND = "hsl(40 100% 98%)";
const FOREGROUND = "hsl(0 0% 3.9%)";

export default function Document() {
  return (
    <Html
      lang="en"
      style={{
        backgroundColor: BODY_BACKGROUND,
        color: FOREGROUND,
      }}
    >
      <Head />
      <body
        style={{
          backgroundColor: BODY_BACKGROUND,
          color: FOREGROUND,
        }}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
