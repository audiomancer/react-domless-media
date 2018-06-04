import * as React from 'react'
import PropTypes from 'prop-types'

export default function domlessMedia(mediaQueries) {
	if (
		typeof mediaQueries !== 'object' ||
		Array.isArray(mediaQueries) ||
		Object.values(mediaQueries).some(
			obj =>
				(!obj.hasOwnProperty('max') && !obj.hasOwnProperty('min')) ||
				Object.values(obj).some(val => typeof val !== 'number')
		)
	) {
		const error = new TypeError('Provided media queries object is not valid.')
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

	return class DOMlessMedia extends React.Component {
		static propTypes = {
			match: oneOfTwo,
			mismatch: oneOfTwo,
			media: PropTypes.oneOf(Object.keys(mediaQueries)).isRequired
		}

		state = {}

		componentDidMount() {
			this.handler()
			window.addEventListener('resize', this.handler)
		}

		handler = () => {
			const min = mediaQueries[this.props.media].min
			const max = mediaQueries[this.props.media].max

			const width = window.innerWidth

			this.setState({
				isMatching: max
					? min
						? width >= min && width <= max
						: width <= max
					: width >= min
			})
		}

		render() {
			return (
				<React.Fragment>
					{this.props[this.state.isMatching ? 'match' : 'mismatch'] || null}
				</React.Fragment>
			)
		}
	}
}
