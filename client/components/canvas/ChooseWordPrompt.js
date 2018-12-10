import React, {Component, Fragment} from 'react'
import db from '../../../firestore.js'

export default class ChooseWordPrompt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      threeWords: [],
      roomId: localStorage.getItem('room')
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  async componentDidMount() {
    try {
      const response = await db
        .collection('words')
        .doc('words')
        .get()
      const words = await response.data()
      const wordsArray = Object.values(words)
      const assureUnequalWords = () => {
        const firstWord =
          wordsArray[0][Math.floor(Math.random() * wordsArray[0].length)]
        const secondWord =
          wordsArray[0][Math.floor(Math.random() * wordsArray[0].length)]
        const thirdWord =
          wordsArray[0][Math.floor(Math.random() * wordsArray[0].length)]
        if (
          firstWord !== secondWord &&
          secondWord !== thirdWord &&
          thirdWord !== firstWord
        ) {
          this.setState({
            threeWords: [[1, firstWord], [2, secondWord], [3, thirdWord]]
          })
          // then, eliminate these three words from possible words for this game (i.e. for this room)! --> what if out of words? then all words come back.
          // all the words should be pushed to the room in some way, and then eliminated as users go through. keep in mind there are only 345 words.
        } else {
          assureUnequalWords()
        }
      }
      assureUnequalWords()
    } catch (err) {
      console.log(err)
    }
  }
  async handleSubmit(word) {
    try {
      event.preventDefault()
      await db
        .collection('rooms')
        .doc(this.state.roomId)
        .update({
          chosenWord: word
        })
      this.props.handleChosenWord()
    } catch (err) {
      console.log(err)
    }
  }
  render() {
    return (
      <div className="choose-word-card">
        <div className="choose-word-text">
          <div>
            Choose one of these words to draw!
            <div className="choose-buttons-margin">
              {this.state.threeWords.map(word => {
                return (
                  <div>
                    <button
                      className="choose-word-button"
                      key={word[0]}
                      type="submit"
                      onClick={() => this.handleSubmit(word[1])}
                    >
                      {word[1]}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          <div>{this.state.time}</div>
        </div>
      </div>
    )
  }
}
