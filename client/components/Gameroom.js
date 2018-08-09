import React, {Component} from 'react'
import db from '../../firestore.js'
import {forEach} from '@firebase/util'
import Chat from './chat'
import Lobby from './lobby'

export default class Gameroom extends Component {
  constructor() {
    super()
    this.state = {
      username: localStorage.getItem('username')
    }
  }
  async componentDidMount() {
    console.log('We are in the gameroom')
    // console.log('this.state.username is', this.state.username)
    const snapshot = await db
      .collection('rooms')
      .doc(this.props.match.params.gameroom)
      .collection('players')
      .add({
        score: 0,
        username: this.state.username
      })
    // console.log(snapshot,'this is the snapshot')
  }
  render() {
    return (
      <div>
        <div className="lobbybox">
          <Lobby />
        </div>
        <div className="chatbox">
          <Chat roomId={this.props.match.params.gameroom} />
        </div>
      </div>
    )
  }
}
