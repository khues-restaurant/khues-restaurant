const main = {
  backgroundColor: "#e7e5e4",
  fontFamily:
    '\'Noto Sans\', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

const container = {
  backgroundColor: "#fffdfa",
  margin: "2rem auto",
};

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: "#14522d",
        darkPrimary: "#0f3e22",
        offwhite: "#fffdfa",
      },
    },
  },
};

export { main, container, tailwindConfig };
