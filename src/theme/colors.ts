const colors = {
  dark: {
    bg: {
      1: "#070707",
      2: "#171618",
      3: "#232226",
      4: "#2B2A2F",
      5: "#3F3D45",
    },
    text: {
      strong: "#F2F2F2",
      main: "#B4B4B4",
      weak: "#4A4A4A",
    },
    outline: {
      strong: "#D7D7D7" /* Untested/Unused */,
      main: "#A0A0A0",
      weak: "#4A4A4A",
      weakest: "#383838" /* Untested/Unused */,
    },
    primary: {
      strong: "#2AADE9",
      main: "#00A0E8",
      weak: "#008AC8",
      weakest: "#004260" /* Untested/Unused */,
    },
    secondary: {
      main: "#888686" /* Untested/Unused */,
      weak: "#4C4C4C" /* Untested/Unused */,
      weakest: "#3B383F",
    },
    danger: {
      main: "#FF3C53",
      weak: "#B02838" /* Untested/unused */,
      weakest: "#841C28" /* Untested/unused */,
    },
    functional: {
      link: "#3592FF" /* Untested/Unused */,
      success: "#00D1A2" /* Unused */,
      attention: "#D6C71C",
      error: "#FF3C53",
      select: "#3B3CD0" /* Untested/Unused */,
      selectOutline: "#0B9F7E" /* Untested/Unused */,
      notice: "#6E9CD2",
    },
    other: {
      black: "#000000",
      white: "#FFFFFF",
    },
  },
  light: {
    bg: {
      1: "#8C8A8A",
      2: "#B6B6B6",
      3: "#D0D0D0",
      4: "#E0E0E0",
      5: "#FFFCFC",
    },
    text: {
      strong: "#272727",
      main: "#434343",
      weak: "#727070",
    },
    outline: {
      strong: "#0D0D0D",
      main: "#727272",
      weak: "#8B8B8B",
      weakest: "#AAAAAA",
    },
    primary: {
      strong: "#005F94",
      main: "#007CC1",
      weak: "#008AC8",
      weakest: "#74A8BE",
    },
    secondary: {
      main: "#4D4D4D",
      weak: "#8E8E8E",
      weakest: "#A3A3A3",
    },
    danger: {
      main: "#FF3C53",
      weak: "#B02838",
      weakest: "#E0A0A7",
    },
    functional: {
      link: "#0063D8",
      success: "#00D1A2",
      attention: "#E17A00",
      error: "#FF3C53",
      select: "#F57C4B",
      selectOutline: "#0B9F7E" /* Does not exist on light theme */,
      notice: "#6E9CD2",
    },
    other: {
      black: "#000000",
      white: "#FFFFFF",
    },
  },

  general: {
    transparent: "transparent",
    transparentLight: "rgba(0,0,0,0.4)",
    transparentBlack: "rgba(0,0,0,0.7)",
  },
  brand: {
    gradient: "linear-gradient(72.17deg, #df3013 14.04%, #1e2086 86.96%)",
  },
};

export default colors;
