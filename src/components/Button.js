import React from 'react'

// Props to pass
// 1) fn = onClick function
// 2) className = classNames
// 3) text = text to display

const Button = props => {
	const { className, fn, text } = props
	return (
		<button className={ className } onClick={fn}>
			{text}
		</button>
	)
}

export default Button
