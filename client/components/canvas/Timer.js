'use strict'

import React, {Component} from 'react'
import db from '../../../firestore.js'

export default class Timer extends Component {
  constructor() {
    super()
    this.state = {
      time: 75
    }
    this.countdown = this.countdown.bind(this)
  }
  componentDidMount() {
    this.countdown()
  }
  countdown() {
    setInterval(() => {
      if (this.state.time > 0) {
        this.setState({
          time: --this.state.time
        })
      }
    }, 1000)
  }
  render() {
    return <div className="timer-text">{this.state.time}</div>
  }
}
