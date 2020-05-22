import React from 'react'

// Props to pass
// 1) fn = onClick function
// 2) className = classNames
// 3) text = text to display

export default function Button(props) {
	const { cn, fn, text } = props
	return (
		<button className={cn} onClick={fn}>
			{text}
		</button>
	)
}
