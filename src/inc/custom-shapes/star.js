import { fabric }   from 'fabric'
import { debounce } from 'lodash'
import { 
  movePoint, 
  vecAdjustMagnitude,
  clamp,
  fit
} from '../utils'


class star {


  constructor(origin, options={}, ctx, recordChange) {

    this.origin             = origin
    this.spokeCount         = 8
    this.outerRadius        = 120
    this.innerRadius        = 80
    this.roundness          = 0
    this._fullRotation      = 2 * Math.PI
    this._recordChange      = typeof recordChange === 'function' ? recordChange : () => {}
    this._heldRecord        = debounce(this._record, 500)
    this._fabricInstance    = ctx
    this._translationOffset = {x: 0, y: 0}
    this._scaleOffset       = {x: 1, y: 1}
    this._controlsCustom    = {
      radius: {
        x: this.origin.x,
        y: this.origin.y - this.outerRadius
      }
    }

    return this._create(options)

  }


  _create(options) {

    this._fabricShape = new fabric.Path(
      this._drawPath(this.origin),
      {originX: 'center', originY: 'center', ...options}
    )

    this._setControls()
    this._bindEvents()
    this._createSnapshot()

    return this._fabricShape

  }


  _setControls() {
  
    this._fabricShape.controls = {
      tl: fabric.Object.prototype.controls.tl,
      tr: fabric.Object.prototype.controls.tr,
      bl: fabric.Object.prototype.controls.bl,
      br: fabric.Object.prototype.controls.br,
      ml: fabric.Object.prototype.controls.ml,
      mt: fabric.Object.prototype.controls.mt,
      mr: fabric.Object.prototype.controls.mr,
      mb: fabric.Object.prototype.controls.mb,
      radius: this._controlRadius(),
      depth: this._controlDepth(),
      spokes: this._controlSpokes()
    }

  }


  _bindEvents() {

    this._fabricShape.on('moving', (event) => {
      this._translationOffset = {
        x: this.origin.x - event.transform.target.left,
        y: this.origin.y - event.transform.target.top
      }
    })

    this._fabricShape.on('scaling', (event) => {
      this._scaleOffset = {
        x: event.transform.target.scaleX,
        y: event.transform.target.scaleY
      }
    })

    this._fabricShape.on('refresh', () => {
      this._translationOffset = {
        x: this.origin.x - this._fabricShape.left,
        y: this.origin.y - this._fabricShape.top
      }
      this._scaleOffset = {
        x: this._fabricShape.scaleX,
        y: this._fabricShape.scaleY
      }
    })

  }


  _record() {

    const previousState = this.snapshot
    this._createSnapshot()
    const currentState = this.snapshot

    this._recordChange({
      undo: () => {this._refresh(previousState)},
      redo: () => {this._refresh(currentState)}
    })

  }


  _createSnapshot() {

    this.snapshot = {
      spokeCount: this.spokeCount,
      outerRadius: this.outerRadius,
      innerRadius: this.innerRadius,
      roundness: this.roundness
    }
    
  }


  _refresh(bySnapshot) {

    if (bySnapshot) {
      this.spokeCount  = bySnapshot.spokeCount
      this.outerRadius = bySnapshot.outerRadius
      this.innerRadius = bySnapshot.innerRadius
      this.roundness   = bySnapshot.roundness
      this._createSnapshot()
    }

    this._fabricShape.set({
      path: new fabric.Path(
        this._drawPath(
          this.origin, 
          this.spokeCount,
          this.outerRadius,
          this.innerRadius,
          this.roundness
        )
      ).path,
      dirty: true
    })

    this._fabricShape.setCoords()
    this._fabricInstance.requestRenderAll()

  }


  _controlRadius() {
  
    const drawRadiusControl = (ctx) => {

      const pointLoc = vecAdjustMagnitude(
        {
          x: this._controlsCustom.radius.x - this.origin.x,
          y: this._controlsCustom.radius.y + fit(this.roundness, 0, .499, 0, this.outerRadius) - this.origin.y
        }, 
        this._scaleOffset
      )

      ctx.beginPath()
      ctx.arc(
        pointLoc.x + this.origin.x - this._translationOffset.x, 
        pointLoc.y + this.origin.y - this._translationOffset.y, 
        fabric.Object.prototype.cornerSize * .5, 
        0, 
        this._fullRotation,
        false
      )
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = '#ffa07a'
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(
        pointLoc.x + this.origin.x - this._translationOffset.x, 
        pointLoc.y + this.origin.y - this._translationOffset.y, 
        fabric.Object.prototype.cornerSize * .25, 
        0, 
        this._fullRotation,
        false
      )
      ctx.fillStyle = '#ffa07a'
      ctx.fill()

    }

    return new fabric.Control({
      positionHandler: () => {
        const pointLoc = vecAdjustMagnitude(
          {
            x: this._controlsCustom.radius.x - this.origin.x,
            y: this._controlsCustom.radius.y + fit(this.roundness, 0, .499, 0, this.outerRadius) - this.origin.y
          }, 
          this._scaleOffset
        )
        return {
          x: pointLoc.x + this.origin.x - this._translationOffset.x, 
          y: pointLoc.y + this.origin.y - this._translationOffset.y
        }
      },
      actionHandler: (eventData) => {
        if (eventData.movementY > 0) this.roundness = clamp(this.roundness + .02, 0, 0.499)
        if (eventData.movementY < 0) this.roundness = clamp(this.roundness - .02, 0, 0.499)
        this._refresh()
        this._heldRecord()
      },
      render: drawRadiusControl,
      cursorStyle: 'crosshair'
    })

  }


  _controlDepth() {

    const drawDepthControl = (ctx) => {

      const pointLoc = vecAdjustMagnitude(
        {
          x: this._controlsCustom.depth.x - this.origin.x,
          y: this._controlsCustom.depth.y - this.origin.y
        }, 
        this._scaleOffset
      )

      ctx.beginPath()
      ctx.arc(
        pointLoc.x + this.origin.x - this._translationOffset.x, 
        pointLoc.y + this.origin.y - this._translationOffset.y, 
        fabric.Object.prototype.cornerSize * .5, 
        0, 
        this._fullRotation,
        false
      )
      ctx.fillStyle = '#ffa07a'
      ctx.fill()

    }

    return new fabric.Control({
      positionHandler: () => {
        const pointLoc = vecAdjustMagnitude(
          {
            x: this._controlsCustom.depth.x - this.origin.x,
            y: this._controlsCustom.depth.y - this.origin.y
          }, 
          this._scaleOffset
        )
        return {
          x: pointLoc.x + this.origin.x - this._translationOffset.x, 
          y: pointLoc.y + this.origin.y - this._translationOffset.y
        }
      },
      actionHandler: (eventData) => {
        if (eventData.movementY > 0) this.innerRadius = clamp(this.innerRadius - 4, 3, this.outerRadius)
        if (eventData.movementY < 0) this.innerRadius = clamp(this.innerRadius + 4, 3, this.outerRadius)
        this._refresh()
        this._heldRecord()
      },
      render: drawDepthControl,
      cursorStyle: 'crosshair'
    })

  }


  _controlSpokes() {

    const drawSpokeControl = (ctx) => {

      const pointLoc = vecAdjustMagnitude(
        {
          x: this._controlsCustom.spokes.x - this.origin.x,
          y: this._controlsCustom.spokes.y - this.origin.y
        }, 
        this._scaleOffset
      )

      ctx.beginPath()
      ctx.arc(
        pointLoc.x + this.origin.x - this._translationOffset.x, 
        pointLoc.y + this.origin.y - this._translationOffset.y, 
        fabric.Object.prototype.cornerSize * .5, 
        0, 
        this._fullRotation,
        false
      )
      ctx.fillStyle = '#ffa07a'
      ctx.fill()

    }

    return new fabric.Control({
      positionHandler: () => {
        const pointLoc = vecAdjustMagnitude(
          {
            x: this._controlsCustom.spokes.x - this.origin.x,
            y: this._controlsCustom.spokes.y - this.origin.y
          }, 
          this._scaleOffset
        )
        return {
          x: pointLoc.x + this.origin.x - this._translationOffset.x, 
          y: pointLoc.y + this.origin.y - this._translationOffset.y
        }
      },
      actionHandler: (eventData) => {
        if (eventData.movementY > 1 || (this.spokeCount > 8 && eventData.movementY > 0)) this.spokeCount = clamp(this.spokeCount - 1, 3, 200)
        if (eventData.movementY < -1 || (this.spokeCount > 8 && eventData.movementY < 0)) this.spokeCount = clamp(this.spokeCount + 1, 3, 200)
        this._refresh()
        this._heldRecord()
      },
      render: drawSpokeControl,
      cursorStyle: 'crosshair'
    })

  }


  _drawPath(origin={}, spokeCount=8, outerRadius=120, innerRadius=80, roundness=0) {

    let rot  = Math.PI / 2 * 3
    let step = Math.PI / spokeCount
    let path = ''
  
    if (!roundness) {

      this._controlsCustom.depth = {
        x: origin.x + innerRadius * Math.cos(rot + step),
        y: origin.y + innerRadius * Math.sin(rot + step)
      }

      this._controlsCustom.spokes = {
        x: origin.x + outerRadius * Math.cos(rot + step * 2),
        y: origin.y + outerRadius * Math.sin(rot + step * 2)
      }

      for (let i = 0; i < spokeCount; i++) {

        path += `${!i ? 'M' : 'L'} ${origin.x + outerRadius * Math.cos(rot)} ${origin.y + outerRadius * Math.sin(rot)}`
        rot  += step

        path += ` L ${origin.x + innerRadius * Math.cos(rot)} ${origin.y + innerRadius * Math.sin(rot)}`
        rot  += step

      }

      path += 'Z'

      return path

    }

    this._controlsCustom.depth = {
      x: origin.x + innerRadius * Math.cos(rot + step),
      y: origin.y + innerRadius * Math.sin(rot + step)
    }

    this._controlsCustom.spokes = {
      x: origin.x + outerRadius * Math.cos(rot + step * 2),
      y: origin.y + outerRadius * Math.sin(rot + step * 2)
    }

    for (let i = 0; i < spokeCount; i++) {
  
      const p1 = {
        x: origin.x + outerRadius * Math.cos(rot),
        y: origin.y + outerRadius * Math.sin(rot)
      }

      const p2 = {
        x: origin.x + innerRadius * Math.cos(rot + step),
        y: origin.y + innerRadius * Math.sin(rot + step)
      }

      const p3 = {
        x: origin.x + outerRadius * Math.cos(rot + step * 2),
        y: origin.y + outerRadius * Math.sin(rot + step * 2)
      }

      let pointsInner = movePoint(p1, p2, roundness)
      path += !i ? `M ${pointsInner.x} ${pointsInner.y}` : ` Q ${p1.x} ${p1.y} ${pointsInner.x} ${pointsInner.y}`

      pointsInner = movePoint(p1, p2, 1 - roundness)
      path += ` L ${pointsInner.x} ${pointsInner.y}`

      pointsInner = movePoint(p2, p3, roundness)
      path += ` Q ${p2.x} ${p2.y} ${pointsInner.x} ${pointsInner.y}`

      pointsInner = movePoint(p2, p3, 1 - roundness)
      path += ` L ${pointsInner.x} ${pointsInner.y}`

      rot += step * 2

    }
  
    const p1 = {
      x: origin.x + outerRadius * Math.cos(rot),
      y: origin.y + outerRadius * Math.sin(rot)
    }
  
    const p2 = {
      x: origin.x + innerRadius * Math.cos(rot + step),
      y: origin.y + innerRadius * Math.sin(rot + step)
    }

    let pointsInner = movePoint(p1, p2, roundness)
    path += ` Q ${origin.x + outerRadius * Math.cos(rot)} ${origin.y + outerRadius * Math.sin(rot)} ${pointsInner.x} ${pointsInner.y}`
  
    path += ' Z'
  
    return path

  }


}


export default star