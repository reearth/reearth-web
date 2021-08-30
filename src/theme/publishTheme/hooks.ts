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
    if (!seneThemeOptions?.themeType || seneThemeOptions?.themeType === "dark")
      setPublishedTheme(dark);
    if (seneThemeOptions?.themeType === "light") setPublishedTheme(light);
    if (seneThemeOptions?.themeType === "forest") setPublishedTheme(forest);
    if (seneThemeOptions?.themeType === "custom") {
      seneThemeOptions.themeBackgroundColor = seneThemeOptions?.themeBackgroundColor || "#dfe5f0";
      seneThemeOptions.themeTextColor = seneThemeOptions?.themeTextColor || "#434343";
      seneThemeOptions.themeSelectColor = seneThemeOptions?.themeSelectColor || "#C52C63";
      const tinyThemeTextColor = tinycolor(seneThemeOptions.themeTextColor);
      if (isDark(seneThemeOptions?.themeBackgroundColor)) {
        setPublishedTheme({
          mask: "#FFFFFF0D",
          background: seneThemeOptions.themeBackgroundColor,
          mainText: seneThemeOptions.themeTextColor,
          select: seneThemeOptions.themeSelectColor,
          strongIcon: tinyThemeTextColor.lighten(25).toHex8String(),
          strongText: tinyThemeTextColor.lighten(25).toHex8String(),
          weakText: tinyThemeTextColor.setAlpha(tinyThemeTextColor.getAlpha() + 0.5).toHex8String(),
          mainIcon: tinyThemeTextColor.setAlpha(tinyThemeTextColor.getAlpha() + 0.5).toHex8String(),
          weakIcon: tinyThemeTextColor
            .setAlpha(tinyThemeTextColor.getAlpha() + 0.25)
            .toHex8String(),
        });
      } else {
        setPublishedTheme({
          mask: "#0000001A",
          background: seneThemeOptions.themeBackgroundColor,
          mainText: seneThemeOptions.themeTextColor,
          select: seneThemeOptions.themeSelectColor,
          strongIcon: "#FFFFFF",
          strongText: "#FFFFFF",
          weakText: tinyThemeTextColor.setAlpha(tinyThemeTextColor.getAlpha() + 0.5).toHex8String(),
          mainIcon: tinyThemeTextColor.setAlpha(tinyThemeTextColor.getAlpha() + 0.5).toHex8String(),
          weakIcon: tinyThemeTextColor
            .setAlpha(tinyThemeTextColor.getAlpha() + 0.25)
            .toHex8String(),
        });
      }
    }
  }, [seneThemeOptions]);

  return { publishedTheme };
};
