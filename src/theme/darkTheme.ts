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
    borderStrong: colors.dark.outline.strong,
    highlighted: colors.dark.functional.select,
    text: colors.dark.text.main,
    strongText: colors.dark.text.strong,
    warning: colors.dark.functional.attention,
    danger: colors.dark.danger.main,
    weak: colors.dark.text.weak,
    select: colors.dark.functional.select,
    link: colors.dark.functional.link,
    brandBlue: colors.brand.bg[1],
    brandRed: colors.brand.bg[2],
    avatarBg: colors.dark.bg[5],
  },
  dashboard: {
    bg: colors.dark.bg[2],
    itemBg: colors.dark.bg[3],
    projectName: colors.dark.text.strong,
    projectDescription: colors.dark.text.strong,
    publicationStatus: colors.dark.text.main,
    heroButtonText: colors.dark.text.main,
    heroButtonTextHover: colors.dark.text.strong,
  },
  buttonPrimary: {
    bgHover: colors.dark.primary.main,
    color: colors.dark.primary.main,
    colorHover: colors.dark.text.strong,
    disabled: colors.dark.primary.weakest,
  },
  buttonSecondary: {
    bgHover: colors.dark.secondary.main,
    color: colors.dark.secondary.main,
    colorHover: colors.dark.other.white,
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
    accent2: colors.dark.functional.select,
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
    published: colors.dark.functional.success,
    unpublished: colors.dark.outline.main,
  },
  leftMenu: {
    bg: colors.dark.bg[2],
    hoverBg: colors.dark.bg[1],
    highlighted: colors.dark.functional.select,
    icon: colors.dark.functional.select,
    text: colors.dark.text.main,
    enabledBg: colors.dark.text.main,
    disabledBg: colors.dark.bg[5],
  },
  projectCell: {
    border: colors.dark.functional.select,
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
    highlight: colors.dark.functional.select,
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
      hoverBg: colors.dark.bg[5],
      bg: colors.dark.bg[4],
      color: colors.dark.text.main,
    },
  },
  slider: {
    background: colors.dark.bg[2],
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
    selectedLayer: colors.dark.functional.select,
    textColor: colors.dark.text.main,
    selectedTextColor: colors.dark.text.strong,
    disableTextColor: colors.dark.text.weak,
    highlight: colors.dark.outline.main,
    bottomBorder: colors.dark.outline.weakest,
  },
  toggleButton: {
    bg: colors.dark.bg[4],
    bgBorder: colors.dark.outline.main,
    toggle: colors.dark.outline.main,
    activeBg: colors.dark.bg[4],
    activeBgBorder: colors.dark.outline.main,
    activeToggle: colors.dark.outline.main,
    highlight: colors.dark.outline.strong,
  },
  descriptionBalloon: {
    bg: colors.dark.bg[5],
    textColor: colors.dark.text.main,
    shadowColor: colors.dark.bg[1],
  },
  other: {
    black: colors.dark.other.black,
    white: colors.dark.other.white,
  },
  pluginList: {
    bg: colors.dark.bg[3],
  },
  notification: {
    errorBg: colors.dark.functional.error,
    warningBg: colors.dark.functional.attention,
    infoBg: colors.dark.functional.notice,
    successBg: colors.dark.functional.success,
    text: colors.dark.text.strong,
  },
  alignSystem: {
    blueBg: colors.brand.blue.strongest50,
    blueHighlight: colors.brand.blue.strongest,
    orangeBg: colors.brand.orange.main50,
    orangeHighlight: colors.brand.orange.main,
  },
};

export default darkTheme;
