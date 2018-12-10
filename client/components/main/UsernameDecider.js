import React, { Component } from 'react'
import db from '../../../firestore.js'

export default class UsernameDecider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      morePlayers: true
    }
    this.roomId = localStorage.getItem('room')
    this.usernameCheck = this.usernameCheck.bind(this)
  }
  async componentDidMount() {
    try {
      const gameRoomId = localStorage.getItem('room')
      let username = localStorage.getItem('username')
      const finalUsername = await this.usernameCheck(username)
      localStorage.setItem('username', finalUsername)
      await db.doc(`rooms/${gameRoomId}/players/${finalUsername}`).set({
        score: 0,
        myTurn: false,
        guessedWord: false,
        username: finalUsername,
        message: '',
        showBubble: false
      })
      const initialRoomInfo = await db.doc(`rooms/${gameRoomId}`).get()
      await db.doc(`rooms/${this.roomId}`).update({
        waitingRoom: initialRoomInfo.data().waitingRoom + 1 || 1
      })
      const roomInfo = await db.doc(`rooms/${gameRoomId}`).get()
      let waitingRoom = roomInfo.data().waitingRoom
      if (waitingRoom < 2) {
        this.setState({ morePlayers: true })
        await db.doc(`rooms/${this.roomId}`).onSnapshot(room => {
          if (room.data().waitingRoom > 1) {
            this.props.history.push(`/${gameRoomId}`)
          }
        })
      } else {
        this.setState({ morePlayers: false })
        await db.doc(`rooms/${gameRoomId}`).onSnapshot(doc => {
          if (
            doc.data().turnOrder.length !== roomInfo.data().turnOrder.length
          ) {
            this.props.history.push(`/${gameRoomId}`)
          }
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
  async usernameCheck(username) {
    try {
      const gameRoomId = localStorage.getItem('room')
      const playersCollection = await db
        .collection(`rooms/${gameRoomId}/players/`)
        .get()
      const playerArray = []
      playersCollection.forEach(player => playerArray.push(player.id))
      while (playerArray.includes(username)) {
        username = username + Math.floor(Math.random() * 10)
      }
      return username
    } catch (err) {
      console.log(err)
    }
  }
  render() {
    return (
      <React.Fragment>
        {this.state.morePlayers ? (
          <div className="loading-text">Waiting for more players...</div>
        ) : (
          <div className="loading-text">Next turn starting soon...</div>
        )}
        <br />
        <div className="cssload-loader">
          <div className="cssload-inner cssload-one" />
          <div className="cssload-inner cssload-two" />
          <div className="cssload-inner cssload-three" />
        </div>
      </React.Fragment>
    )
  }
}
