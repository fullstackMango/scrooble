import React, {Component} from 'react'
import db from '../../../firestore.js'

export default class UsernameDecider extends Component {
  constructor(props) {
    super(props)
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
        username: finalUsername
      })

      const roomInfo = await db.doc(`rooms/${gameRoomId}`).get()
      const oldTurnOrder = roomInfo.data().turnOrder
      console.log(oldTurnOrder.length)
      if (oldTurnOrder.length > 1) {
        await db.doc(`rooms/${gameRoomId}`).onSnapshot(room => {
          if (room.turnOrder.length !== oldTurnOrder.length) {
            this.props.history.push(`/${gameRoomId}`)
          }
        })
      } else {
        this.props.history.push(`/${gameRoomId}`)
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
    return <div>Next turn starting soon...</div>
  }
}
