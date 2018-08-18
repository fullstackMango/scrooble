import PlayerCard from './PlayerCard'
import React, {Component} from 'react'
import db from '../../../firestore'

export default class Lobby extends Component {
  constructor() {
    super()
    this.roomId = location.pathname.slice(1)
    this.state = {
      players: []
    }
  }
  async componentDidMount() {
    try {
      let playerArr = []
      let idx = this.state.players.length
      this.listener = await db
        .collection('rooms')
        .doc(this.roomId)
        .collection('players')
        .onSnapshot(async querySnapshot => {
          querySnapshot.forEach(player => {
            idx++
            playerArr.push([idx, player.data().username, player.data().score])
          })
          if (playerArr.length) {
            await this.setState({
              players: playerArr
            })
          }
          playerArr = []
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
              <PlayerCard name={player[1]} score={player[2]} />
            </div>
          )
        })}
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
