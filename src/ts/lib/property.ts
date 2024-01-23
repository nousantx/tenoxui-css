/*!
 * TenoxUI CSS Framework v0.4.26+ [ https://tenoxui.web.app ]
 * copyright (c) 2024 nousantx
 * licensed under MIT [ https://github.com/nousantx/tenoxui/blob/main/LICENSE ]
 */

interface PropertyMap {
  [key: string]: string[];
}

const property: PropertyMap = {
  // Mapping type and its Property
  p: ["padding"],
  pt: ["paddingTop"],
  pb: ["paddingBottom"],
  pr: ["paddingRight"],
  pl: ["paddingLeft"],
  ph: ["paddingLeft", "paddingRight"],
  pv: ["paddingTop", "paddingBottom"],
  "pad-in-start": ["paddingInlineStart"],
  "pad-in-end": ["paddingInlineEnd"],
  // Margin
  m: ["margin"],
  mt: ["marginTop"],
  mb: ["marginBottom"],
  mr: ["marginRight"],
  ml: ["marginLeft"],
  mv: ["marginTop", "marginBottom"],
  mh: ["marginLeft", "marginRight"],
  "mar-in-start": ["marginInlineStart"],
  "mar-in-end": ["marginInlineEnd"],
  // Text and font
  fs: ["fontSize"],
  fw: ["fontWeight"],
  lh: ["lineHeight"],
  ls: ["letterSpacing"],
  ta: ["text-align"],
  tc: ["color"],
  ts: ["textStyle"],
  td: ["textDecoration"],
  ti: ["textIndent"],
  tn: ["textReansform"],
  ws: ["wordSpacing"],
  family: ["fontFamily"],
  "text-style": ["fontStyle"],
  "white-space": ["whiteSpace"],

  // More Text
  "text-over": ["textOverflow"],
  "text-wrap": ["textWrap"],
  "v-align": ["verticalAlign"],
  "w-break": ["wordBreak"],
  "wrap-over": ["overflowWrap"],
  hyphens: ["hyphens"],
  "text-deco-line": ["textDecorationLine"],
  "text-deco-style": ["textDecorationStyle"],
  "text-deco-thick": ["textDecorationThickness"],
  "text-underline-off": ["textUnderlineOffset"],
  "variant-num": ["font-variant-numeric:"],
  "webkit-font-smooth": ["-webkit-font-smoothing"],
  "moz-font-smooth": ["-moz-osx-font-smoothing"],
  // Positioning
  position: ["position"],
  post: ["position"],
  z: ["zIndex"],
  zi: ["zIndex"],
  t: ["top"],
  top: ["top"],
  b: ["bottom"],
  bottom: ["bottom"],
  r: ["right"],
  right: ["right"],
  l: ["left"],
  left: ["left"],
  // Display
  display: ["display"],
  // Width and Height
  w: ["width"],
  "w-mx": ["maxWidth"],
  "w-mn": ["minWidth"],
  h: ["height"],
  "h-mx": ["maxHeight"],
  "h-mn": ["minHeight"],
  // Columns
  col: ["columns"],
  // Break After
  "bk-af": ["breakAfter"],
  "bk-bef": ["breakBefore"],
  "bk-in": ["breakInside"],
  // Background
  bg: ["background"],
  "bg-attach": ["backgroundAttachment"],
  "bg-origin": ["backgroundOrigin"],
  "bg-size": ["backgroundSize"],
  "bg-clip": ["backgroundClip"],
  "bg-repeat": ["backgroundRepeat"],
  "bg-loc": ["backgroundPosition"],
  "bg-loc-x": ["backgroundPositionX"],
  "bg-loc-y": ["backgroundPositionY"],
  "bg-blend": ["backgroundBlendMode"],
  // Flex
  fx: ["flex"],
  flex: ["flex"],
  "flex-auto": ["flex"],
  "initial-flex": ["flex"],
  "flex-parent": ["justifyContent", "alignItems"],
  fd: ["flexDirection"],
  "fx-wrap": ["flexWrap"],
  "item-order": ["order"],
  order: ["order"],
  "fx-basis": ["flexBasis"],
  "fx-grow": ["flexGrow"],
  "fx-shrink": ["flexShrink"],
  // Grid
  "grid-row": ["gridTemplateRows"],
  "grid-col": ["gridTemplateColumns"],
  "auto-grid-row": ["gridTemplateRows"],
  "auto-grid-col": ["gridTemplateColumns"],
  "grid-item-row": ["gridRow"],
  "grid-item-col": ["gridColumn"],
  "grid-row-end": ["gridRowEnd"],
  "grid-row-start": ["gridRowStart"],
  "grid-col-end": ["gridColumnEnd"],
  "grid-col-start": ["gridColumnStart"],
  "grid-area": ["gridArea"],
  "item-place": ["placeArea"],
  "content-place": ["placeContent"],
  // Gap
  gap: ["gap"],
  "grid-gap": ["gridGap"],
  "grid-row-gap": ["gridRowGap"],
  "grid-col-gap": ["gridColumnGap"],

  "row-gap": ["rowGap"],
  "col-gap": ["columnGap"],
  // Align
  ac: ["alignContent"],
  ai: ["align-items"],
  as: ["alignSelf"],
  // Justify
  jc: ["justify-content"],
  ji: ["justifyItems"],
  js: ["justifySelf"],
  // backdrop [ under developement ]
  "backdrop-blur": ["backdropFilter"],
  // Filter
  filter: ["filter"],
  blur: ["filter"],
  brightness: ["filter"],
  contrast: ["filter"],
  grayscale: ["filter"],
  "hue-rotate": ["filter"],
  saturate: ["filter"],
  sepia: ["filter"],
  opa: ["opacity"],
  // Backdrop Filter
  "back-blur": ["backdropFilter"],
  "back-brightness": ["backdropFilter"],
  "back-contrast": ["backdropFilter"],
  "back-grayscale": ["backdropFilter"],
  "back-saturate": ["backdropFilter"],
  "back-sepia": ["backdropFilter"],
  // Border
  br: ["borderRadius"],
  bw: ["borderWidth"],
  "bw-left": ["borderLeftWidth"],
  "bw-right": ["borderRightWidth"],
  "bw-top": ["borderTopWidth"],
  "bw-bottom": ["borderBottomWidth"],
  bs: ["borderStyle"],
  "radius-tl": ["borderTopLeftRadius"],
  "radius-tr": ["borderTopRightRadius"],
  "radius-bl": ["borderBottomLeftRadius"],
  "radius-br": ["borderBottomRightRadius"],
  "radius-top": ["borderTopLeftRadius", "borderTopRightRadius"],
  "radius-bottom": ["borderBottomLeftRadius", "borderBottomRightRadius"],
  "radius-left": ["borderTopLeftRadius", "borderBottomLeftRadius"],
  "radius-right": ["borderTopRightRadius", "borderBottomRightRadius"],
  "br-ss": ["border-start-start-radius"],
  "br-se": ["border-start-end-radius"],
  "br-ee": ["border-end-end-radius"],
  "br-es": ["border-end-start-radius"],
  "bw-is": ["border-inline-start-width"],
  "bw-ie": ["border-inline-end-width"],
  // Outline
  ol: ["outline"],
  "ol-width": ["outlineWidth"],
  "ol-style": ["outlineStyle"],
  "ol-offset": ["outlineOffset"],
  // Cursor
  curs: ["cursor"],
  cursor: ["cursor"],
  // Overflow
  over: ["overflow"],
  overY: ["overflowY"],
  overX: ["overflowX"],
  // Float
  float: ["float"],
  // Aspect Ratio
  ratio: ["aspectRatio"],
  // Transition

  transition: ["transition"],
  "tr-time": ["transitionDuration"],
  "tr-prop": ["transitionProperty"],
  "tr-timing": ["transitionTimingFunction"],
  "tr-delay": ["transitionDelay"],
  // Transform: for v0.4.6 or higher.
  transform: ["transform"],
  "move-x": ["transform"],
  "move-y": ["transform"],
  "move-z": ["transform"],
  matrix: ["transform"],
  "matrix-3d": ["transform"],
  rt: ["transform"],
  "rt-3d": ["transform"],
  translate: ["transform"],
  scale: ["transform"],
  "scale-3d": ["transform"],
  "scale-x": ["transform"],
  "scale-y": ["transform"],
  "scale-z": ["transform"],
  skew: ["transform"],
  "skew-x": ["transform"],
  "skew-y": ["transform"],
  // List Style
  "list-s-img": ["listStyleImage"],
  "list-s-pos": ["listStylePosition"],
  "list-s-type": ["listStyleType"],
  // More
  "box-sizing": ["boxSizing"], //! need custom value ${value}-box
  isolation: ["isolation"],
  "object-fit": ["objectFit"],
  "object-post": ["objectPosition"],
  // Overscroll Behavior
  "os-beh": ["overscrollBehavior"],
  "os-beh-y": ["overscrollBehaviorY"],
  "os-beh-x": ["overscrollBehaviorX"],
  visibility: ["visibility"],
  // TenoxUI Custom property
  box: ["width", "height"],
};

export default property;
