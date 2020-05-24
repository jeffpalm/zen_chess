import React, { Component } from 'react'
import Button from './Button'
import Logo from './Logo'
import { render } from '@testing-library/react'

export default class Welcome extends Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	componentDidMount() {
		const logo = document.querySelector('#logo-path')
		const len = logo.getTotalLength()

		logo.style.WebkitTransition = 'none'
		logo.style.strokeDasharray = `${len} ${len}`
		logo.style.strokeDashoffset = len
		logo.getBoundingClientRect()
		logo.style.transition = logo.style.WebkitTransition =
			'stroke-dashoffset 15s ease-in'
		logo.style.strokeDashoffset = '0'
	}
	render() {
		const { start, vis } = this.props
		return (
			<div
				className={`welcome ${vis ? '' : 'welcome-fade-out'}`}
				id='welcome-screen'>
				<div className='welcome-logo-cont'>
					<h1>zen</h1>
					<Logo />
				</div>
				<Button cn='game-sel' fn={start} text='Chill Solo' />
			</div>
		)
	}
}
