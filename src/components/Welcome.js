import React, { Component } from 'react'
import Button from './Button'

export default function Welcome(props) {
	const { start } = props
	return (
		<div className='welcome'>
			<Button cn='game-sel' fn={start} text="New Solo Game" />
		</div>
	)
}
