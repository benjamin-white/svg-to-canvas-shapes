import { fabric } from 'fabric'
import star from './custom-shapes/star'


class CanvasManager {


  constructor(canvasID, parentElem) {

    this.selector     = canvasID
    this.width        = parentElem.offsetWidth
    this.height       = parentElem.offsetWidth * .56
    this.history      = []
    this.historyIndex = 0
    this.historyMax   = 100
    this.objDefaults  = {
      fill: '#fff',
      strokeWidth: 1,
      stroke: '#000',
      centeredRotation: true,
      centeredScaling: true,
      transparentCorners: false,
      cornerSize: 12,
      padding: 10
    }

    this._createCanvas()

  }


  _createCanvas() {

    this.canvas = new fabric.Canvas(
      this.selector,
      {width: this.width, height: this.height}
    )

    this.recordGlobalActions()

  }


  clearCanvas() {

    const snapshot = JSON.stringify(this.canvas)
    this.canvas.clear()
    this.updateHistory({
      undo: () => {
        this.canvas.loadFromJSON(
          snapshot,
          this.canvas.renderAll.bind(this.canvas)
        )
      },
      redo: () => this.canvas.clear()
    })

  }


  addStar() {

    const shape = new star({x: this.width * .5, y: this.height * .5}, this.objDefaults, this.canvas, this.updateHistory.bind(this))
    this.canvas.add(shape)
    this.canvas.setActiveObject(shape)

  }


  recordGlobalActions() {

    this.canvas.on('object:added', ({ target }) => {

      this.updateHistory({
        undo: () => {this.canvas.remove(target)},
        redo: () => {this.canvas.add(target)}
      })

    })

    this.canvas.on('object:modified', ({ target, transform }) => {

      const [top, left, scaleX, scaleY] = [target.top, target.left, target.scaleX, target.scaleY]

      this.updateHistory({
        undo: () => {
          target.set({
            top: transform.original.top,
            left: transform.original.left,
            scaleX: transform.original.scaleX,
            scaleY: transform.original.scaleY
          })
          target.fire('refresh')
          this.canvas.renderAll()
        },
        redo: () => {
          target.set({
            top: top,
            left: left,
            scaleX: scaleX,
            scaleY: scaleY
          })
          target.fire('refresh')
          this.canvas.renderAll()
        }
      })

    })

  }


  updateHistory(actionRecord) {

    if (this.isHistoryEvent) return

    if (typeof actionRecord.undo !== 'function' || typeof actionRecord.redo !== 'function') {
      console.warn(`History records muct be callable, ${typeof actionRecord.undo} and ${typeof actionRecord.redo} given`)
      return
    }

    if (this.history.length >= this.historyMax) {
      this.history.shift()
    }

    this.history = this.history.slice(0, this.historyIndex)
    this.history.push(actionRecord)
    this.historyIndex++

  }


  undoLast() {

    if (!this.history[this.historyIndex - 1]) {
      alert('Nothing to undo!')
      return;
    }

    if (typeof this.history[this.historyIndex - 1].undo !== 'function') {
      alert('Unable to undo')
      console.warn('Invalid undo entry in history object')
    }

    this.isHistoryEvent = true
    this.history[this.historyIndex - 1].undo()
    this.historyIndex -= 1
    this.isHistoryEvent = false

  }


  redoLast() {

    if (!this.history[this.historyIndex]) {
      alert('Nothing to redo!')
      return;
    }

    if (typeof this.history[this.historyIndex].redo !== 'function') {
      alert('Unable to redo')
      console.warn('Invalid redo entry in history object')
    }

    this.isHistoryEvent = true
    this.history[this.historyIndex].redo()
    this.historyIndex += 1
    this.isHistoryEvent = false

  }


}


export default CanvasManager