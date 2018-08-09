// this would be the 'game' componnet
// for now at least, it will simply redirect to the correct :roomId (the correct game room)

import React, {Component} from 'react'
import db from '../../../firestore.js'

export default class Game extends Component {
  async componentDidMount() {
    try {
      const rooms = await db.collection('rooms').get()
      if (rooms.size) {
        let notFullRooms = []
        await db
          .collection('rooms')
          .where('isFull', '==', false)
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(room => {
              notFullRooms.push(room.id)
            })
          })
          .catch(err => {
            console.log('Error getting documents: ', error)
          })
        this.props.history.push(`/${notFullRooms[0]}`)
      } else {
        const room = await db.collection('rooms').add({
          isFull: false,
          playerCount: 1,
          isPrivate: false
        })
        console.log('room is', room)
        console.log('room.data is', room.data)
        this.props.history.push(`/${room.id}`)
      }
    } catch (err) {
      console.log(err)
    }
  }
  render() {
    return <div>This is the Game component. Have console open.</div>
  }
}
