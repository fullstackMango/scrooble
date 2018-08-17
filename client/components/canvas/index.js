'use strict'

import React, {Component} from 'react'
import db from '../../../firestore.js'

export default class Canvas extends Component {
  constructor() {
    super()

    this.canvasData = []
    this.record = false
    this.roomId = location.pathname.slice(1)
    this.username = localStorage.getItem('username')
    this.turnOrderArray = []
    this.drawingDocId = ''
    this.time = ''
    this.roomInstanceInfo = ''
    this.color = 'black'
    this.lineWidth = 3

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.startNewRound = this.startNewRound.bind(this)
    this.getDrawing = this.getDrawing.bind(this)
    this.startTurnCountdown = this.startTurnCountdown.bind(this)
    this.ifNextPlayerNotHereRemove = this.ifNextPlayerNotHereRemove.bind(this)
    this.changeColor = this.changeColor.bind(this)
    this.changeBrushStrokeSize = this.changeBrushStrokeSize.bind(this)
    this.clearCanvas = this.clearCanvas.bind(this)
  }
  async componentDidMount() {
    const drawingCollectionInfo = await db
      .collection(`rooms/${this.roomId}/drawings`)
      .get()
    if (drawingCollectionInfo.empty) {
      await db.collection(`rooms/${this.roomId}/drawings`).add({
        canvasData: []
      })
    }
    this.drawingDocId = drawingCollectionInfo.docs[0].id

    this.roomInstanceInfo = await db.doc(`rooms/${this.roomId}`).get()
    this.time = this.roomInstanceInfo.data().timer

    if (
      this.roomInstanceInfo.data().turnOrder === undefined ||
      !this.roomInstanceInfo.data().turnOrder.length
    ) {
      this.startNewRound()
    }
  }
  async startNewRound() {
    const playersCollectionInfo = await db
      .collection(`rooms/${this.roomId}/players/`)
      .get()
    const turnArray = []
    playersCollectionInfo.forEach(player => turnArray.push(player.id))
    await db.doc(`rooms/${this.roomId}`).update({
      turnOrder: [...turnArray]
    })
    const updatedRoomInstanceInfo = await db.doc(`rooms/${this.roomId}`).get()
    this.turnOrderArray = [...updatedRoomInstanceInfo.data().turnOrder]
  }
  drawCanvas(start, end, strokeColor = 'black', lineWidth) {
    const ctx = this.theCanvas.getContext('2d')
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeColor
    ctx.moveTo(...start)
    ctx.lineTo(...end)
    ctx.closePath()
    ctx.stroke()
  }
  async clearCanvas() {
    const ctx = this.theCanvas.getContext('2d')
    ctx.clearRect(0, 0, this.theCanvas.width, this.theCanvas.height)
    this.canvasData = []
    await db.doc(`rooms/${this.roomId}/drawings`).update({
      canvasData: []
    })
  }
  startTurnCountdown() {
    let milliseconds = this.time * 1000
    setTimeout(async () => {
      this.turnOrderArray.shift()
      await this.ifNextPlayerNotHereRemove()
      await db.doc(`rooms/${this.roomId}`).update({
        turnOrder: [...this.turnOrderArray]
      })
    }, milliseconds)
    // if (!this.roomInstanceInfo.data().turnOrder.length) this.startNewRound()
  }
  async ifNextPlayerNotHereRemove() {
    const roomInstanceUpdated = await db
      .collection(`rooms/${this.roomId}/players`)
      .get()
    let playersHere = {}
    roomInstanceUpdated.forEach(player => {
      playersHere[player.id] = player.id
    })
    if (!playersHere.hasOwnProperty(this.turnOrderArray[0])) {
      this.turnOrderArray.shift()
      this.ifNotHereRemove()
    }
  }
  handleMouseDown() {
    let myTurn = this.username === this.turnOrderArray[0]
    if (myTurn) this.record = true
  }
  handleMouseMove(event) {
    event.persist()
    if (this.record) {
      const latestPoint = {
        x: event.pageX - this.theCanvas.offsetLeft,
        y: event.pageY - this.theCanvas.offsetTop,
        strokeColor: this.color,
        lineWidth: this.lineWidth,
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
            point.lineWidth,
            point.lineEnd
          )
        }
      })
    }
  }
  changeColor(color) {
    this.color = color
  }
  changeBrushStrokeSize(strokeSize) {
    this.lineWidth = strokeSize
  }
  async handleMouseUp() {
    let myTurn = this.username === this.turnOrderArray[0]
    if (this.canvasData.length && myTurn) {
      let endDraw = this.canvasData[this.canvasData.length - 1]
      endDraw.lineEnd = true
      this.canvasData.push(endDraw)
      this.record = false
      await db
        .doc(`rooms/${this.roomId}/drawings/${this.drawingDocId}`)
        .update({
          canvasData: [...this.canvasData]
        })
    }
  }
  async getDrawing() {
    let myTurn = this.username === this.turnOrderArray[0]
    if (!myTurn) {
      await db
        .doc(`rooms/${this.roomId}/drawings/${this.drawingDocId}`)
        .onSnapshot(doc => {
          let canvasData = doc.data().canvasData
          canvasData.forEach((point, idx, arr) => {
            if (idx > 0 && idx < arr.length && arr[idx - 1].lineEnd === false) {
              let startX = arr[idx - 1].x
              let startY = arr[idx - 1].y
              let endX = point.x
              let endY = point.y
              this.drawCanvas(
                [startX, startY],
                [endX, endY],
                point.strokeColor,
                point.lineWidth,
                point.lineEnd
              )
            }
          })
        })
    }
  }
  render() {
    return (
      <div
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseOut={this.handleMouseUp}
        onClick={this.getDrawing}
      >
        {/* {this.turnOrderArray[0] === this.username ? null : ( */}
        {/* <button className="join-btn" type="button" onClick={this.getDrawing}>
            Join
          </button> */}
        {/* )} */}
        <canvas
          ref={canvas => (this.theCanvas = canvas)}
          height={500}
          width={500}
        />
        <div id="color-pallete">
          <button
            type="button"
            className="color-palette-square black"
            onClick={() => this.changeColor('black')}
          />
          <button
            type="button"
            className="color-palette-square white"
            onClick={() => this.changeColor('#ffffff')}
          />
          <button
            type="button"
            className="color-palette-square gray"
            onClick={() => this.changeColor('#555555')}
          />
          <button
            type="button"
            className="color-palette-square brown"
            onClick={() => this.changeColor('#6b2d01')}
          />
          <button
            type="button"
            className="color-palette-square red"
            onClick={() => this.changeColor('#ff0000')}
          />
          <button
            type="button"
            className="color-palette-square orange"
            onClick={() => this.changeColor('#ff6600')}
          />
          <button
            type="button"
            className="color-palette-square yellow"
            onClick={() => this.changeColor('#ffd200')}
          />
          <button
            type="button"
            className="color-palette-square green"
            onClick={() => this.changeColor('#05be16')}
          />
          <button
            type="button"
            className="color-palette-square blue"
            onClick={() => this.changeColor('#0073e9')}
          />
          <button
            type="button"
            className="color-palette-square violet"
            onClick={() => this.changeColor('#7d0087')}
          />
          <button
            type="button"
            className="color-palette-square pink"
            onClick={() => this.changeColor('#ff007d')}
          />
          <button
            type="button"
            className="color-palette-square brush-small"
            onClick={() => this.changeBrushStrokeSize(3)}
          >
            &#9679;
          </button>
          <button
            type="button"
            className="color-palette-square brush-medium"
            onClick={() => this.changeBrushStrokeSize(7)}
          >
            &#9679;
          </button>
          <button
            type="button"
            className="color-palette-square brush-large"
            onClick={() => this.changeBrushStrokeSize(10)}
          >
            <div className="brush-large-text">&#9679;</div>
          </button>
          <button
            type="button"
            className="color-palette-square white"
            onClick={() => this.changeColor('#ffffff')}
          >
            <img className="eraser" src="eraser.png" />
          </button>
          <button
            type="button"
            className="clear-btn white"
            onClick={() => this.clearCanvas()}
          >
            clear
          </button>
        </div>
      </div>
    )
  }
}
