'use strict'

import React, {Component} from 'react'
import db from '../../../firestore.js'

// this file should be obsolete! keeping file just in case.

export default class Timer extends Component {
  constructor() {
    super()
    this.state = {
      time: 15
    }
    //this.countdown = this.countdown.bind(this)
  }
  render() {
    return <div className="timer-text">{this.state.time}</div>
  }
}
