'use strict'

import React, {Component} from 'react'
import db from '../../../firestore.js'

export default class Canvas extends Component {
  constructor() {
    super()
    this.state = {
      record: false,
      canvasData: []
    }
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
  }
  async componentDidMount() {
    const roomId = 'aQFOGkBUusXJmGP808XR' // REPLACE WITH LINE ABOVE

    const drawingCollectionInfo = await db
      .collection(`rooms/${roomId}/drawings`)
      .get()

    const drawingCollection = await db.collection(`rooms/${roomId}/drawings`)

    if (drawingCollectionInfo.empty) {
      drawingCollection.add({
        canvasData: [this.state]
      })
    } else {
      const drawingDoc = drawingCollectionInfo.docs[0].id
      await db.doc(`rooms/${roomId}/drawings/${drawingDoc}`).update({
        canvasData: this.state.canvasData
      })
    }
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
    this.setState({
      record: true
    })
  }
  handleMouseMove(event) {
    if (this.state.record) {
      const latestPoint = {
        x: event.pageX - this.theCanvas.offsetLeft,
        y: event.pageY - this.theCanvas.offsetTop,
        strokeColor: 'black',
        lineWidth: 3,
        lineEnd: false
      }
      this.setState({
        canvasData: [...this.state.canvasData, latestPoint]
      })
      this.state.canvasData.forEach((point, idx, arr) => {
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
  handleMouseUp() {
    let endDraw = this.state.canvasData[this.state.canvasData.length - 1]
    endDraw.lineEnd = true
    this.setState({
      record: false,
      canvasData: [...this.state.canvasData, endDraw]
    })
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
