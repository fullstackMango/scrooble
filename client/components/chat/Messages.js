import React, {Component} from 'react'
import db from '../../../firestore.js'

export default class Messages extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
      messages: [
        [1, 'c00l_username: hello chatroom!!'], // these cannot be objects like {key: 3, message: 'hi'}, in order to render below
        [2, 'otherUzer: um hi']
      ],
      roomNumber: '1',
      chatNumber: '1',
      username: 'mango_fan'
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }
  handleSubmit(event) {
    const userName = this.state.username
    const userAndMessage = `${userName}: ${this.state.message}`
    const nextKey = this.state.messages[this.state.messages.length - 1][0] + 1
    this.setState({
      messages: [...this.state.messages, [nextKey, userAndMessage]],
      message: ''
    })
    event.preventDefault()
    db.settings({
      timestampsInSnapshots: true
    })
    const document = db
      .collection('rooms')
      .doc(this.props.match.params.roomNumber)
      .get()
    const docId = this.props.match.params.roomNumber
    // probably done in outer Room component layer. when you create a room you can set route to room id. create a room (db.collection('rooms').add), when redirect o to room, have it slash room id and push to htat route, so history push to that route. so we'd do this.props.match.params. or, since it's in this.props.match.params anyway if that's how we're doing it, we can just grab that.
    const newMessage = db
      // assign player to room
      .collection('rooms')
      .doc(this.state.roomNumber)
      .collection('chats')
      .add({
        username: this.state.username,
        message: this.state.message
      })
    console.log('newMessage is', newMessage)
  }
  render() {
    // CSS to do:
    // - make username and colon bold
    // - font should be arial or sans-serif and small
    return (
      <div className="chat">
        {this.state.messages.map(userAndMessage => {
          return (
            <div key={userAndMessage[0]}>
              {userAndMessage[1]}
              {'\n'}
            </div>
          )
        })}
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="message"
            value={this.state.message}
            onChange={this.handleChange}
            placeholder="Make guesses here!"
          />
          <button type="Submit">GO</button>
        </form>
      </div>
    )
  }
}
