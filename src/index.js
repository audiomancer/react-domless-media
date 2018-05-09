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

	const hash = hashSum(JSON.stringify(mediaQueries).replace(/\s+/g, ' '))

	return class extends React.Component {
		static propTypes = {
			children: PropTypes.oneOfType([
				PropTypes.arrayOf(PropTypes.element),
				PropTypes.element
			]),
			media: PropTypes.oneOf(Object.keys(mediaQueries)).isRequired
		}

		constructor(props) {
			super(props)

			if (!document.getElementById(`domless_media_${hash}`)) {
				const styles = Object.keys(mediaQueries)
					.map(
						key =>
							`@media not ${
								mediaQueries[key]
							} {.domlessMedia-${hash}-${key} {display: none !important;}} `
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
			return this.props.children !== nextProps.children
		}

		handleProps = () => {
			const wrappedChildren = Array.isArray(this.props.children)
				? this.props.children
				: [this.props.children]

			this.items = (function flattener(arr) {
				return arr.reduce(
					(memo, key) =>
						memo.concat(
							key.type === React.Fragment ? flattener(key.props.children) : key
						),
					[]
				)
			})(wrappedChildren)

			this.selectors = this.items.map(React.createRef)
		}

		render() {
			this.handleProps()
			return (
				<React.Fragment>
					{this.items.map((child, index) => {
						return (
							<SelectorWrapper ref={this.selectors[index]} key={index}>
								{child}
							</SelectorWrapper>
						)
					})}
				</React.Fragment>
			)
		}

		applyClasses = () => {
			this.selectors.forEach(key => {
				const el = ReactDOM.findDOMNode(key.current)
				el && el.classList.add(`domlessMedia-${hash}-${this.props.media}`)
			})
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

	render() {
		return this.props.children
	}

	shouldComponentUpdate(nextProps) {
		return this.props.children !== nextProps.children
	}
}
