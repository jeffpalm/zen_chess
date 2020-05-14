import React, { Component } from 'react'
import Header from './components/Header'
import './App.css'

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render() {
    return (
      <div className="App flex center col">
        <Header />
      </div>
    )
  }
}