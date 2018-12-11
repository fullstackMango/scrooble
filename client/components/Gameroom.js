import React, { Component } from 'react'
import db from '../../firestore.js'
// import Chat from './chat'
import Lobby from './lobby'
import Canvas from './canvas'
import { Link } from 'react-router-dom'
// import Timer from './canvas/Timer'
import Winner from './Winner'
import ChooseWordPrompt from './canvas/ChooseWordPrompt.js'
import Hangman from './Hangman'

export default class Gameroom extends Component {
  constructor() {
    super()
    this.state = {
      username: localStorage.getItem('username'),
      canvasData: [],
      someoneWon: false,
      time: 75,
      hasPickedWord: false,
      myTurn: false,
      chosenWord: ''
    }
    this.renderWinner = this.renderWinner.bind(this)
    this.handleChosenWord = this.handleChosenWord.bind(this)
    this.roomId = location.pathname.slice(1)
    this.roomInstanceInfo = ''
    this.roomInstance = ''
    this.leaveGame = this.leaveGame.bind(this)
    this.countdown = this.countdown.bind(this)
  }
  async componentDidMount() {
    this.countdown()
    await db
      .collection('rooms')
      .doc(this.roomId)
      .onSnapshot(doc => {
        if (doc.data().turnOrder[0] === this.state.username) {
          this.setState({
            myTurn: true
          })
        } else {
          this.setState({
            myTurn: false
          })
        }
        this.setState({
          chosenWord: doc.data().chosenWord
        })
      })
    window.onbeforeunload = this.leaveGame
    // The choose word prompt should appear if it's the player's turn (if the player in localstorage matches the first player in the array)
    // at the end of the turn, pop the player from the array
    // how to handle the next turns: componentDidUpdate?
    // also in the componentDidUpdate: getting chat messages from firebase
    // Suggestion: when round is 1 more then a multiple of 3, it's a new round
  }

  leaveGame(event) {
    event.preventDefault()
    db.doc(`rooms/${this.roomId}/players/${this.state.username}`).delete()
    event.returnValue = `\o/`
  }
  countdown() {
    setInterval(() => {
      if (this.state.time >= 0) {
        this.setState({
          time: --this.state.time
        })
      }
      if (this.state.time < 0) {
        this.setState({
          hasPickedWord: false,
          time: 75
        })
      }
    }, 1000)
  }
  handleChosenWord() {
    this.setState({ hasPickedWord: true })
  }
  renderWinner() {
    this.setState({
      someoneWon: true
    })
  }
  render() {
    const { someoneWon, time, canvasData, myTurn, hasPickedWord } = this.state
    return (
      <div className="gameroom-body">
        <div className="navbar">
          <div className="gameroom-logo">
            <img src="logo-small.png" />
          </div>
          <div className="hangman-board">
            <div className="guess-the-word">
              <img src="guess-the-word.png" />
            </div>
            <div className="circle-left" />
            <div className="circle-right" />
            <div className="clear" />
            <Hangman
              chosenWord={this.state.chosenWord}
              time={time}
              myTurn={myTurn}
              className="hangman"
            />
          </div>
          <div className="timer">
            <div className="timer-text">{time}</div>
          </div>
          <div className="clear" />
        </div>
        <div className="gameroom-container clear">
          <div className="lobbybox">
            <Lobby time={time} myTurn={this.state.myTurn} />
          </div>
          <div className="canvas">
            <Canvas
              canvasData={canvasData}
              renderWinner={this.renderWinner}
              history={this.props.history}
              myTurn={this.state.myTurn}
            />
          </div>
          <div className="clear" />
        </div>
        {someoneWon ? <Winner /> : ''}
        {myTurn && !hasPickedWord && !someoneWon ? (
          <ChooseWordPrompt handleChosenWord={this.handleChosenWord} />
        ) : (
          ''
        )}
      </div>
    )
  }
}
