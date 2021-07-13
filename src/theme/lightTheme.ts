import colors from "./colors";
import { Theme, commonTheme } from "./theme";

const lightheme: Theme = {
  ...commonTheme,
  main: {
    accent: colors.light.primary.main,
    alert: colors.light.functional.error,
    bg: colors.light.bg[5],
    lighterBg: colors.light.bg[3],
    paleBg: colors.light.bg[4],
    deepBg: colors.light.bg[2],
    deepestBg: colors.light.bg[1],
    transparentBg: colors.general.transparentBlack,
    lightTransparentBg: colors.general.transparentLight,
    border: colors.light.outline.weak,
    highlighted: colors.light.brand.main,
    text: colors.light.text.main,
    strongText: colors.light.text.strong,
    warning: colors.light.functional.attention,
    danger: colors.light.danger.main,
    weak: colors.light.text.weak,
    select: colors.light.functional.select,
  },
  dashboard: {
    bg: colors.light.bg[2],
    itemBg: colors.light.bg[3],
    itemTitle: colors.dark.text.main,
    projectName: colors.dark.text.strong,
    projectDescription: colors.dark.text.strong,
    publicationStatus: colors.dark.text.main,
    memberName: colors.dark.text.main,
  },
  buttonPrimary: {
    bgHover: colors.light.primary.strong,
    color: colors.light.primary.main,
    colorHover: colors.light.text.strong,
    disabled: colors.light.primary.weakest,
  },
  buttonSecondary: {
    bgHover: colors.light.secondary.main,
    color: colors.light.secondary.main,
    colorHover: colors.light.other.black,
    disabled: colors.light.secondary.weakest,
  },
  buttonDanger: {
    bgHover: colors.light.danger.main,
    color: colors.light.danger.main,
    colorHover: colors.light.other.white,
    disabled: colors.light.danger.weakest,
  },
  infoBox: {
    accent: colors.light.primary.main,
    accent2: colors.light.brand.main,
    alert: colors.light.functional.error,
    bg: colors.light.bg[3],
    deepBg: colors.light.bg[2],
    headerBg: colors.light.bg[5],
    mainText: colors.light.text.main,
    weakText: colors.light.text.weak,
    border: colors.light.outline.main,
  },
  publishStatus: {
    building: colors.light.functional.error,
    published: colors.light.brand.main,
    unpublished: colors.light.outline.main,
  },
  leftMenu: {
    bg: colors.light.bg[2],
    hoverBg: colors.light.bg[1],
    highlighted: colors.light.brand.main,
    icon: colors.light.brand.main,
    text: colors.light.text.main,
    enabledBg: colors.light.text.main,
    disabledBg: colors.light.bg[5],
  },
  projectCell: {
    border: colors.dark.brand.main,
    bg: colors.dark.bg[2],
    shadow: colors.dark.bg[1],
    text: colors.dark.text.strong,
    divider: colors.light.outline.weakest,
    title: colors.dark.text.strong,
    description: colors.dark.text.main,
  },
  assetCard: {
    bg: colors.light.bg[4],
    bgHover: colors.light.bg[5],
    highlight: colors.light.brand.main,
    text: colors.light.text.main,
    textHover: colors.light.text.strong,
    shadow: colors.light.bg[1],
  },
  assetsContainer: {
    bg: colors.light.bg[4],
  },
  modal: {
    overlayBg: colors.light.bg[1],
    bodyBg: colors.light.bg[2],
    innerBg: colors.light.bg[3],
  },
  tabArea: {
    bg: colors.light.bg[1],
    selectedBg: colors.light.bg[2],
    text: colors.light.text.strong,
  },
  header: {
    bg: colors.light.bg[4],
    text: colors.light.text.main,
  },
  primitiveHeader: {
    bg: colors.light.bg[1],
  },
  statusText: {
    color: colors.light.text.strong,
  },
  text: {
    default: colors.light.text.main,
    pale: colors.light.outline.main,
  },
  selectList: {
    border: colors.light.outline.main,
    bg: colors.light.bg[5],
    container: {
      bg: colors.light.bg[5],
    },
    control: {
      bg: colors.light.bg[5],
    },
    input: {
      color: colors.light.text.main,
    },
    menu: {
      bg: colors.light.bg[5],
    },
    option: {
      bottomBorder: colors.light.text.main,
      hoverBg: colors.light.bg[4],
      bg: colors.light.bg[5],
      color: colors.light.text.main,
    },
  },
  slider: {
    border: colors.light.primary.main,
    handle: colors.light.primary.main,
    track: colors.light.primary.main,
  },
  properties: {
    accent: colors.light.primary.main,
    bg: colors.light.bg[3],
    deepBg: colors.light.bg[2],
    border: colors.light.outline.weak,
    focusBorder: colors.light.outline.main,
    contentsFloatText: colors.light.text.main,
    contentsText: colors.light.text.main,
    titleText: colors.light.text.strong,
    text: colors.light.text.weak,
  },
  layers: {
    bg: colors.light.bg[4],
    paleBg: colors.light.bg[5],
    deepBg: colors.light.bg[2],
    hoverBg: colors.light.bg[4],
    smallText: colors.light.text.main,
    selectedLayer: colors.light.brand.main,
    textColor: colors.light.text.main,
    selectedTextColor: colors.light.text.strong,
    disableTextColor: colors.light.text.weak,
    bottomBorder: colors.light.outline.weakest,
  },
  toggleButton: {
    bg: colors.light.bg[4],
    bgBorder: colors.light.outline.main,
    toggle: colors.light.outline.main,
    activeBg: colors.light.bg[4],
    activeBgBorder: colors.light.brand.main,
    activeToggle: colors.light.brand.main,
  },
  descriptionBalloon: {
    bg: colors.light.bg[5],
    textColor: colors.light.text.main,
    shadowColor: colors.light.bg[1],
  },
  other: {
    black: colors.light.other.black,
  },
  pluginList: {
    bg: colors.light.bg[3],
  },
};

export default lightheme;
