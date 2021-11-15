import styles from './Controls.module.css'

const Controls = ({ addHandler, clearHandler, undoHandler, redoHandler }) => {

  return (
    <div className={styles.wrap}>
      <div>
        <button onClick={addHandler}>Add Star</button>
        <button onClick={clearHandler}>Clear All</button>
      </div>
      <div>
        <button onClick={undoHandler}>Undo</button>
        <button onClick={redoHandler}>Redo</button>
      </div>
    </div>
  )

}

export default Controls