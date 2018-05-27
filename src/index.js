import * as React from 'react'
import * as ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import hashSum from 'hash-sum'

export default function domlessMedia(mediaQueries) {
	if (
		typeof mediaQueries !== 'object' ||
		!Object.values(mediaQueries).every(value => typeof value === 'string')
	) {
		const error = new TypeError(
			'Provided media queries object is not valid. Expected object with string keys and string values only.'
		)
		error.stack = error.stack
			.split('\n')
			.slice(2, -1)
			.join('\n')
		throw error
	}

	function oneOfTwo(props, propName, componentName) {
		if (!props.match && !props.mismatch) {
			return new Error(
				`At least one prop \`match\` or \`mismatch\` is required in ${componentName}.`
			)
		} else {
			PropTypes.checkPropTypes(
				{
					match: PropTypes.element,
					mismatch: PropTypes.element
				},
				props,
				'prop',
				componentName
			)
		}
	}

	const hash = hashSum(JSON.stringify(mediaQueries).replace(/\s+/g, ' '))

	return class DOMlessMedia extends React.Component {
		static propTypes = {
			match: oneOfTwo,
			mismatch: oneOfTwo,
			media: PropTypes.oneOf(Object.keys(mediaQueries)).isRequired
		}

		constructor(props) {
			super(props)

			if (!props.match && !props.mismatch) {
				return new Error(`One of 'match' or 'mismatch' is required.`)
			}

			if (!document.getElementById(`domless_media_${hash}`)) {
				const styles = Object.keys(mediaQueries)
					.map(
						key =>
							`@media not ${
								mediaQueries[key]
							} {.domlessMedia-${hash}-matches-${key} {display: none !important;}}
							@media ${
								mediaQueries[key]
							} {.domlessMedia-${hash}-mismatches-${key} {display: none !important;}} `
					)
					.join('')

				this.styleNode = document.createElement('style')
				this.styleNode.type = 'text/css'
				this.styleNode.id = `domless_media_${hash}`
				this.styleNode.innerHTML = styles
				document.getElementsByTagName('head')[0].appendChild(this.styleNode)
			}
		}

		shouldComponentUpdate(nextProps) {
			return (
				this.props.match !== nextProps.match ||
				this.props.mismatch !== nextProps.mismatch
			)
		}

		handler = () => {
			function flattener(arr) {
				return []
					.concat(arr)
					.reduce(
						(memo, node) =>
							node.type === React.Fragment
								? node.props.children
									? memo.concat(flattener(node.props.children))
									: memo
								: typeof node === 'string'
									? memo
									: memo.concat(node),
						[]
					)
			}

			function childWrapper(items, selectors) {
				return items.map((child, index) => (
					<SelectorWrapper ref={selectors[index]} key={index}>
						{child}
					</SelectorWrapper>
				))
			}

			class RnError extends Error {
				constructor(str) {
					super(str)
					this.message = `Failed prop type: Invalid props supplied to \`${str}\`, expected at least one React node.`
				}
			}

			if (this.props.match) {
				this.itemsForMatch = flattener(this.props.match)

				if (this.itemsForMatch.length !== 0) {
					this.matches = this.itemsForMatch.map(React.createRef)
				} else {
					throw new RnError('match')
				}
			}

			if (this.props.mismatch) {
				this.itemsForMismatch = flattener(this.props.mismatch)

				if (this.itemsForMismatch.length !== 0) {
					this.mismatches = this.itemsForMismatch.map(React.createRef)
				} else {
					throw new RnError('mismatch')
				}
			}

			return (
				<React.Fragment>
					{this.props.match && childWrapper(this.itemsForMatch, this.matches)}
					{this.props.mismatch &&
						childWrapper(this.itemsForMismatch, this.mismatches)}
				</React.Fragment>
			)
		}

		render() {
			return this.handler()
		}

		applyClasses = () => {
			const classHandler = (group, groupName) => {
				group.forEach(key => {
					const el = ReactDOM.findDOMNode(key.current)
					el &&
						el.classList.add(
							`domlessMedia-${hash}-${groupName}-${this.props.media}`
						)
				})
			}

			this.matches && classHandler(this.matches, 'matches')
			this.mismatches && classHandler(this.mismatches, 'mismatches')
		}

		componentDidMount() {
			this.applyClasses()
		}

		componentDidUpdate() {
			this.applyClasses()
		}
	}
}

class SelectorWrapper extends React.Component {
	static propTypes = {
		children: PropTypes.element
	}

	shouldComponentUpdate(nextProps) {
		return this.props.children !== nextProps.children
	}

	render() {
		return this.props.children
	}
}
