# Media query container component for React, with no extra DOM nodes!

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo

## Introduction

The goal of react-domless-media is to provide DOM-transparent css media query container for react.js. It is not creating any DOM nodes on its own, thus it does not disturb already existing styling.

**How does it work?**

Instead of creating its own DOM node and applying css styles to it, it applies them to all immediate DOM nodes of all provided children, if they have any. When react fragment is provided as a child, it recursively extracts children elements first, until immediate DOM nodes are found. Then, if given media query conditions would **not** be met, all children would receive `display: none !important`.

**What can be passed as children?**

React-domless-media accepts statically or dynamically generated single or multiple react elements, components or react fragments as children. It would not break if due to dynamic application logic, all children would be temporary removed.

**Nesting many react-domless-media components**

Although technically possible, it is considered bad practice and can make a lot of mess.

## Installation

```bash
npm i react-domless-media
```

## Usage

React-domless-media is exporting higher order component as default export so no build-tools are required. In order to work, it requires javascript object with media queries to be passed first to the instance of this higher order component. You can use single or multiple media query objects (each should be provided to individual instance) in case of complex projects involving usage of many react apps simltaneously.

**Media query object**

Media query object must consist of string key - string value pairs. The css part **must** begin with media type (e.g. screen or all) and end with single or multiple logical expressions. Below are the example of proper media query objects.

```javascript
const mediaQueries = {
	LARGE: 'screen and (min-width: 1024px)',
	MEDIUM: 'screen and (max-width: 1023px)',
	SMALL: 'screen and (max-width: 700px)',
	MICRO: 'screen and (max-width: 400px)'
}
```

```javascript
const mediaQueries = {
	MID: 'all and (min-height: 500px) and (max-height: 900px)'
}
```

**Instantiating react-domless-media**

The best practice is to create new .js file with all needed react-domless-media instances and export them.

Single-instance
```javascript
import domlessMedia from 'react-domless-media'

const mediaQueries = {
  LARGE: 'screen and (min-width: 1024px)',
  MEDIUM: 'screen and (max-width: 1023px)',
  SMALL: 'screen and (max-width: 700px)',
  MICRO: 'screen and (max-width: 400px)'
}

const DOMLessMedia = domlessMedia(mediaQueries)
export default DOMLessMedia
```

Multiple instances
```javascript
import domlessMedia from 'react-domless-media'

const mediaQueries = {
  LARGE: 'screen and (min-width: 1024px)',
  MEDIUM: 'screen and (max-width: 1023px)',
  SMALL: 'screen and (max-width: 700px)',
  MICRO: 'screen and (max-width: 400px)'
}

const mediaQueries2 = {
  MID: 'screen and (min-height: 500px) and (max-height: 900px)'
}

export const DOMLessMedia = domlessMedia(mediaQueries)
export const DOMLessMedia2 = domlessMedia(mediaQueries2)
```

**Using in application**

In order to select adequate media query, you must provide it as `media` prop. It must be the exact name of the key of given media property from media queries object of that particular instance.

```jsx
import DOMLessMedia from './DOMLessMedia.js'

<DOMLessMedia media={'LARGE'}>
  <DesktopMenu menuItems={menuItems} />
  <SearchDesktop />
  <LoginDesktop />
</DOMLessMedia>
```
In the example above, all children of `DOMLessMedia` component would be displayed only in `screen and (min-width: 1024px)`.