import React, {Component} from 'react'

export default class Homepage extends Component {
  constructor() {
    super()
    this.state = {
      username: ''
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
    event.preventDefault()
    localStorage.setItem('username', this.state.username)
    this.props.history.push('/gameroomfinder')
  }
  render() {
    return (
      <div className="play-card" >
        <img src={window.location.origin + '/scrooble-logo.png'} className="logo" />
        <form className="homepage-form" onSubmit={this.handleSubmit}>
          <label htmlFor="username">Player Name</label>
          <br />
          <input
            name="username"
            type="text"
            value={this.state.username}
            onChange={this.handleChange}
            className="form-input"
            required
          />
          <br />
          <button className="btn" type="submit">Play Now</button>
        </form>
      </div>
    )
  }
}
