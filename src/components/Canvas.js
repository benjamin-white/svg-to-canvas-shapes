import { useRef, useEffect, useState } from 'react'
import styles                          from './Canvas.module.css'
import CanvasManager                   from '../inc/CanvasManager'
import Controls                        from './Controls'

const Canvas = () => {

  const canvasWrap          = useRef()
  const canvasID            = 'js-canvasPrimary'
  const Manager             = useRef({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Manager.current = new CanvasManager(canvasID, canvasWrap.current)
    setLoaded(true)
  }, [])


  return (
    <div className={styles.wrap} ref={canvasWrap}>
      <canvas id={canvasID}></canvas>
      { loaded && 
        <Controls 
          addHandler={Manager.current.addStar.bind(Manager.current)} 
          clearHandler={Manager.current.clearCanvas.bind(Manager.current)}
          undoHandler={Manager.current.undoLast.bind(Manager.current)}
          redoHandler={Manager.current.redoLast.bind(Manager.current)}
        />
      }
    </div>
  )

}

export default Canvas