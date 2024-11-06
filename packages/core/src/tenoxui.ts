import { Classes, Property, MakeTenoxUIParams, Breakpoint, DefinedValue } from './lib/types'
import { createTenoxUIComponents } from './utils/assigner'
import { parseClassName } from './lib/classNameParser'
import { scanAndApplyStyles, setupClassObserver } from './lib/observer'
import { AttributifyHandler } from './lib/attributify'

export class MakeTenoxUI {
  public readonly element: HTMLElement
  public readonly property: Property
  public readonly values: DefinedValue
  public readonly breakpoints: Breakpoint[]
  public readonly classes: Classes
  private attributify: boolean
  private attributifyPrefix: string
  private attributifyIgnore: string[]
  private attributifyHandler: AttributifyHandler | null = null

  constructor({
    element,
    property = {},
    values = {},
    breakpoints = [],
    classes = {},
    attributify = false,
    attributifyPrefix = 'tx-',
    attributifyIgnore = ['style', 'class', 'id', 'src']
  }: MakeTenoxUIParams) {
    this.element = element instanceof HTMLElement ? element : element[0]
    this.property = property
    this.values = values
    this.breakpoints = breakpoints
    this.classes = classes
    this.attributify = attributify
    this.attributifyPrefix = attributifyPrefix
    this.attributifyIgnore = attributifyIgnore

    if (this.attributify) {
      this.initAttributifyHandler()
    }
  }

  private initAttributifyHandler(): void {
    this.attributifyHandler = new AttributifyHandler(
      this,
      this.attributifyPrefix,
      this.attributifyIgnore
    )
  }

  public useDOM(element?: HTMLElement): void {
    const targetElement = element || this.element
    if (!targetElement) return

    const applyStyles = (className: string) => this.applyStyles(className)

    if (targetElement.className) {
      scanAndApplyStyles(applyStyles, targetElement)
      setupClassObserver(applyStyles, targetElement)
    }

    if (this.attributify && this.attributifyHandler) {
      this.handleAttributify(targetElement)
    }
  }

  private handleAttributify(element: Element): void {
    if (!(element instanceof HTMLElement) || !this.attributifyHandler) return

    this.attributifyHandler.processElement(element)
    this.attributifyHandler.observeAttributes(element)
  }

  public applyStyles(className: string, targetElement: HTMLElement = this.element): void {
    const create = this.createComponentInstance(targetElement)
    const { prefix, type } = this.parseStylePrefix(className)

    if (create.parseStyles.handlePredefinedStyle(type, prefix)) return
    if (create.parseStyles.handleCustomClass(type, prefix)) return

    const parts = parseClassName(className, this.property)
    if (!parts) return

    const [parsedPrefix, parsedType, value = '', unit = '', secValue, secUnit] = parts
    create.parseStyles.parseDefaultStyle(parsedPrefix, parsedType, value, unit, secValue, secUnit)
  }

  private createComponentInstance(targetElement: HTMLElement) {
    return createTenoxUIComponents({
      element: targetElement,
      property: this.property,
      values: this.values,
      classes: this.classes,
      breakpoints: this.breakpoints
    })
  }

  private parseStylePrefix(className: string): { prefix?: string; type: string } {
    const [prefix, type] = className.split(':')
    return {
      prefix: type ? prefix : undefined,
      type: type || prefix
    }
  }

  public applyMultiStyles(styles: string, targetElement: HTMLElement = this.element): void {
    styles.split(/\s+/).forEach((style) => this.applyStyles(style, targetElement))
  }

  public enableAttributify(selector = '*'): void {
    if (!this.attributify) {
      this.attributify = true
      this.initAttributifyHandler()
    }

    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => this.handleAttributify(element))

    this.observeNewElements(selector)
  }

  private observeNewElements(selector: string): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.matches(selector)) {
            this.handleAttributify(node)
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
}

export * from './lib/types'
