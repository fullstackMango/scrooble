import React, { Component } from 'react'
import db from '../../firestore.js'
import { forEach } from '@firebase/util'
import Chat from './chat'

export default class Gameroom extends Component {
  constructor() {
    super();
    this.state = {
      username: ''
    }
  }
  componentDidMount(){
    console.log('We are in the gameroom')
    // const snapshot = db.collection('rooms').doc('5J2RcS6VBh9zZSxRnLhW').collection('players')
    // snapshot.get().then(result => {
    //   result.forEach(player=> {
    //     console.log(player.data())
    //   })
    // })
  }
  render() {
    return (
      <div>
        <Chat />
      </div>
    )
  }
}
