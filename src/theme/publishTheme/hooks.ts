import { useEffect, useState } from "react";
import tinycolor from "tinycolor2";
import { dark } from "./darkTheme";
import { forest } from "./forestTheme";
import { light } from "./lightTheme";
import { PublishTheme } from "./publishTheme";

export type ReTheme = {
  themeType?: "light" | "dark" | "forest" | "custom";
  themeTextColor?: string;
  themeSelectColor?: string;
  themeBackgroundColor?: string;
};

export default (seneThemeOptions?: ReTheme) => {
  const [publishedTheme, setPublishedTheme] = useState<PublishTheme>(dark);

  const isDark = (hex: string): boolean => tinycolor(hex).isDark();

  useEffect(() => {
    switch (seneThemeOptions?.themeType) {
      case "light":
        setPublishedTheme(light);
        break;
      case "forest":
        setPublishedTheme(forest);
        break;
      default:
        setPublishedTheme(dark);
    }
    if (seneThemeOptions?.themeType === "custom") {
      seneThemeOptions.themeBackgroundColor = seneThemeOptions?.themeBackgroundColor || "#dfe5f0";
      seneThemeOptions.themeTextColor = seneThemeOptions?.themeTextColor || "#434343";
      seneThemeOptions.themeSelectColor = seneThemeOptions?.themeSelectColor || "#C52C63";
      const tinyThemeTextColor = tinycolor(seneThemeOptions.themeTextColor);
      setPublishedTheme({
        mask: isDark(seneThemeOptions?.themeBackgroundColor) ? "#FFFFFF0D" : "#0000001A",
        background: seneThemeOptions.themeBackgroundColor,
        mainText: seneThemeOptions.themeTextColor,
        select: seneThemeOptions.themeSelectColor,
        strongIcon: isDark(seneThemeOptions?.themeBackgroundColor)
          ? tinyThemeTextColor.lighten(25).toHex8String()
          : "#FFFFFF",
        strongText: isDark(seneThemeOptions?.themeBackgroundColor)
          ? tinyThemeTextColor.lighten(25).toHex8String()
          : "#FFFFFF",
        weakText: tinyThemeTextColor.setAlpha(tinyThemeTextColor.getAlpha() + 0.5).toHex8String(),
        mainIcon: tinyThemeTextColor.setAlpha(tinyThemeTextColor.getAlpha() + 0.5).toHex8String(),
        weakIcon: tinyThemeTextColor.setAlpha(tinyThemeTextColor.getAlpha() + 0.25).toHex8String(),
      });
    }
  }, [seneThemeOptions]);

  return { publishedTheme };
};
