import * as React from 'react'
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

			this.matchStart = React.createRef()
			this.matchEnd = React.createRef()

			this.mismatchStart = React.createRef()
			this.mismatchEnd = React.createRef()

			this.markerStyle = {
				visibility: 'hidden',
				display: 'none'
			}

			this.state = {
				markers: true
			}
		}

		shouldComponentUpdate(nextProps, nextState) {
			return (
				this.props.match !== nextProps.match ||
				this.props.mismatch !== nextProps.mismatch ||
				this.state.markers !== nextState.markers
			)
		}

		render() {
			return (
				<React.Fragment>
					{this.state.markers && (
						<span
							ref={this.matchStart}
							style={this.markerStyle}
							hidden
							aria-hidden="true"
						/>
					)}
					{this.props.match}
					{this.state.markers && (
						<span
							ref={this.matchEnd}
							style={this.markerStyle}
							hidden
							aria-hidden="true"
						/>
					)}

					{this.state.markers && (
						<span
							ref={this.mismatchStart}
							style={this.markerStyle}
							hidden
							aria-hidden="true"
						/>
					)}
					{this.props.mismatch}
					{this.state.markers && (
						<span
							ref={this.mismatchEnd}
							style={this.markerStyle}
							hidden
							aria-hidden="true"
						/>
					)}
				</React.Fragment>
			)
		}

		applyClasses = () => {
			function getNextSiblings(el, limiter) {
				var sibs = []
				while ((el = el.nextElementSibling) && el !== limiter) {
					sibs.push(el)
				}
				return sibs
			}

			const classHandler = (group, groupName) => {
				group.forEach(el => {
					el.classList.add(
						`domlessMedia-${hash}-${groupName}-${this.props.media}`
					)
				})
			}

			if (this.props.match) {
				const matched = getNextSiblings(
					this.matchStart.current,
					this.matchEnd.current
				)
				classHandler(matched, 'matches')
			}

			if (this.props.mismatch) {
				const mismatched = getNextSiblings(
					this.mismatchStart.current,
					this.mismatchEnd.current
				)
				classHandler(mismatched, 'mismatches')
			}
		}

		componentDidMount() {
			this.applyClasses()
			this.setState({ markers: false })
		}

		componentDidUpdate(prevProps) {
			if (
				this.props.match !== prevProps.match ||
				this.props.mismatch !== prevProps.mismatch
			) {
				this.setState({ markers: true })
			}

			if (this.state.markers) {
				this.applyClasses()
				this.setState({ markers: false })
			}
		}
	}
}
