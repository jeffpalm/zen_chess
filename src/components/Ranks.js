import React, { Component } from 'react'

export default class Ranks extends Component {
    generate() {
        let output = []
        for ( let i = 1; i < 9; i++ ) {
            output.push(
                <div className="Rank-marker flex mid markers" key={i}>
                    {i}
                </div>
            )
        }
        return output.reverse()
    }
    render() {
        return (
            <div className="Ranks flex col">
                {this.generate()}
            </div>
        )
    }
}