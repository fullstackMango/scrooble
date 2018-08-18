import React, {Component} from 'react'
import db from '../../firestore'

export default class Winner extends Component {
  constructor() {
    super()
    this.state = {
      winner: ''
    }
  }
  async componentDidMount() {
    try {
      let playerArr = []
      const playerResponse = await db
        .collection('rooms')
        .doc(location.pathname.slice(1))
        .collection('players')
        .get()
      playerResponse.docs.forEach(player => {
        //this.setState({
        // playerData: [
        //   ...this.state.playerData,
        //   [player.data().username, player.data().score]
        // ]
        //})
        playerArr.push([player.data().username, player.data().score])
      })
      console.log('playerArr is', playerArr)
      let highestScore = -Infinity
      let winner = 'placeholder'
      playerArr.forEach(player => {
        console.log('player is', player)
        if (highestScore < player[1]) {
          winner = player[0]
          highestScore = player[1]
        }
      })
      // for (let i = 0; i < playerArr.length; i++) {
      //   let playerItem = playerArr[i]
      //   let player = playerItem[0]
      //   let score = playerItem[1]
      //   console.log('player is', player)
      //   console.log('score is', score)
      //   if (highestScore < score) {
      //     console.log('if loop runs')
      //     winner = player
      //     highestScore = score
      //   }
      // }
      this.setState({winner})
    } catch (err) {
      console.log(err)
    }
  }
  render() {
    const {winner} = this.state
    console.log('winner is', winner)
    return (
      <div className="winner-card">
        <div className="winner-text">{winner} IS THE WINNER</div>
      </div>
    )
  }
}
