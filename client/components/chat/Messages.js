import React, {Component} from 'react'
import db from '../../../firestore.js'

export default class Messages extends Component {
  constructor(props) {
    super(props)
    this.roomId = location.pathname.slice(1)
    this.scroll = React.createRef()
    this.state = {
      message: '',
      messages: [],
      guessedWord: false
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  async componentDidMount() {
    try {
      let allMessages = []
      const {messages} = this.state
      this.listener = await db
        .collection('rooms')
        .doc(this.roomId)
        .collection('chats')
        .onSnapshot(async querySnapshot => {
          querySnapshot.forEach(col => {
            allMessages.push(col.data().username + ': ' + col.data().message)
          })
          if (allMessages.length) {
            await this.setState({
              messages: [...messages, allMessages]
            })
          }
          allMessages = []
        })
    } catch (err) {
      console.log(err)
    }
  }
  // async componentWillUnmount() {
  //   await this.listener.unsubscribe()
  //   await db
  //     .collection('rooms')
  //     .doc(localStorage.getItem('room'))
  //     .collection('players')
  //     .doc(localStorage.getItem('username'))
  //     .delete()
  // }
  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }
  async handleSubmit(event) {
    try {
      event.preventDefault()
      const username = localStorage.getItem('username')
      const roomId = this.roomId
      let {message, messages} = this.state
      if (!this.state.guessedWord) {
        const room = await db
          .collection('rooms')
          .doc(roomId)
          .get()
        const chosenWord = await room.data().chosenWord
        if (message && chosenWord === message.toLowerCase()) {
          // IF CORRECT WORD (making sure not empty string, then making sure same as chosenWord)
          const responsePlayer = await db
            .collection('rooms')
            .doc(roomId)
            .collection('players')
            .doc(username)
            .get()
          const score = await responsePlayer.data().score
          const timeLeft = await room.data().timer
          await db
            .collection('rooms')
            .doc(roomId)
            .collection('players')
            .doc(username)
            .update({
              guessedWord: true,
              score: score + timeLeft * 10
            })
          this.setState({
            messages: [...messages, [`${username} guessed the word!`]],
            message: '',
            guessedWord: true
          })
          const documentNumberResponse = await db
            .collection('rooms')
            .doc(this.roomId)
            .get()
          const documentNumber = documentNumberResponse.data().messageCount
          await db
            .collection('rooms')
            .doc(this.roomId)
            .doc((documentNumber + 1).toString())
            .set({
              username,
              message
            })
          await db
            .collection('rooms')
            .doc(this.roomId)
            .update({
              messageCount: documentNumber + 1
            })
          this.setState({
            messages: [...messages, `${username} guessed the word!`],
            message: ''
          })
          // end of turn, loop through each player and make guessed equal to false
        } else {
          const userAndMessage = `${username}: ${message}`
          const documentNumberResponse = await db
            .collection('rooms')
            .doc(this.roomId)
            .get()
          const documentNumber = documentNumberResponse.data().messageCount
          await db
            .collection('rooms')
            .doc(this.roomId)
            .collection('chats')
            .doc((documentNumber + 1).toString())
            .set({
              username,
              message
            })
          await db
            .collection('rooms')
            .doc(this.roomId)
            .update({
              messageCount: documentNumber + 1
            })
          this.setState({
            messages: [...messages, userAndMessage],
            message: ''
          })
        }
      } else {
        // if they have already guessed and trying to type more during this 'turn'
        this.setState({
          messages: [...messages, `You already guessed the word! 😄`],
          message: ''
        })
        const documentNumberResponse = await db
          .collection('rooms')
          .doc(this.roomId)
          .collection('chats')
          .get()
        const documentNumber = documentNumberResponse.data().messageCount
        await db
          .collection('rooms')
          .doc(this.roomId)
          .collection('chats')
          .doc((documentNumber + 1).toString())
          .set({
            username,
            message
          })
        await db
          .collection('rooms')
          .doc(this.roomId)
          .update({
            messageCount: documentNumber + 1
          })
      }
      this.scroll.current.scrollTop = this.scroll.current.scrollHeight
    } catch (err) {
      console.log(err)
    }
  }
  render() {
    function flatten(arr) {
      var output = []
      for (var i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
          output = output.concat(flatten(arr[i]))
        } else {
          output = output.concat(arr[i])
        }
      }
      return output
    }
    let stateMessages = flatten(this.state.messages)
    return (
      <div className="chat">
        <div className="chat-messages" ref={this.scroll}>
          {stateMessages.map((userAndMessage, idx) => {
            return (
              <div key={idx}>
                {userAndMessage}
                {'\n'}
              </div>
            )
          })}
        </div>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="message"
            value={this.state.message}
            onChange={this.handleChange}
            placeholder="Make guesses here!"
            className="input"
          />
          <button type="Submit">GO</button>
        </form>
      </div>
    )
  }
}
