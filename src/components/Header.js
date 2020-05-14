import React, { Component } from 'react'

export default class Header extends Component {
    render() {
        return (
            <nav className="nav-bar flex around mid">
                <h2 className="logo">Chess</h2>
                <div className="flex center nav-link-cont">
                    <button className="nav-link btn">New Game</button>
                </div>
            </nav>
        )
    }
}