import PlayerCard from './PlayerCard'
import React, {Component} from 'react'
import db from '../../../firestore'

export default class Lobby extends Component {
  constructor() {
    super()
    this.state = {
      players: [],
      message: ''
    }
    // this.chatId = ''
    this.roomId = location.pathname.slice(1)
    this.username = localStorage.getItem('username')
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  async componentDidMount() {
    try {
      let playerArr = []
      let idx = this.state.players.length
      await db
        .collection('rooms')
        .doc(this.roomId)
        .collection('players')
        .onSnapshot(async querySnapshot => {
          querySnapshot.forEach(player => {
            idx++
            playerArr.push([
              idx,
              player.data().username,
              player.data().score,
              player.data().message
            ])
          })
          if (playerArr.length) {
            await this.setState({
              players: playerArr
            })
          }
          playerArr = []
        })

      // const chatInstanceInfo = await db
      //   .collection('rooms')
      //   .doc(this.roomId)
      //   .collection('chats')
      //   .get()
      // this.chatId = chatInstanceInfo.docs[0].id
    } catch (err) {
      console.log(err)
    }
  }
  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }
  async handleSubmit(event) {
    event.preventDefault()
    try {
      await db.doc(`rooms/${this.roomId}/players/${this.username}`).update({
        message: this.state.message
      })
      this.setState({
        message: ''
      })
    } catch (err) {
      console.log(err)
    }
  }
  render() {
    const allPlayers = this.state.players
    return (
      <React.Fragment>
        {allPlayers.map(player => {
          return (
            <div className="playercard" key={player[0]}>
              <PlayerCard
                name={player[1]}
                score={player[2]}
                message={player[3]}
              />
            </div>
          )
        })}
        <div>username said "this"</div>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="message"
            value={this.state.message}
            onChange={this.handleChange}
            placeholder="Make guesses here!"
            className="input"
          />
          <button type="submit">GO</button>
        </form>
      </React.Fragment>
    )
  }
}

// import PlayerCard from './PlayerCard'
// import React, {Component} from 'react'
// import db from '../../../firestore'

// export default class Lobby extends Component {
//   constructor() {
//     super()
//     this.roomId = location.pathname.slice(1)
//     this.state = {
//       players: []
//     }
//   }
//   async componentDidMount() {
//     let playerArr = []
//     const players = await db
//       .collection('rooms')
//       .doc(this.roomId)
//       .collection('players')
//       .get()
//       .then(querySnapshot => {
//         querySnapshot.forEach(player => {
//           playerArr.push(player.data().username)
//         })
//       })
//       .catch(err => {
//         console.log('Error geting documents: ', err)
//       })
//     this.setState({
//       players: playerArr
//     })
//   }
//   render() {
//     const allPlayers = this.state.players
//     return (
//       <React.Fragment>
//         {allPlayers.map((player, idx) => {
//           return (
//             <div className="playercard" key={idx}>
//               <PlayerCard name={player[1]} score={player[2]} />
//             </div>
//           )
//         })}
//       </React.Fragment>
//     )
//   }
// }
