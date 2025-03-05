<p align="center">
  <a href="https://tenoxui.web.app/">
    <img src="https://tenoxui.web.app/img/tenoxui.svg" alt="TenoxUI Logo" width='300' height='300'
 >
  </a>
</p>
<h1 align="center">TenoxUI v0.12.0</h1>
<p align="center">
  Very lightweight and easy to configure, utility-first CSS framework.
  <br>
  <a href="https://tenoxui.web.app/docs/start">Documentation</a>
</p>

## Installation

Using npm:

```bash
npm i tenoxui --save-dev
```

Using CDN :

```html
<script src="https://cdn.jsdelivr.net/npm/tenoxui@latest/dist/js/tenoxui.min.js"></script>
```

## Start a Project

### HTML :

```html
<!doctype html>
<html>
  <head>
    <title>TenoxUI</title>
    <script src="https://cdn.jsdelivr.net/npm/tenoxui"></script>
  </head>
  <body>
    <h1 class="text-#ccf654 fs-4rem">Hello World!</h1>
    <script>
      tenoxui({ text: 'color', fs: 'fontSize' })
    </script>
  </body>
</html>
```

### React :

```jsx
import { useLayoutEffect } from 'react'
import tenoxui from 'tenoxui'

const App = () => {
  useLayoutEffect(() => {
    // add tenoxui
    tenoxui({ text: 'color', fs: 'fontSize' })
  }, [])

  return <h1 className="text-#ccf654 fs-4rem">Hello World!</h1>
}

export default App
```

## Types and Properties

TenoxUI also provide a library of defined types and properties that you can use without defining it one by one. You can add the `property` to your project using CDN or install it using npm :

```html
<script src="https://cdn.jsdelivr.net/npm/@tenoxui/property"></script>
```

Or :

```sh
npm i tenoxui @tenoxui/property
```

```jsx
import tenoxui from 'tenoxui'
import property from '@tenoxui/property'
```

### Usage example

```html
<script>
  tenoxui(property)
</script>
```

Or ReactJS :

```jsx
import { useLayoutEffect } from 'react'
import tenoxui from 'tenoxui'
import property from '@tenoxui/property'

const App = () => {
  useLayoutEffect(() => {
    // add tenoxui
    tenoxui(property) // use tenoxui property
  }, [])

  return <h1 className="tc-red">Hello World!</h1>
}

export default App
```

You can see all types and properties on [GitHub Repository](https://github.com/tenoxui/property) or [Here](https://tenoxui.github.io/property).

#### Other Packages

- [tenoxui/core](https://github.com/tenoxui/core)
- [tenoxui/css](https://github.com/tenoxui/css)
- [tenoxui/website](https://github.com/tenoxui/website)
- [tenoxui/property](https://github.com/tenoxui/property)
- [tenoxui/react](https://github.com/tenoxui/react)
- [tenoxui/styles](https://github.com/tenoxui/styles)
- [tenoxui/cli](https://github.com/tenoxui/cli)
- [tenoxui/components](https://github.com/tenoxui/components)
