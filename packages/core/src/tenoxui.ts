import { Classes, Property, Breakpoint, DefinedValue } from './types'
import { createTenoxUIComponents } from './utils/assigner'
import { parseClassName } from './lib/classNameParser'
import { scanAndApplyStyles, setupClassObserver } from './lib/observer'

export interface MakeTenoxUIParams {
  element: HTMLElement
  property?: Property
  values?: DefinedValue
  breakpoints?: Breakpoint[]
  classes?: Classes
}

export type CoreConfig = Omit<MakeTenoxUIParams, 'element'>

export class CreateStyles {
  private styleMap: Map<string, string> = new Map()
  private observers: Map<string, MutationObserver> = new Map()
  private config: CoreConfig
  private styleInstances: Map<HTMLElement, MakeTenoxUI> = new Map()

  constructor(config: CoreConfig) {
    this.config = config
    this.initializeStyleObserver()
  }

  private initializeStyleObserver() {
    // Watch for DOM changes to reapply styles to new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.applyStylesToNewElements(mutation.addedNodes)
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  private applyStylesToNewElements(nodes: NodeList) {
    nodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        this.styleMap.forEach((styles, selector) => {
          if (node.matches(selector) || node.querySelector(selector)) {
            this.applyStylesToElement(selector, styles)
          }
        })
      }
    })
  }

  private createStyleInstance(element: HTMLElement): MakeTenoxUI {
    if (!this.styleInstances.has(element)) {
      const instance = new MakeTenoxUI({
        element,
        ...this.config
      })
      this.styleInstances.set(element, instance)
      return instance
    }
    return this.styleInstances.get(element)!
  }

  private applyStylesToElement(selector: string, styles: string) {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const styleInstance = this.createStyleInstance(element)
        styleInstance.applyMultiStyles(styles)

        // Create observer for class changes on the element
        if (!this.observers.has(selector)) {
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                styleInstance.applyMultiStyles(styles)
              }
            })
          })

          observer.observe(element, {
            attributes: true,
            attributeFilter: ['class']
          })

          this.observers.set(selector, observer)
        }
      }
    })
  }

  public addStyles(styles: Record<string, string>) {
    Object.entries(styles).forEach(([selector, styleString]) => {
      this.styleMap.set(selector, styleString)
      this.applyStylesToElement(selector, styleString)
    })
  }

  public removeStyles(selector: string) {
    const observer = this.observers.get(selector)
    if (observer) {
      observer.disconnect()
      this.observers.delete(selector)
    }
    this.styleMap.delete(selector)
  }

  public updateStyles(styles: Record<string, string>) {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
    this.styleMap.clear()
    this.styleInstances.clear()
    this.addStyles(styles)
  }

  public getAppliedStyles(): Record<string, string> {
    return Object.fromEntries(this.styleMap)
  }
}

export class MakeTenoxUI {
  public readonly element: HTMLElement
  public readonly property: Property
  public readonly values: DefinedValue
  public readonly breakpoints: Breakpoint[]
  public readonly classes: Classes
  public readonly create: ReturnType<typeof createTenoxUIComponents>

  constructor({
    element,
    property = {},
    values = {},
    breakpoints = [],
    classes = {}
  }: MakeTenoxUIParams) {
    this.element = element instanceof HTMLElement ? element : element[0]
    this.property = property
    this.values = values
    this.breakpoints = breakpoints
    this.classes = classes

    this.create = createTenoxUIComponents({
      element: this.element,
      property: this.property,
      values: this.values,
      classes: this.classes,
      breakpoints: this.breakpoints
    })
  }

  public useDOM(element?: HTMLElement): void {
    const targetElement = element || this.element
    if (!targetElement) return

    const applyStyles = (className: string) => this.applyStyles(className)

    if (targetElement.className) {
      scanAndApplyStyles(applyStyles, targetElement)
      setupClassObserver(applyStyles, targetElement)
    }
  }

  public applyStyles(className: string): void {
    const { prefix, type } = this.parseStylePrefix(className)

    if (this.create.parseStyles.handlePredefinedStyle(type, prefix)) return
    if (this.create.parseStyles.handleCustomClass(type, prefix)) return

    const parts = parseClassName(className, this.property)
    if (!parts) return

    const [parsedPrefix, parsedType, value = '', unit = '', secValue, secUnit] = parts
    this.create.parseStyles.parseDefaultStyle(
      parsedPrefix,
      parsedType,
      value,
      unit,
      secValue,
      secUnit
    )
  }

  private parseStylePrefix(className: string): { prefix?: string; type: string } {
    const [prefix, type] = className.split(':')
    return {
      prefix: type ? prefix : undefined,
      type: type || prefix
    }
  }

  public applyMultiStyles(styles: string): void {
    styles.split(/\s+/).forEach((style) => this.applyStyles(style))
  }
}

export * from './types'

export default {
  MakeTenoxUI,
  CreateStyles
}
