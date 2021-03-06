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
    borderStrong: colors.light.outline.main,
    highlighted: colors.light.functional.select,
    text: colors.light.text.main,
    strongText: colors.light.text.strong,
    warning: colors.light.functional.attention,
    danger: colors.light.danger.main,
    weak: colors.light.text.weak,
    select: colors.light.functional.select,
    link: colors.light.functional.link,
    brandBlue: colors.brand.bg[1],
    brandRed: colors.brand.bg[2],
    avatarBg: colors.light.bg[6],
  },
  dashboard: {
    bg: colors.light.bg[2],
    itemBg: colors.light.bg[3],
    projectName: colors.dark.text.strong,
    projectDescription: colors.dark.text.strong,
    publicationStatus: colors.dark.text.main,
    heroButtonText: colors.dark.text.main,
    heroButtonTextHover: colors.dark.text.strong,
  },
  buttonPrimary: {
    bgHover: colors.light.primary.main,
    color: colors.light.primary.main,
    colorHover: colors.light.other.white,
    disabled: colors.light.primary.weakest,
  },
  buttonSecondary: {
    bgHover: colors.light.secondary.main,
    color: colors.light.secondary.main,
    colorHover: colors.light.other.white,
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
    accent2: colors.light.functional.select,
    alert: colors.light.functional.error,
    bg: colors.light.bg[3],
    deepBg: colors.light.bg[2],
    headerBg: colors.light.bg[5],
    mainText: colors.light.text.main,
    weakText: colors.light.text.weak,
    border: colors.light.outline.strong,
  },
  publishStatus: {
    building: colors.light.functional.error,
    published: colors.light.functional.success,
    unpublished: colors.light.outline.main,
  },
  leftMenu: {
    bg: colors.light.bg[2],
    hoverBg: colors.light.bg[1],
    highlighted: colors.light.functional.select,
    icon: colors.light.functional.select,
    text: colors.light.text.main,
    enabledBg: colors.light.text.main,
    disabledBg: colors.light.bg[5],
  },
  projectCell: {
    border: colors.dark.functional.select,
    bg: colors.dark.bg[2],
    shadow: colors.dark.bg[1],
    text: colors.dark.text.strong,
    divider: colors.light.outline.weakest,
    title: colors.dark.text.strong,
    description: colors.dark.text.strong,
  },
  assetCard: {
    bg: colors.light.bg[4],
    bgHover: colors.light.bg[5],
    highlight: colors.light.functional.select,
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
      hoverBg: colors.light.bg[5],
      bg: colors.light.bg[4],
      color: colors.light.text.main,
    },
  },
  slider: {
    background: colors.light.bg[2],
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
    selectedLayer: colors.light.functional.select,
    textColor: colors.light.text.main,
    selectedTextColor: colors.light.text.strong,
    disableTextColor: colors.light.text.weak,
    highlight: colors.light.outline.main,
    bottomBorder: colors.light.outline.weakest,
  },
  toggleButton: {
    bg: colors.light.bg[4],
    bgBorder: colors.light.outline.main,
    toggle: colors.light.outline.main,
    activeBg: colors.light.bg[4],
    activeBgBorder: colors.light.outline.main,
    activeToggle: colors.light.outline.main,
    highlight: colors.light.outline.strong,
  },
  descriptionBalloon: {
    bg: colors.light.bg[5],
    textColor: colors.light.text.main,
    shadowColor: colors.light.bg[1],
  },
  other: {
    black: colors.light.other.black,
    white: colors.light.other.white,
  },
  pluginList: {
    bg: colors.light.bg[3],
  },
  notification: {
    errorBg: colors.light.functional.error,
    warningBg: colors.light.functional.attention,
    infoBg: colors.light.functional.notice,
    successBg: colors.light.functional.success,
    text: colors.dark.text.strong,
  },
  alignSystem: {
    blueBg: colors.brand.blue.strongest50,
    blueHighlight: colors.brand.blue.strongest,
    orangeBg: colors.brand.orange.main50,
    orangeHighlight: colors.brand.orange.main,
  },
};

export default lightheme;
