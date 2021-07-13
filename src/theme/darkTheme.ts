import colors from "./colors";
import { Theme, commonTheme } from "./theme";

const darkTheme: Theme = {
  ...commonTheme,
  main: {
    accent: colors.dark.primary.main,
    alert: colors.dark.functional.error,
    bg: colors.dark.bg[5],
    lighterBg: colors.dark.bg[3],
    paleBg: colors.dark.bg[4],
    deepBg: colors.dark.bg[2],
    deepestBg: colors.dark.bg[1],
    transparentBg: colors.general.transparentBlack,
    lightTransparentBg: colors.general.transparentLight,
    border: colors.dark.outline.weak,
    highlighted: colors.dark.brand.main,
    text: colors.dark.text.main,
    strongText: colors.dark.text.strong,
    warning: colors.dark.functional.attention,
    danger: colors.dark.danger.main,
    weak: colors.dark.text.weak,
    select: colors.dark.functional.select,
  },
  dashboard: {
    bg: colors.dark.bg[2],
    itemBg: colors.dark.bg[3],
    itemTitle: colors.dark.text.main,
    projectName: colors.dark.text.strong,
    projectDescription: colors.dark.text.strong,
    publicationStatus: colors.dark.text.main,
    memberName: colors.dark.text.main,
  },
  buttonPrimary: {
    bgHover: colors.dark.primary.strong,
    color: colors.dark.primary.main,
    colorHover: colors.dark.text.strong,
    disabled: colors.dark.primary.weakest,
  },
  buttonSecondary: {
    bgHover: colors.dark.secondary.main,
    color: colors.dark.secondary.main,
    colorHover: colors.dark.other.black,
    disabled: colors.dark.secondary.weakest,
  },
  buttonDanger: {
    bgHover: colors.dark.danger.main,
    color: colors.dark.danger.main,
    colorHover: colors.dark.other.white,
    disabled: colors.dark.danger.weakest,
  },
  infoBox: {
    accent: colors.dark.primary.main,
    accent2: colors.dark.brand.main,
    alert: colors.dark.functional.error,
    bg: colors.dark.bg[3],
    deepBg: colors.dark.bg[2],
    headerBg: colors.dark.bg[5],
    mainText: colors.dark.text.main,
    weakText: colors.dark.text.weak,
    border: colors.dark.outline.main,
  },
  publishStatus: {
    building: colors.dark.functional.error,
    published: colors.dark.brand.main,
    unpublished: colors.dark.outline.main,
  },
  leftMenu: {
    bg: colors.dark.bg[2],
    hoverBg: colors.dark.bg[1],
    highlighted: colors.dark.brand.main,
    icon: colors.dark.brand.main,
    text: colors.dark.text.main,
    enabledBg: colors.dark.text.main,
    disabledBg: colors.dark.bg[5],
  },
  projectCell: {
    border: colors.dark.brand.main,
    bg: colors.dark.bg[2],
    shadow: colors.dark.bg[1],
    text: colors.dark.text.strong,
    divider: colors.dark.outline.weakest,
    title: colors.dark.text.strong,
    description: colors.dark.text.main,
  },
  assetCard: {
    bg: colors.dark.bg[4],
    bgHover: colors.dark.bg[5],
    highlight: colors.dark.brand.main,
    text: colors.dark.text.main,
    textHover: colors.dark.text.strong,
    shadow: colors.dark.bg[1],
  },
  assetsContainer: {
    bg: colors.dark.bg[4],
  },
  modal: {
    overlayBg: colors.dark.bg[1],
    bodyBg: colors.dark.bg[2],
    innerBg: colors.dark.bg[3],
  },
  tabArea: {
    bg: colors.dark.bg[1],
    selectedBg: colors.dark.bg[2],
    text: colors.dark.text.strong,
  },
  header: {
    bg: colors.dark.bg[4],
    text: colors.dark.text.main,
  },
  primitiveHeader: {
    bg: colors.dark.bg[1],
  },
  statusText: {
    color: colors.dark.text.strong,
  },
  text: {
    default: colors.dark.text.main,
    pale: colors.dark.outline.main,
  },
  selectList: {
    border: colors.dark.outline.main,
    bg: colors.dark.bg[5],
    container: {
      bg: colors.dark.bg[5],
    },
    control: {
      bg: colors.dark.bg[5],
    },
    input: {
      color: colors.dark.text.main,
    },
    menu: {
      bg: colors.dark.bg[5],
    },
    option: {
      bottomBorder: colors.dark.text.main,
      hoverBg: colors.dark.bg[4],
      bg: colors.dark.bg[5],
      color: colors.dark.text.main,
    },
  },
  slider: {
    border: colors.dark.primary.main,
    handle: colors.dark.primary.main,
    track: colors.dark.primary.main,
  },
  properties: {
    accent: colors.dark.primary.main,
    bg: colors.dark.bg[3],
    deepBg: colors.dark.bg[2],
    border: colors.dark.outline.weak,
    focusBorder: colors.dark.outline.main,
    contentsFloatText: colors.dark.text.main,
    contentsText: colors.dark.text.main,
    titleText: colors.dark.text.strong,
    text: colors.dark.text.weak,
  },
  layers: {
    bg: colors.dark.bg[4],
    paleBg: colors.dark.bg[5],
    deepBg: colors.dark.bg[2],
    hoverBg: colors.dark.bg[4],
    smallText: colors.dark.text.main,
    selectedLayer: colors.dark.brand.main,
    textColor: colors.dark.text.main,
    selectedTextColor: colors.dark.text.strong,
    disableTextColor: colors.dark.text.weak,
    bottomBorder: colors.dark.outline.weakest,
  },
  toggleButton: {
    bg: colors.dark.bg[4],
    bgBorder: colors.dark.outline.main,
    toggle: colors.dark.outline.main,
    activeBg: colors.dark.bg[4],
    activeBgBorder: colors.dark.brand.main,
    activeToggle: colors.dark.brand.main,
  },
  descriptionBalloon: {
    bg: colors.dark.bg[5],
    textColor: colors.dark.text.main,
    shadowColor: colors.dark.bg[1],
  },
  other: {
    black: colors.dark.other.black,
  },
  pluginList: {
    bg: colors.dark.bg[3],
  },
};

export default darkTheme;
