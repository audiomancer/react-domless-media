<p align="center"> 
<a href="#"><img src="https://user-images.githubusercontent.com/39003780/40459621-b33df2e4-5f02-11e8-9eec-38409dba4801.png" /></a>
</p>

# Media query container component for React, with no extra DOM nodes!

[![npm package](https://img.shields.io/badge/npm-v1.1.0-blue.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/react-domless-media)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg?longCache=true&style=flat-square)](https://en.wikipedia.org/wiki/MIT_License)

## Introduction

The goal of react-domless-media is to provide DOM-transparent css media query container for react.js. It is not creating any DOM nodes on its own, thus it does not disturb already existing styling.

**How does it work?**

Instead of creating its own DOM node and applying css styles to it, it applies them to all immediate DOM nodes of all provided react components, if they have any. When react fragment is provided as a prop, it recursively extracts children components first, until immediate DOM nodes are found. This causes:

a) All components provided as `matching` would receive `display: none !important` if given media query conditions would **not** be met.
a) All components provided as `nonMatching` would receive `display: none !important` if given media query conditions **would** be met.


**What can be passed as component props?**

React-domless-media accepts statically or dynamically generated single or multiple react components or react fragments as props. It would not break if due to dynamic application logic, all would be temporary removed.

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
You must provide at least one react component as either matching or nonMatching prop, examples below. Remember to wrap multiple components in `React.Fragment`!

```jsx
import DOMLessMedia from './DOMLessMedia.js'

<DOMLessMedia
	media={'LARGE'}
	matching={<DesktopMenu menuItems={menuItems} />}
/>
```
In the example above, `DesktopMenu` component would be displayed only in `screen and (min-width: 1024px)`.

```jsx
import DOMLessMedia from './DOMLessMedia.js'

<DOMLessMedia
	media={'MICRO'}
	matching={<LogotypeSmall />}
	nonMatching={<LogotypeBig />}
/>
```
In the example above, `LogotypeSmall` component would be displayed only in `screen and (max-width: 400px)`, otherwise `LogotypeBig` would be displayed.

```jsx
import DOMLessMedia from './DOMLessMedia.js'

<DOMLessMedia
	media={'MICRO'}
	matching={
		<React.Fragment>
			<DesktopMenu menuItems={menuItems} />
			<SearchDesktop />
			<LoginDesktop />
		</React.Fragment>
		}
/>
```
In the example above, all children of `DOMLessMedia` component would be displayed only in `screen and (min-width: 1024px)`. Remember to wrap multiple components in `React.Fragment`!
