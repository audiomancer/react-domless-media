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
		if (!props.matching && !props.nonMatching) {
			return new Error(
				`At least one of \`matching\` or \`nonMatching\` is required in ${componentName}.`
			)
		} else {
			PropTypes.checkPropTypes(
				{
					matching: PropTypes.element,
					nonMatching: PropTypes.element
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
			matching: oneOfTwo,
			nonMatching: oneOfTwo,
			media: PropTypes.oneOf(Object.keys(mediaQueries)).isRequired
		}

		constructor(props) {
			super(props)

			if (!props.matching && !props.nonMatching) {
				return new Error(`One of 'matching' or 'nonMatching' is required.`)
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
				this.props.matching !== nextProps.matching ||
				this.props.nonMatching !== nextProps.nonMatching
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

			if (this.props.matching) {
				this.matchingItems = flattener(this.props.matching)

				if (this.matchingItems.length !== 0) {
					this.matches = this.matchingItems.map(React.createRef)
				} else {
					throw new RnError('matching')
				}
			}

			if (this.props.nonMatching) {
				this.nonMatchingItems = flattener(this.props.nonMatching)

				if (this.nonMatchingItems.length !== 0) {
					this.mismatches = this.nonMatchingItems.map(React.createRef)
				} else {
					throw new RnError('nonMatching')
				}
			}

			return (
				<React.Fragment>
					{this.props.matching &&
						childWrapper(this.matchingItems, this.matches)}
					{this.props.nonMatching &&
						childWrapper(this.nonMatchingItems, this.mismatches)}
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
