import React, { Component } from 'react'
import Header from './components/Header'
import Board from './components/Board'
import './reset.css'
import './App.css'

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      active: 'w',
      castling: 'KQkq',
      enPassantTarget: [],
      halfMoveClock: 0,
      fullMoveClock: 1
    }
    this.uniUpdate = this.uniUpdate.bind(this)
  }
  uniUpdate( val, key ) {
    this.setState( {
      [key]: val
    })
  }
  render() {
    return (
      <div className="App flex center col">
        <Header />
        <Board
          fen={this.state.fen}
          update={this.uniUpdate}
        />
      </div>
    )
  }
}