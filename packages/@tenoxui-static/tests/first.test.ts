import { describe, it, expect, beforeEach } from 'vitest'
import { TenoxUI, type TenoxUIParams } from '../src/index.ts'

describe('TenoxUI Static CSS Test', () => {
  let tenoxui: TenoxUI
  let stylesheet: string

  describe('Test Only ', () => {
    it('should initialize with empty parameters', () => {
      const ui = new TenoxUI({
        property: {
          'space-x': {
            classNameSuffix: ' > :not(:last-child)',
            property: ['marginInlineStart', 'marginInlineEnd'],
            value: '{0}px'
          },
          bgx: [
            {
              for: 'color',
              syntax: '<value>',
              property: ({ value }) => {
                if (
                  /^([0-9]{1,3}) ([0-9]{1,3}) ([0-9]{1,3})$/.test(value) &&
                  value.split(' ').every((num) => num >= 0 && num <= 255)
                ) {
                  return 'background-color'
                } else return 'background'
              },
              value: ({ value }) => {
                return `rgb(${value})`
              }
            }
          ],
          bg: {
            property: ({ key, value }) => {
              const props = {
                size: 'backgroundSize',
                color: 'backgroundColor',
                clip: 'backgroundClip'
              }

              return props[key] || 'background'
            },

            value: ({ value, key }) => {
              const props = {
                clip: value.includes('text') ? `${value}-box` : value
              }

              return props[key] || value
            }
          },
          ui: ({ key }) => key
        }
      })

      expect(ui).toBeInstanceOf(TenoxUI)
    })

    it('should initialize with provided parameters', () => {
      const config: TenoxUIParams = {
        property: { bg: 'backgroundColor' },
        values: { red: '#ff0000' },
        aliases: { btn: 'bg-blue p-2rem' },
        breakpoints: [{ name: 'sm', min: 640 }],
        reserveClass: ['bg-blue']
      }
      const instance = new TenoxUI(config)
      expect(instance).toBeInstanceOf(TenoxUI)
    })
  })
  describe('Constructor', () => {
    it('should initialize with empty parameters', () => {
      const instance = new TenoxUI()
      expect(instance).toBeInstanceOf(TenoxUI)
    })

    it('should initialize with provided parameters', () => {
      const config: TenoxUIParams = {
        property: { bg: 'backgroundColor' },
        values: { red: '#ff0000' },
        aliases: { btn: 'bg-blue p-2rem' },
        breakpoints: [{ name: 'sm', min: 640 }],
        reserveClass: ['bg-blue']
      }
      const instance = new TenoxUI(config)
      expect(instance).toBeInstanceOf(TenoxUI)
    })
  })

  describe('Case Conversion', () => {
    beforeEach(() => {
      tenoxui = new TenoxUI()
    })

    it('should convert to kebab-case', () => {
      expect(tenoxui.toKebabCase('backgroundColor')).toBe('background-color')
      expect(tenoxui.toKebabCase('borderTopWidth')).toBe('border-top-width')
    })

    it('should handle vendor prefixes in kebab-case', () => {
      expect(tenoxui.toKebabCase('webkitTransform')).toBe('-webkit-transform')
      expect(tenoxui.toKebabCase('mozBorderRadius')).toBe('-moz-border-radius')
    })
    it('should escape special characters in CSS selectors', () => {
      expect(tenoxui.escapeCSSSelector('bg#red')).toBe('bg\\#red')
      expect(tenoxui.escapeCSSSelector('margin.2')).toBe('margin\\.2')
      expect(tenoxui.escapeCSSSelector('[rgb(255_255_10_/_0.5)]')).toBe(
        '\\[rgb\\(255_255_10_\\/_0\\.5\\)\\]'
      )
    })
  })

  describe('Stylesheet Generation', () => {
    it('should generate basic styles', () => {
      const config: TenoxUIParams = {
        property: {
          bg: 'backgroundColor',
          text: 'color',
          box: ['width', 'height']
        },
        values: {
          red: '#ff0000',
          blue: '#0000ff',
          primary: '#ccf654'
        }
      }

      tenoxui = new TenoxUI(config)
      tenoxui.processClassNames([
        'bg-red',
        'text-blue',
        'bg-primary',
        'box-100px',
        'hover:box-200px'
      ])

      stylesheet = tenoxui.generate()
      expect(stylesheet).toContain('.bg-red { background-color: #ff0000 }')
      expect(stylesheet).toContain('.text-blue { color: #0000ff }')
      expect(stylesheet).toContain('.bg-primary { background-color: #ccf654 }')
      expect(stylesheet).toContain('.box-100px { width: 100px; height: 100px }')
      expect(stylesheet).toContain('.hover\\:box-200px:hover { width: 200px; height: 200px }')
    })

    it('should handle media queries', () => {
      const config: TenoxUIParams = {
        property: {
          w: 'width'
        },
        breakpoints: [{ name: 'sm', min: 640 }]
      }

      tenoxui = new TenoxUI(config)
      tenoxui.processClassNames(['sm:w-100px'])

      stylesheet = tenoxui.generate()
      expect(stylesheet).toContain('@media screen and (min-width: 640px)')
      expect(stylesheet).toContain('width: 100px')
    })
  })

  describe('Alias and Utility-Classes Processing', () => {
    it('should process aliases correctly', () => {
      const config: TenoxUIParams = {
        property: {
          bg: 'backgroundColor',
          p: 'padding'
        },
        values: { primary: '#ccf654' },
        classes: {
          'background-color': {
            'new-secondary': '#ccf654'
          },
          margin: {
            'new-secondary': '10px'
          }
        },
        aliases: {
          btn: 'bg-blue p-24px',
          'btn-primary': 'bg-primary',
          'btn-secondary': 'p-10px new-secondary'
        },
        breakpoints: [{ name: 'max-md', max: 768 }]
      }

      const tenoxui = new TenoxUI(config)
      tenoxui.processClassNames(['btn', 'hover:btn-primary', 'max-md:btn', 'btn-secondary'])

      const stylesheet = tenoxui.generate()

      expect(stylesheet).toContain('.btn { background-color: blue; padding: 24px }')
      expect(stylesheet).toContain(
        '.btn-secondary { padding: 10px; background-color: #ccf654; margin: 10px }'
      )
      expect(stylesheet).toContain('.hover\\:btn-primary:hover { background-color: #ccf654 }')
      expect(stylesheet).toContain(`@media screen and (max-width: 768px) {
  .max-md\\:btn { background-color: blue; padding: 24px }
}`)
    })
    it('should process class names from classes correctly', () => {
      const config: TenoxUIParams = {
        classes: {
          'background-color': {
            btn: 'blue',
            'btn-primary': '#ccf654'
          },
          padding: {
            btn: '24px'
          }
        },
        breakpoints: [{ name: 'max-md', max: 768 }]
      }

      const tenoxui = new TenoxUI(config)
      tenoxui.processClassNames(['btn', 'hover:btn-primary', 'max-md:btn'])
      const stylesheet = tenoxui.generate()

      expect(stylesheet).toContain('.btn { background-color: blue; padding: 24px }')
      expect(stylesheet).toContain('.hover\\:btn-primary:hover { background-color: #ccf654 }')
      expect(stylesheet).toContain(`@media screen and (max-width: 768px) {
  .max-md\\:btn { background-color: blue; padding: 24px }
}`)
    })
  })

  // Custom value processing tests
  describe('Value Processing', () => {
    it('should handle CSS variables', () => {
      const config: TenoxUIParams = {
        property: {
          text: 'color',
          p: 'padding'
        },
        values: {
          primary: '#ccf654',
          'my-size': '30px',
          size: '10px',
          p: { size: '20px' }
        }
      }

      tenoxui = new TenoxUI(config)
      tenoxui.processClassNames(['text-$primary'])

      stylesheet = tenoxui.generate()
      expect(stylesheet).toContain('.text-\\$primary { color: var(--primary) }')
      expect(tenoxui.processValue('', 'red')).toBe('red')
      expect(tenoxui.processValue('', '[blue]')).toBe('blue')
      expect(tenoxui.processValue('', '[rgb(255_0_0)]')).toBe('rgb(255 0 0)')
      expect(tenoxui.processValue('', '[--color]')).toBe('var(--color)')
      expect(tenoxui.processValue('', '[calc({my-size}_*_2)]')).toBe('calc(30px * 2)')
      expect(tenoxui.processValue('', '24', 'px')).toBe('24px')
      expect(tenoxui.processValue('', 'size')).toBe('10px')
      expect(tenoxui.processValue('p', 'size')).toBe('20px')
    })

    it('should handle custom values in brackets', () => {
      const config: TenoxUIParams = {
        property: {
          grid: 'grid-template-columns'
        },
        values: {},
        classes: {},
        aliases: {},
        breakpoints: [],
        reserveClass: []
      }

      tenoxui = new TenoxUI(config)
      tenoxui.processClassNames(['grid-[repeat(2,_1fr)]'])

      stylesheet = tenoxui.generate()

      expect(stylesheet).toContain('grid-template-columns: repeat(2, 1fr)')
    })
  })

  describe('Apply Direct Selector', () => {
    beforeEach(() => {})

    it('should generate any styles inside apply field', () => {
      const config: TenoxUIParams = {
        property: { bg: 'backgroundColor', p: 'padding' },
        values: { primary: '#ccf654' },

        apply: {
          SINGLE_RULE: ["@import '...';"],
          ':root': '[color-scheme]-[light_dark] [--dark_btn]-blue',
          body: 'bg-red',
          'div.tx:hover': 'bg-blue',
          '.my-class': {
            '': 'bg-red [color]-blue',
            '&:hover': 'bg-blue'
          },
          '@media (prefers-color-scheme: dark)': {
            ':root': '[--red]-#f00 [color-scheme]-dark [--dark_btn]-blue',
            '.my-second-cls': 'bg-yellow',
            '.my-third-cls': 'bg-primary'
          }
        }
      }

      tenoxui = new TenoxUI(config)
      const stylesheet = tenoxui.generate()

      expect(stylesheet).toContain(':root {\n  color-scheme: light dark; --dark_btn: blue\n}')
      expect(stylesheet).toContain("@import '...';")
      expect(stylesheet).toContain('body {\n  background-color: red\n}')
      expect(stylesheet).toContain(`.my-class {
  background-color: red; color: blue
  &:hover {
    background-color: blue
  }
}`)
      expect(stylesheet).toContain(`@media (prefers-color-scheme: dark) {
  :root {
    --red: #f00; color-scheme: dark; --dark_btn: blue
  }
  .my-second-cls {
    background-color: yellow
  }
  .my-third-cls {
    background-color: #ccf654
  }
}`)
    })
    it('should process queries other than media query', () => {
      const config: TenoxUIParams = {
        property: { bg: 'backgroundColor', p: 'padding' },
        values: { primary: '#ccf654' },
        apply: {
          '@keyframes anim': {
            from: 'bg-red p-1rem',
            to: 'bg-blue p-20px'
          },
          '@keyframes color': {
            '0%, 100%': 'bg-red p-10px',
            '50%': 'bg-blue p-15px'
          },
          '@property --my-color': "[syntax]-['<color>'] [inherits]-false",
          '@layer utilities': {
            main: 'bg-blue'
          }
        }
      }
      tenoxui = new TenoxUI(config)
      const stylesheet = tenoxui.generate()

      expect(stylesheet).toContain(
        `@keyframes anim {
  from {
    background-color: red; padding: 1rem
  }
  to {
    background-color: blue; padding: 20px
  }
}`
      )
      expect(stylesheet).toContain(
        "@property --my-color {\n  syntax: '<color>'; inherits: false\n}"
      )
    })
    it('should process one line query', () => {
      const config: TenoxUIParams = {
        apply: {
          SINGLE_RULE: ["@import '...';", '@layer base, components, utilities;']
        }
      }
      tenoxui = new TenoxUI(config)
      stylesheet = tenoxui.generate()

      expect(stylesheet).toContain("@import '...';")
      expect(stylesheet).toContain('@layer base, components, utilities;')
    })
    it('should apply classes from config.aliases', () => {
      const config: TenoxUIParams = {
        aliases: {
          app__light: '[--neutral-50]-#fff',
          app__dark: '[--neutral-50]-#000'
        },
        apply: {
          ':root': '[color-scheme]-[light_dark] app__light',
          '@media (prefers-color-scheme: dark)': {
            ':root': 'app__dark'
          }
        }
      }
      tenoxui = new TenoxUI(config)
      stylesheet = tenoxui.generate()

      expect(stylesheet).toContain(`:root {
  color-scheme: light dark; --neutral-50: #fff
}`)
      expect(stylesheet).toContain(`@media (prefers-color-scheme: dark) {
  :root {
    --neutral-50: #000
  }
}`)
    })
    it('should apply classes from config.classes', () => {
      const config: TenoxUIParams = {
        property: {
          bg: 'backgroundColor'
        },
        classes: {
          '--bg-opacity': {
            bg: '{1}% || 1'
          },
          backgroundColor: {
            bg: '{0} || red'
          },
          '--neutral-50': {
            app__light: '#fff',
            app__dark: '#000'
          }
        },
        apply: {
          html: 'bg',
          body: 'bg-blue/20',
          ':root': '[color-scheme]-[light_dark] app__light',
          '@media (prefers-color-scheme: dark)': {
            ':root': 'app__dark'
          }
        }
      }
      tenoxui = new TenoxUI(config)
      stylesheet = tenoxui.generate()

      expect(stylesheet).toContain('html {\n  --bg-opacity: 1; background-color: red\n}')
      expect(stylesheet).toContain(`:root {
  color-scheme: light dark; --neutral-50: #fff
}`)
      expect(stylesheet).toContain(`@media (prefers-color-scheme: dark) {
  :root {
    --neutral-50: #000
  }
}`)
    })
  })
  describe('Reserved Classes', () => {
    beforeEach(() => {
      const config: TenoxUIParams = {
        property: {
          bg: 'backgroundColor',
          p: 'padding',
          box: ['width', 'height'],
          bgx: ({ key }) => key,

          'my-pm': {
            property: ['margin', 'padding'],
            value: 'calc({0}px - {1 | 1rem})'
          }
        },
        values: {
          primary: '#ccf654',
          'my-size': '3rem',
          'cst-bg': { hg: '255 0 54' }
        },
        apply: {
          '@layer theme': {
            ':root': 'bg-red'
          }
        },
        classes: {
          '--bg-color': {
            'shl-bg': '{1}% || 100%'
          },
          backgroundColor: {
            'cst-bg': 'rgb({0} / {1 | 100}%) || red',
            'shl-bg': '{0} || red'
          },
          display: {
            flex: 'flex',
            iflex: 'inline-flex',
            hidden: 'none',
            'it-should-block': 'block',
            'my-class': 'flex',
            'tx-ix': 'flex'
          },
          justifyContent: {
            'my-class': 'flex-start'
          },
          padding: {
            'tx-ix': '{0} || 10px'
          }
        },
        breakpoints: [
          {
            name: 'md',
            min: 556,
            max: 768
          }
        ],
        reserveClass: [
          // basic shorthand
          'bg-red',
          'md:bg-red',
          'p-10px',
          'box-170px',
          '[background,--red]-[rgb(var(--color,_255_0_0))]',
          // shorthand with values
          'bg-primary',
          'p-my-size',
          'box-my-size',
          '[margin]-[calc({my-size}_-_2rem)]',
          // classes
          'flex',
          'iflex',
          'my-class',
          'it-should-block',
          'tx-ix-2rem',
          'cst-bg-(255_0_0)/20',
          'cst-bg-[rgb(255_0_0_/_1)]',
          'cst-bg-hg',
          'shl-bg',
          'shl-bg-yellow',
          'shl-bg-blue/20'
        ]
      }

      tenoxui = new TenoxUI(config)
      stylesheet = tenoxui.generate()
    })

    /*it('should process complex shorthand', () => {
      expect(stylesheet).toContain('.border-red { border-color: red }')
      expect(stylesheet).toContain('.border-1 { border-width: 1px }')
      expect(stylesheet).toContain('.border-solid { border-style: solid }')
    })*/
    it('should process basic shorthand', () => {
      expect(stylesheet).toContain('.bg-red { background-color: red }')
      expect(stylesheet).toContain('.p-10px { padding: 10px }')
      expect(stylesheet).toContain('.box-170px { width: 170px; height: 170px }')
      expect(stylesheet).toContain(
        '.\\[background\\,--red\\]-\\[rgb\\(var\\(--color\\,_255_0_0\\)\\)\\] { background: rgb(var(--color, 255 0 0)); --red: rgb(var(--color, 255 0 0)) }'
      )
    })
    it('should process shorthand with value alias', () => {
      expect(stylesheet).toContain('.bg-primary { background-color: #ccf654 }')
      expect(stylesheet).toContain('.p-my-size { padding: 3rem }')
      expect(stylesheet).toContain('.box-my-size { width: 3rem; height: 3rem }')
      expect(stylesheet).toContain(
        '.\\[margin\\]-\\[calc\\(\\{my-size\\}_-_2rem\\)\\] { margin: calc(3rem - 2rem) }'
      )
    })
    it('should process class names from classes', () => {
      expect(stylesheet).toContain('.flex { display: flex }')
      expect(stylesheet).toContain('.my-class { display: flex; justify-content: flex-start }')
      expect(stylesheet).toContain('.iflex { display: inline-flex }')
      expect(stylesheet).toContain('.it-should-block { display: block }')
      expect(stylesheet).toContain('.tx-ix-2rem { display: flex; padding: 2rem }')
      expect(stylesheet).toContain('.shl-bg { --bg-color: 100%; background-color: red }')
      expect(stylesheet).toContain('.shl-bg-yellow { --bg-color: 100%; background-color: yellow }')
      expect(stylesheet).toContain('.shl-bg-blue\\/20 { --bg-color: 20%; background-color: blue }')
      expect(stylesheet).toContain(
        '.cst-bg-\\(255_0_0\\)\\/20 { background-color: rgb(255 0 0 / 20%) }'
      )
      expect(stylesheet).toContain(
        '.cst-bg-\\[rgb\\(255_0_0_\\/_1\\)\\] { background-color: rgb(255 0 0 / 1) }'
      )
      expect(stylesheet).toContain('.cst-bg-hg { background-color: rgb(255 0 54 / 100%) }')
    })
  })
  describe('All Possible Class Names', () => {
    beforeEach(() => {
      const config: TenoxUIParams = {
        property: {
          bg: 'backgroundColor',
          bgc: {
            property: 'backgroundColor',
            value: 'rgb({0})'
          },
          ls: 'letterSpacing',
          p: 'padding',
          box: ['width', 'height'],
          bgi: {
            property: 'backgroundImage',
            value: 'url("{0}")'
          }
        },
        values: {
          primary: '#ccf654',
          'gcx-vx': '255 0 0'
        },

        apply: {
          ':root': '[--red]-#f00',
          body: 'bg-red',
          '@property --myProps': "[syntax]-['<color>'] [inherits]-false",
          '@media screen and (max-width: 500px)': {
            '.tenox': 'bg-red [color]-blue'
          },
          '@media (prefers-color-scheme: dark)': {
            ':root': '[--red]-#00f'
          }
        },
        breakpoints: [{ name: 'md', max: 768 }]
      }
      tenoxui = new TenoxUI(config)
      tenoxui.addStyle('tenox', ['background', 'color', '--tenoxui'], 'blue', 'hover', true)
      tenoxui.addStyle('tenox', ['background', 'color', '--tenoxui'], 'blue', null, true)
      tenoxui.addStyle('body > p', ['background', 'color', '--tenoxui'], 'blue', null)
      tenoxui.processClassNames([
        // regular class mames
        'bg-yellow',
        'bg-primary',
        'box-200px',
        'p-200px',
        'ls--0.015em',
        'bgi-(/v1/image)',
        '[color]-red',
        // prefixed class names
        'hover:bg-red',
        'focus:bg-blue',
        'focus-within:bg-blue',
        'active:bg-blue',
        'before:[content]-[""]',
        'after:bg-blue',
        'md:bg-blue',
        'md:bgc-gcx-vx',
        'md:[--clr,color,bg]-blue',
        // complex class names
        '[background,--red]-[rgb(var(--color,_255_0_0))]',
        'bg-[{primary}]'
      ])
      tenoxui.generate()

      stylesheet = tenoxui.generate()
    })

    it('should handle regular class names correctly', () => {
      expect(stylesheet).toContain('.bg-yellow { background-color: yellow }')
      expect(stylesheet).toContain('.bg-primary { background-color: #ccf654 }')
      expect(stylesheet).toContain('.p-200px { padding: 200px }')
      expect(stylesheet).toContain('.box-200px { width: 200px; height: 200px }')
    })
    it('should handle pseudo-class correctly', () => {
      expect(stylesheet).toContain('.hover\\:bg-red:hover { background-color: red }')
      expect(stylesheet).toContain('.focus\\:bg-blue:focus { background-color: blue }')
      expect(stylesheet).toContain(
        '.focus-within\\:bg-blue:focus-within { background-color: blue }'
      )
      expect(stylesheet).toContain('.active\\:bg-blue:active { background-color: blue }')
    })
    it('should handle pseudo-element correctly', () => {
      expect(stylesheet).toContain('.before\\:\\[content\\]-\\[\\"\\"\\]::before { content: "" }')
      expect(stylesheet).toContain('.after\\:bg-blue::after { background-color: blue }')
    })
    it('should add \\ on some unique letters', () => {
      expect(stylesheet).toContain('.bg-\\[\\{primary\\}\\] { background-color: #ccf654 }')
      expect(stylesheet).toContain(
        '.bgi-\\(\\/v1\\/image\\) { background-image: url("/v1/image") }'
      )
      expect(stylesheet).toContain('.ls--0\\.015em { letter-spacing: -0.015em }')
      expect(stylesheet).toContain(
        '.\\[background\\,--red\\]-\\[rgb\\(var\\(--color\\,_255_0_0\\)\\)\\] { background: rgb(var(--color, 255 0 0)); --red: rgb(var(--color, 255 0 0)) }'
      )
    })
  })

  describe('Multiple properties from single type', () => {
    const ui = new TenoxUI({
      property: {
        bg: ({ key }) =>
          ({
            size: 'backgroundSize',
            color: 'backgroundColor'
          })[key] || 'background',
        bgx: {
          property: ({ key }) =>
            ({
              size: 'backgroundSize',
              color: 'backgroundColor'
            })[key] || 'background',
          value: ({ value, key }) => {
            const values = {
              color: `rgb(${value} / var(--text-opacity))`
            }

            return values[key] || value
          }
        }
      }
    })

    it('should handle property', () => {
      ui.processClassNames(['bg-red', 'bg-(size:cover)', 'bg-(color:rgb(255_0_0_/_0.4))'])
      const stylesheet = ui.generate()
      expect(stylesheet).toContain('.bg-red { background: red }')
      expect(stylesheet).toContain('.bg-\\(size\\:cover\\) { background-size: cover }')
      expect(stylesheet).toContain(
        '.bg-\\(color\\:rgb\\(255_0_0_\\/_0\\.4\\)\\) { background-color: rgb(255 0 0 / 0.4) }'
      )
    })
    it('should handle property, with different value', () => {
      ui.processClassNames(['bgx-red', 'bgx-(size:cover)', 'bgx-(color:255_0_0)'])
      const stylesheet = ui.generate()

      expect(stylesheet).toContain('.bg-red { background: red }')
      expect(stylesheet).toContain('.bg-\\(size\\:cover\\) { background-size: cover }')
      expect(stylesheet).toContain(
        '.bg-\\(color\\:rgb\\(255_0_0_\\/_0\\.4\\)\\) { background-color: rgb(255 0 0 / 0.4) }'
      )
    })
  })
  describe('Conditional Properties', () => {
    const ui = new TenoxUI({
      property: {
        h: {
          property: ({ key }) => {
            const keys = {
              max: 'maxHeight',
              min: 'minHeight'
            }

            return keys[key] || 'height'
          },
          value: ({ value }) => `calc(0.25rem * ${value})`
        },
        border: {
          property: ({ key }) => key || 'border',
          value: ({ property, value, unit }) => {
            if (property === 'border-color') return `rgb(${value} / 1)`
            else return value + unit
          }
        },
        w: {
          property: ({ value, key }) => {
            return 'width'
          },
          value: ({ value, unit }) => {
            return value + unit
          }
        }
      },
      values: {
        full: '100%'
      }
    })
    const stylesheet = ui
      .processClassNames([
        'h-4',
        'h-[max:1rem]',
        'h-(min:5)',
        'h-[min:{full}]',
        'h-full',
        'w-full',
        'w-5rem',
        'w-7',
        'border-1px',
        'border-(border-color:255_0_0)'
      ])
      .generate()

    it('Should create style based on the key', () => {
      expect(stylesheet).toContain('.h-4 { height: calc(0.25rem * 4) }')
      expect(stylesheet).toContain('.h-full { height: calc(0.25rem * 100%) }')
      expect(stylesheet).toContain('.h-\\[min\\:\\{full\\}\\] { min-height: 100% }')
      expect(stylesheet).toContain('.h-\\(min\\:5\\) { min-height: calc(0.25rem * 5) }')
      expect(stylesheet).toContain('.h-\\[max\\:1rem\\] { max-height: 1rem }')
    })
  })
  describe('Direct Styles', () => {
    const ui = new TenoxUI({
      property: {
        'space-x': {
          classNameSuffix: ' > :not(:last-child)',
          property: ['marginInlineStart', 'marginInlineEnd'],
          value: '{0}px'
        },
        border: ({ value, unit }) => {
          return `value:border-style: solid; border-width: ${value || '1'}${unit || 'px'}`
        }
      }
    })
    const stylesheet = ui
      .processClassNames(['border', 'border-2', 'border-3rem', 'space-x-4'])
      .generate()

    it('Should create style based on the key', () => {
      expect(stylesheet).toContain('.border { border-style: solid; border-width: 1px }')
      expect(stylesheet).toContain('.border-2 { border-style: solid; border-width: 2px }')
      expect(stylesheet).toContain('.border-3rem { border-style: solid; border-width: 3rem }')
      expect(stylesheet).toContain('.space-x-4 > :not(:last-child)')
    })
  })

  describe('Direct Rules', () => {
    const ui = new TenoxUI({
      property: {
        hehe: 'background',
        hehe2: { property: 'background', value: '{0}' },
        tx: ({ value }) => {
          const values = {
            'red-500': '55 88 22'
          }

          return `value:--bg-opacity: 1; background: rgb(${
            !value ? '255 0 0' : values[value] || value
          } / var(--bg-opacity))`
        },
        outline: {
          property: ({ value }) =>
            `--bg-opacity: 1; background: rgb(${value ? value : '255 0 0'} / var(--bg-opacity))`,
          value: null
        }
      }
    })
    ui.processClassNames([
      'outline',
      'outline-[24_76_56]',
      'tx',
      'tx-red-500',
      'tx-(43_90_76)',
      'tx-[43_90_76]',
      'hehe-(43_90_76)',
      'hehe-[43_90_76]',
      'hehe2-(43_90_76)',
      'hehe2-[43_90_76]'
    ])
    const stylesheet = ui.generate()

    it('should correctly generate css from direct rules and null value', () => {
      expect(stylesheet).toContain(
        '.outline { --bg-opacity: 1; background: rgb(255 0 0 / var(--bg-opacity)) }'
      )
      expect(stylesheet).toContain(
        '.outline-\\[24_76_56\\] { --bg-opacity: 1; background: rgb(24 76 56 / var(--bg-opacity)) }'
      )
      expect(stylesheet).toContain(
        '.tx { --bg-opacity: 1; background: rgb(255 0 0 / var(--bg-opacity)) }'
      )
      expect(stylesheet).toContain(
        '.tx-red-500 { --bg-opacity: 1; background: rgb(55 88 22 / var(--bg-opacity)) }'
      )
      expect(stylesheet).toContain(
        '.tx-\\(43_90_76\\) { --bg-opacity: 1; background: rgb(43 90 76 / var(--bg-opacity)) }'
      )
      expect(stylesheet).toContain(
        '.tx-\\[43_90_76\\] { --bg-opacity: 1; background: rgb(43 90 76 / var(--bg-opacity)) }'
      )
    })
  })
})
