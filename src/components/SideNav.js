import React, { Component } from 'react'
import Button from './Button'

export default class SideNav extends Component {
	constructor(props) {
		super(props)

		this.state = {
			togClass: ''
		}

		this.navToggle = this.navToggle.bind(this)
	}

	navToggle() {
		const { togClass } = this.state

		if (togClass) {
			this.setState({ togClass: '' })
		} else {
			this.setState({ togClass: 'sn-collapse' })
		}
	}

	render() {
		const { flipFn } = this.props
		return (
			<nav className='SideNav flex'>
				<Button className='sn-toggle-btn po' text='<' fn={this.navToggle} />
				<h1 className="po">zen</h1>
				<Button className='SideNav-btn' text='Do a flip' fn={flipFn} />
			</nav>
		)
	}
}
