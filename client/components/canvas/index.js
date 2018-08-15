'use strict'

import React, {Component} from 'react'
import db from '../../../firestore.js'

export default class Canvas extends Component {
  constructor() {
    super()

    this.canvasData = []
    this.record = false
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.roomId = location.pathname.slice(1)
    this.username = localStorage.getItem('username')
    this.turnOrderArray = []
    this.drawingDocId = ''
  }
  async componentDidMount() {
    const playersCollectionInfo = await db
      .collection(`rooms/${this.roomId}/players/`)
      .get()
    const turnArray = []
    playersCollectionInfo.forEach(player => turnArray.push(player.id))
    const drawingCollectionInfo = await db
      .collection(`rooms/${this.roomId}/drawings`)
      .get()
    console.log('drawing collection', drawingCollectionInfo.docs)
    if (drawingCollectionInfo.empty) {
      console.log('made it!')
      await db.collection(`rooms/${this.roomId}/drawings`).add({
        canvasData: [],
        turnOrder: [...turnArray],
        wordToGuess: ''
      })
    }
    this.drawingDocId = drawingCollectionInfo.docs[0].id
    const drawingInstance = await db
      .doc(`rooms/${this.roomId}/drawings/${this.drawingDocId}`)
      .get()
    this.turnOrderArray = [...drawingInstance.data().turnOrder]
  }

  drawCanvas(start, end, strokeColor = 'black') {
    const ctx = this.theCanvas.getContext('2d')
    ctx.beginPath()
    ctx.strokeStyle = strokeColor
    ctx.moveTo(...start)
    ctx.lineTo(...end)
    ctx.closePath()
    ctx.stroke()
  }
  handleMouseDown() {
    this.record = true
  }
  handleMouseMove(event) {
    event.persist()
    let myTurn = this.username === this.turnOrderArray[0]
    console.log('TURN, username', myTurn, this.username, this.turnOrderArray[0])
    if (this.record) {
      const latestPoint = {
        x: event.pageX - this.theCanvas.offsetLeft,
        y: event.pageY - this.theCanvas.offsetTop,
        strokeColor: 'black',
        lineWidth: 3,
        lineEnd: false
      }

      this.canvasData.push(latestPoint)

      this.canvasData.forEach((point, idx, arr) => {
        if (idx > 0 && idx < arr.length && arr[idx - 1].lineEnd === false) {
          let startX = arr[idx - 1].x
          let startY = arr[idx - 1].y
          let endX = point.x
          let endY = point.y
          this.drawCanvas(
            [startX, startY],
            [endX, endY],
            point.strokeColor,
            point.lineEnd
          )
        }
      })
    }
  }
  async handleMouseUp() {
    if (this.canvasData.length) {
      let endDraw = this.canvasData[this.canvasData.length - 1]
      endDraw.lineEnd = true
      this.canvasData.push(endDraw)
      await db
        .doc(`rooms/${this.roomId}/drawings/${this.drawingDocId}`)
        .update({
          canvasData: [...this.canvasData]
        })
    }
    this.record = false
  }
  render() {
    return (
      <div
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseOut={this.handleMouseUp}
      >
        <canvas
          ref={canvas => (this.theCanvas = canvas)}
          height={500}
          width={500}
        />
      </div>
    )
  }
}
