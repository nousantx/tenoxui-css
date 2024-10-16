import {
  Property,
  Classes,
  DefinedValue,
  GetCSSProperty,
  CSSPropertyOrVariable,
  CSSProperty,
  CSSVariable
} from './types'
import { isObjectWithValue } from '../utils/valueObject'
import { ComputeValue } from './computeValue'

export class StyleHandler {
  private readonly htmlElement: HTMLElement
  private readonly styleAttribute: Property
  private readonly valueRegistry: DefinedValue
  private readonly classes: Classes
  private readonly computeValue: ComputeValue

  constructor(element: HTMLElement, property: Property, values: DefinedValue, classes: Classes) {
    this.htmlElement = element
    this.styleAttribute = property
    this.valueRegistry = values
    this.classes = classes

    this.computeValue = new ComputeValue(this.htmlElement, this.styleAttribute, this.valueRegistry)
  }

  private isInitialLoad: boolean = true

  public addStyle(
    type: string, // shorthand prefixes or class name for Classes
    value?: string,
    unit?: string,
    classProp?: CSSPropertyOrVariable // for Classes css property
  ): void {
    const properties = this.styleAttribute[type]
    const definedClass = this.classes

    // Use className from definedClass or Classes instead
    if (classProp && value && definedClass[classProp]) {
      this.computeValue.setCustomClass(classProp, value)
    }

    // No value included and is custom value property
    // e.g. { myBg: { property: 'background' value: 'blue'} }
    // use as _ <div class="myBg"></div> _ for `background: blue;``
    if (!value && isObjectWithValue(properties)) {
      value = properties.value
    }

    if (!value) return

    const resolvedValue = this.computeValue.valueHandler(type, value, unit || '')

    /**
     * This section will remove `transition` or `transitionDuration` property -
     * when the page loaded. It also ensures the element doesn't create unnecessary -
     * layout shift because tenoxui compute every styles at the same time when -
     * the page loaded.
     */
    if (properties === 'transition' || properties === 'transitionDuration') {
      if (this.isInitialLoad) {
        // Disabling transition at initial load
        this.htmlElement.style.transition = 'none'
        this.htmlElement.style.transitionDuration = '0s'

        // Schedule re-enabling of transitions
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.htmlElement.style.transition = ''
            this.htmlElement.style.transitionDuration = ''
            if (properties === 'transition') {
              this.htmlElement.style.transition = resolvedValue
            } else {
              this.htmlElement.style.transitionDuration = resolvedValue
            }
            this.isInitialLoad = false
          })
        })
      } else {
        // Apply transitions normally after initial load
        if (properties === 'transition') {
          this.htmlElement.style.transition = resolvedValue
        } else {
          this.htmlElement.style.transitionDuration = resolvedValue
        }
      }
      return
    }

    // Other states for applying the style

    // CSS variable className
    if (type.startsWith('[--') && type.endsWith(']')) {
      this.computeValue.setCssVar(type.slice(1, -1) as CSSVariable, resolvedValue)
    }
    // Custom value property handler
    else if (typeof properties === 'object' && 'property' in properties) {
      this.computeValue.setCustomValue(
        properties as { property: GetCSSProperty; value?: string },
        resolvedValue
      )
    }
    // Default value handler
    else if (properties) {
      this.computeValue.setDefaultValue(properties as CSSProperty, resolvedValue)
    }
  }
}
