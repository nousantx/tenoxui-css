import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setupJSDOM, createStyler } from './utils/init'
import { parseClassName } from '../src/lib/classNameParser'
import { merge, transformClasses } from '@nousantx/someutils'
import { hover, unHover, screenSize } from './utils/event'

describe('Value handler and applying styles', () => {
  let element: HTMLElement
  let useStyles: (config?: any) => ReturnType<typeof createStyler>

  beforeEach(() => {
    setupJSDOM()
    element = document.createElement('div')
    element.className = 'my-element'
    document.body.appendChild(element)
    useStyles = (config = {}) => createStyler(element, config)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('should parse classes', () => {
    const styler = useStyles({
      classes: {
        display: {
          flex: 'flex'
        }
      }
    })
    styler.applyMultiStyles('flex')
    expect(element.style.display).toBe('flex')
  })
  it('should handle new feature "multi-words" value', () => {
    const styler = useStyles({
      property: {
        d: 'display',
        bg: 'background',
        text: 'color',
        bc: 'borderColor',
        bgr: '--bgr'
      },
      values: {
        'two-words': 'blue',
        'maybe-three-words': 'red',
        'more-than-two-words': 'green',
        'more-than-two-words-heh': 'yellow'
      }
    })
    styler.applyMultiStyles(
      'd-inline-block bg-maybe-three-words text-two-words bc-more-than-two-words bgr-more-than-two-words-heh'
    )
    expect(element.style.display).toBe('inline-block')
    expect(element.style.color).toBe('blue')
    expect(element.style.background).toBe('red')
    expect(element.style.borderColor).toBe('green')
    expect(element.style.getPropertyValue('--bgr')).toBe('yellow')
  })

  it('should create custom css property from class', () => {
    const styler = useStyles({
      property: {
        tx: 'color',
        bga: 'background',
        bgbc: ['backgroundColor', 'borderColor'],
        bgi: {
          property: ['backgroundImage', '--other-url'],
          value: 'url({0})'
        }
      },

      values: {
        primary: '#ccf654',
        size: 'calc(10rem - 20px)'
      }
    })

    const newClass = parseClassName('[color]-1px', styler.property)

    expect(newClass[1]).toBe('[color]')

    styler.applyMultiStyles(
      '[tx,bga]-black [--m-color,bgbc]-red [--url,bgi]-[/img/i.png] [-webkit-animation]-$anim'
    )

    expect(element.style.color).toBe('black')
    expect(element.style.borderColor).toBe('red')
    expect(element.style.background).toBe('black')
    expect(element.style.backgroundColor).toBe('red')
    expect(element.style.backgroundImage).toBe('url(/img/i.png)')
    expect(element.style.getPropertyValue('--other-url')).toBe('url(/img/i.png)')
    expect(element.style.getPropertyValue('--url')).toBe('/img/i.png')
    expect(element.style.getPropertyValue('--m-color')).toBe('red')
    expect(element.style['-webkit-animation']).toBe('var(--anim)')
  })

  it('should handle value transformation correctly', () => {
    const styler = useStyles({
      property: {
        bg: 'background'
      },
      // create custom alias for values
      values: {
        primary: '#ccf654',
        size: 'calc(10rem - 20px)',
        vred: '255 0 0',
        'my-size': '20px + 20rem',
        bg: {
          primary: '#548ff6'
        }
      }
    })

    expect(
      styler.create['computeValue'].valueHandler(
        '',
        parseClassName('[color]-primary', styler.property)[2],
        ''
      )
    ).toBe('#ccf654')

    expect(
      styler.create['computeValue'].valueHandler(
        '',
        parseClassName('bg-blue', styler.property)[2],
        ''
      )
    ).toBe('blue')

    expect(
      styler.create['computeValue'].valueHandler(
        '',
        parseClassName('bg-$my-background', styler.property)[2],
        ''
      )
    ).toBe('var(--my-background)')

    expect(
      styler.create['computeValue'].valueHandler(
        '',
        parseClassName('bg-[--c-primary]', styler.property)[2],
        ''
      )
    ).toBe('var(--c-primary)')

    expect(
      styler.create['computeValue'].valueHandler(
        '',
        parseClassName('bg-[var(--c-primary)]', styler.property)[2],
        ''
      )
    ).toBe('var(--c-primary)')

    expect(
      styler.create['computeValue'].valueHandler(
        '',
        parseClassName('bg-[rgb(221_183_124_/_0.3)]', styler.property)[2],
        ''
      )
    ).toBe('rgb(221 183 124 / 0.3)')

    /**
     * Should replace value inside `{}` eith value from `values`
     */
    expect(
      styler.create['computeValue'].valueHandler(
        '',
        parseClassName('[color]-[rgb({vred})]]', styler.property)[2],
        ''
      )
    ).toBe('rgb(255 0 0)')
    expect(
      styler.create['computeValue'].valueHandler(
        '',
        parseClassName('[padding]-[calc({my-size})]]', styler.property)[2],
        ''
      )
    ).toBe('calc(20px + 20rem)')
  })

  /**
   * Handle style transformation from its rules.
   * Apply direct style to the element
   */

  it('should apply styles as default styler to the element directly', () => {
    const styler = useStyles()

    styler.create.computeValue.setDefaultValue('background', 'red')
    styler.create.computeValue.setDefaultValue(['paddingLeft', 'paddingRight'], '1rem')
    styler.create.computeValue.setDefaultValue('--color', 'blue')
    styler.create.computeValue.setDefaultValue(['--color1', '--color2'], 'yellow')

    expect(element.style.background).toBe('red')
    expect(element.style.paddingLeft).toBe('1rem')
    expect(element.style.paddingRight).toBe('1rem')
    expect(element.style.getPropertyValue('--color')).toBe('blue')
    expect(element.style.getPropertyValue('--color1')).toBe('yellow')
    expect(element.style.getPropertyValue('--color2')).toBe('yellow')
  })

  it('should set css variable to the element', () => {
    const styler = useStyles()

    styler.create.computeValue.setStyle('--size', '1rem')
    styler.create.computeValue.setStyle('--color', 'blue')
    styler.create.computeValue.setStyle('--gradient', 'linear-gradient(to right, red, blue)')

    expect(element.style.getPropertyValue('--size')).toBe('1rem')
    expect(element.style.getPropertyValue('--color')).toBe('blue')
    expect(element.style.getPropertyValue('--gradient')).toBe(
      'linear-gradient(to right, red, blue)'
    )
  })

  it('should apply custom value to the element', () => {
    const styler = useStyles()

    styler.create.computeValue.setCustomValue({ property: 'background', value: '{0}' }, 'red') // _ only red
    styler.create.computeValue.setCustomValue(
      { property: 'backgroundImage', value: 'url(/{0}.svg)' },
      'tenoxui'
    ) // => url(/tenoxui.svg)
    styler.create.computeValue.setCustomValue(
      { property: 'padding', value: '10px {0} 20px {0}' },
      '2rem'
    ) // => 10px 2rem 20px 2rem

    expect(element.style.background).toBe('red')
    expect(element.style.backgroundImage).toBe('url(/tenoxui.svg)')
    expect(element.style.padding).toBe('10px 2rem 20px 2rem')
  })

  /**
   * TenoxUI main styler test.
   * Using `styler.addStyle` method, testing its behavior for applying the styles -
   * based on type (a.k.a property's shorthand), value, unit, and -
   * property's key for custom values and classes.
   */
  it('should apply styles using main styler', () => {
    const styler = useStyles({
      property: {
        text: 'color',
        bg: 'background',
        p: 'padding',
        td: 'textDecorationColor',
        myImg: {
          property: 'backgroundImage',
          value: 'url(/{0}.png)'
        }
      },
      values: {
        prim: 'rgb(100, 97, 223)'
      },
      classes: {
        backgroundColor: {
          primary: '#ccf654',
          tx: 'blue'
        },
        borderColor: {
          'bdr-blue': 'blue'
        }
      }
    })

    // create regular styles
    styler.create['styler'].addStyle('text', 'red')
    styler.create['styler'].addStyle('p', '10', 'rem')

    // css variable class name
    styler.create['styler'].addStyle('[--color]', 'blue')

    // custom value property class name
    styler.create['styler'].addStyle('myImg', 'tenoxui') // => url(/tenoxui.png)

    // handle custom values className
    styler.create['styler'].addStyle('td', 'prim')

    // create custom classes
    // get value from custom classes
    const customValue = (classname) =>
      styler.classes[styler.create['parseStyles'].getParentClass(className)][className]

    let className = 'primary'
    styler.create['styler'].addStyle(
      className,
      customValue(className),
      '',
      '',
      '',
      'backgroundColor'
    )
    className = 'bdr-blue'
    styler.create['styler'].addStyle(className, customValue(className), '', '', '', 'borderColor')

    expect(element.style.color).toBe('red')
    expect(element.style.padding).toBe('10rem')
    expect(element.style.textDecorationColor).toBe('rgb(100, 97, 223)')
    expect(element.style.backgroundImage).toBe('url(/tenoxui.png)')
    expect(element.style.getPropertyValue('--color')).toBe('blue')
    expect(element.style.backgroundColor).toBe('rgb(204, 246, 84)')
    expect(element.style.borderColor).toBe('blue')
  })

  it('should apply styles on hover event', () => {
    const styler = useStyles({
      property: {
        bg: 'background',
        text: 'color'
      }
    })

    styler.applyMultiStyles('bg-red text-black hover:bg-blue hover:text-white')

    // hover element
    hover(element)
    expect(element.style.background).toBe('blue')
    expect(element.style.color).toBe('white')

    // unhover element
    unHover(element)
    expect(element.style.background).toBe('red')
    expect(element.style.color).toBe('black')
  })

  it('should apply correct styles from defined classes', () => {
    const styler = useStyles({
      classes: merge(
        transformClasses({
          btn: {
            color: 'red',
            backgroundColor: 'blue'
          }
        }),
        {
          backgroundColor: {
            tenox: 'red',
            primary: '#ccf654'
          },
          borderRadius: {
            'radius-md': '6px'
          }
        }
      )
    })

    styler.applyMultiStyles('btn radius-md')

    expect(element.style.color).toBe('red')
    expect(element.style.background).toBe('blue')
    expect(element.style.borderRadius).toBe('6px')
  })

  it('should apply hover on defined classes', () => {
    const styler = useStyles({
      classes: transformClasses({
        btn: {
          color: 'red',
          backgroundColor: 'blue'
        },
        'btn-primary': {
          color: 'purple',
          backgroundColor: 'white'
        }
      })
    })

    styler.applyMultiStyles('btn hover:btn-primary')

    hover(element)
    expect(element.style.color).toBe('purple')
    expect(element.style.background).toBe('white')
    unHover(element)
    expect(element.style.color).toBe('red')
    expect(element.style.background).toBe('blue')
  })
  it('should apply aliases', () => {
    const styler = useStyles({
      property: {
        bg: 'background',
        text: 'color',
        p: 'padding',
        d: 'display'
      },
      aliases: {
        btn: 'bg-red p-1rem d-flex [align-items,justify-content]-center [width,height]-200px'
      }
    })
    styler.applyStyles('btn')
    expect(element.style.background).toBe('red')
    expect(element.style.padding).toBe('1rem')
    expect(element.style.display).toBe('flex')
    expect(element.style.alignItems).toBe('center')
    expect(element.style.justifyContent).toBe('center')
    expect(element.style.width).toBe('200px')
    expect(element.style.height).toBe('200px')
  })
  it('should reference to other aliases', () => {
    const styler = useStyles({
      property: {
        bg: 'background',
        text: 'color',
        p: 'padding',
        d: 'display'
      },
      aliases: {
        'my-bg': 'bg-red',
        class1: 'my-bg p-1rem d-flex',
        btn: 'class1 [align-items,justify-content]-center [width,height]-200px'
      }
    })
    styler.applyStyles('btn')
    expect(element.style.background).toBe('red')
    expect(element.style.padding).toBe('1rem')
    expect(element.style.display).toBe('flex')
    expect(element.style.alignItems).toBe('center')
    expect(element.style.justifyContent).toBe('center')
    expect(element.style.width).toBe('200px')
    expect(element.style.height).toBe('200px')
  })
  it('should apply classes that has optional value', () => {
    const styler = useStyles({
      classes: {
        '--bg-opacity': {
          bg: '{0} || 1'
        },
        background: {
          bg: 'rgb({0}) || red'
        },
        color: {
          text: 'rgb({0}, {1 | 0}) || yellow'
        },
        borderColor: {
          bdr: 'rgb({0}, {1 | 0}) || blue'
        }
      },
      values: {},
      aliases: {
        'my-bg': 'bg-red',
        class1: 'my-bg p-1rem d-flex',
        btn: 'class1 [align-items,justify-content]-center [width,height]-200px'
      }
    })
    styler.applyMultiStyles('bg-[0,_0,_255] text-[255,_0]/1 bdr-[0,_255]')
    expect(element.style.background).toBe('rgb(0, 0, 255)')
    expect(element.style.color).toBe('rgb(255, 0, 1)')
    expect(element.style.borderColor).toBe('rgb(0, 255, 0)')
  })
  // it("should", () => {const styler = useStyles();styler.create.applyStyles("bg-red");expect(element.style.background).toBe("red");});

  // it("should",()=>{const styler = useStyles({ property: { bg: "background", text: "color", p: "padding" } });expect(element.style.background).toBe("red");})
})
