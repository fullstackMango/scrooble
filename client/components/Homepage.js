import React, { Component } from 'react';
import {Link} from 'react-router-dom'
import db from '../../firestore.js'
import { forEach } from '@firebase/util';

export default class Homepage extends Component {
  constructor() {
    super();
    this.state = {
      username: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  componentDidMount(){
    // const snapshot = db.collection('rooms').doc('5J2RcS6VBh9zZSxRnLhW').collection('players')
    // snapshot.get().then(result => {
    //   result.forEach(player=> {
    //     console.log(player.data())
    //   })
    // })
  }
  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }
  handleSubmit(event) {
   event.preventDefault()
    // do the firebase stuff here and then redirect to the game room
    this.props.history.push('/gameroom')
  }
  render() {
    return (
      <div>
        <h1>Scrooble</h1>
        <div>Quick Play</div>
        {/* <Link to="/gameroom">GAMEROOM</Link> */}
        <form onSubmit={this.handleSubmit} >
          <label htmlFor='username' >Player Name</label>
          <input name="username" type='text' placeholder='Enter Name' value={this.state.username} onChange={this.handleChange} />
          <br />
          <button type='submit'>Play Now</button>
        </form>
      </div>
    )
  }
}

