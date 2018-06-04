<p align="center"> 
<a href="https://github.com/audiomancer/react-domless-media"><img src="https://user-images.githubusercontent.com/39003780/40459621-b33df2e4-5f02-11e8-9eec-38409dba4801.png" /></a>
</p>

# Media query container component for React, with no extra DOM nodes!

[![npm package](https://img.shields.io/npm/v/react-domless-media.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/react-domless-media)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg?longCache=true&style=flat-square)](https://github.com/audiomancer/react-domless-media/blob/master/LICENSE)

## Introduction

The goal of react-domless-media is to provide DOM-transparent javascript media query container for react.js. It is not creating any DOM nodes on its own, thus it does not disturb already existing styling.

**How does it work?**

a) All components provided as `match` would be rendered if provided conditions **would** be met.

b) All components provided as `mismatch` would be rendered if provided conditions would **not** be met.


**What can be passed as component props?**

React-domless-media accepts statically or dynamically generated single or multiple react components or react fragments as props.

## Installation

```bash
npm i react-domless-media
```

## Usage

React-domless-media is exporting higher order component as default export so no build-tools are required. In order to work, it requires custom javascript object hereinafter referred to as **media query object** to be passed first to the instance of this higher order component. You can use single or multiple media query objects (each should be provided to individual RDM HoC instance) in case of complex projects involving usage of many react apps simltaneously.

**Media query object**

Media quey object must consists of string key - object pairs. Each sub-object must consist of at least one (min or max) property paired with value of desired resolution stored as number. Below are the examples of proper media query objects.

**Min is the direct equivalent of css `min-width` and it works as `>=` and max is the direct equivalent of `max-width` and it works as `<=`**

```javascript
const mediaQueries = {
	LARGE: { min: 1024 },
	MEDIUM: { max: 1023 },
	SMALL: { max: 700 },
	MICRO: { max: 400 }
}
```

```javascript
const mediaQueries = {
	MID: {
		min: 500,
		max: 900
	}
}
```

**Instantiating react-domless-media**

The best practice is to create new .js file with all needed react-domless-media instances and export them.

Single-instance
```javascript
import domlessMedia from 'react-domless-media'

const mediaQueries = {
	LARGE: { min: 1024 },
	MEDIUM: { max: 1023 },
	SMALL: { max: 700 },
	MICRO: { max: 400 }
}

const DOMLessMedia = domlessMedia(mediaQueries)
export default DOMLessMedia
```

Multiple instances
```javascript
import domlessMedia from 'react-domless-media'

const mediaQueries = {
	LARGE: { min: 1024 },
	MEDIUM: { max: 1023 },
	SMALL: { max: 700 },
	MICRO: { max: 400 }
}

const mediaQueries2 = {
	MID: {
		min: 500,
		max: 900
	}
}

export const DOMLessMedia = domlessMedia(mediaQueries)
export const DOMLessMedia2 = domlessMedia(mediaQueries2)
```

**Using in application**

In order to select adequate media query, you must provide it as `media` prop. It must be the exact name of the key of given media property from media queries object of that particular instance.
You must provide at least one react component as either match or mismatch prop, examples below. Remember to wrap multiple components in `React.Fragment`!

```jsx
import DOMLessMedia from './DOMLessMedia.js'

<DOMLessMedia
	media={'LARGE'}
	match={<DesktopMenu menuItems={menuItems} />}
/>
```
In the example above, `DesktopMenu` component would be displayed only when `window.innerWidth` would be greater than or equal to a `1024` (pixels).

```jsx
import DOMLessMedia from './DOMLessMedia.js'

<DOMLessMedia
	media={'MICRO'}
	match={<LogotypeSmall />}
	mismatch={<LogotypeBig />}
/>
```
In the example above, `LogotypeSmall` component would be displayed only when `window.innerWidth` would be less than or equal to a `400` (pixels), otherwise `LogotypeBig` would be displayed.

```jsx
import DOMLessMedia2 from './DOMLessMedia2.js'

<DOMLessMedia
	media={'MID'}
	match={<LoginDesktop />}
/>
```
In the example above, `LoginDesktop` component would be displayed only when `window.innerWidth` would be greater than or equal to a `500` (pixels) and less than or equal to a `900` (pixels).

```jsx
import DOMLessMedia from './DOMLessMedia.js'

<DOMLessMedia
	media={'MICRO'}
	match={
		<React.Fragment>
			<DesktopMenu menuItems={menuItems} />
			<SearchDesktop />
			<LoginDesktop />
		</React.Fragment>
		}
/>
```
In the example above, all children of `DOMLessMedia` component would be displayed only when `window.innerWidth` would be greater than or equal to a `1024` (pixels). Remember to wrap multiple components in `React.Fragment`!
