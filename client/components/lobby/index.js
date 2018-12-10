import React, {Component} from 'react'
import db from '../../../firestore'
import PlayerCard from './PlayerCard'

export default class Lobby extends Component {
  constructor(props) {
    super(props)
    this.state = {
      players: [],
      message: '',
      currentChosenWord: '',
      guessedWord: false,
      score: 0
    }
    // this.chatId = ''
    this.chatBubble = React.createRef()
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
              player.data().message,
              player.data().showBubble
            ])
          })
          if (playerArr.length) {
            await this.setState({
              players: playerArr
            })
          }
          playerArr = []
        })

      await db
        .collection('rooms')
        .doc(this.roomId)
        .onSnapshot(doc => {
          this.setState({
            currentChosenWord: doc.data().chosenWord,
            guessedWord: false
          })
        })
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
    const {myTurn} = this.props
    try {
      if (!myTurn) {
        if (
          this.state.message === this.state.currentChosenWord &&
          !this.state.guessedWord
        ) {
          this.setState({
            guessedWord: true
          })
          await db.doc(`rooms/${this.roomId}/players/${this.username}`).update({
            message: 'GUESSED THE WORD!',
            score: this.state.score + this.props.time * 10
          })
          this.setState({
            score: this.state.score + this.props.time * 10
          })
        } else if (this.state.guessedWord) {
          this.setState({
            message: 'GUESSED THE WORD!'
          })
        } else {
          // actual guess
          await db.doc(`rooms/${this.roomId}/players/${this.username}`).update({
            message: this.state.message
          })
        }
      } else {
        await db.doc(`rooms/${this.roomId}/players/${this.username}`).update({
          message: "I'm drawing!!"
        })
      }
      this.setState({
        message: ''
      })
      await db.doc(`rooms/${this.roomId}/players/${this.username}`).set({
        showBubble: true
      }, {merge:true})
      setTimeout(async () => {
        await db.doc(`rooms/${this.roomId}/players/${this.username}`).set(
          {
            showBubble: false
          },
          {merge: true}
        )
      }, 2000)
    } catch (err) {
      console.log(err)
    }
  }
  render() {
    const allPlayers = this.state.players
    return (
      <React.Fragment>
        <div className="players-title">
          <img src="players.png" />
        </div>
        <div className="circle-left-brown" />
        <div className="circle-right-brown" />
        <div className="clear" />
        <div className="player-cards-container">
          {allPlayers.map(player => {
            return (
              <PlayerCard
                key={player[0]}
                name={player[1]}
                points={player[2]}
                message={player[3]}
                showBubble={player[4]}
              />
            )
          })}
        </div>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="message"
            value={this.state.message}
            onChange={this.handleChange}
            placeholder={
              this.props.myTurn ? 'THOU SHALT NOT GUESS!' : 'Make guesses here!'
            }
            className="input"
          />
          <button className="go-btn" type="submit">
            GO
          </button>
        </form>
      </React.Fragment>
    )
  }
}
