import React, { useState } from 'react'
import { minimizeSDNF, simpleDNF10vars } from './utils'

const App: React.FC = () => {
  const [input, setInput] = useState('')
  const [numVars, setNumVars] = useState(3)
  const [sdnf, setSDNF] = useState('')
  const [minimized, setMinimized] = useState('')
  const [error, setError] = useState('')

  const handleCalculate = () => {
    const expectedLength = numVars === 10 ? 10 : Math.pow(2, numVars)

    setSDNF('')
    setMinimized('')

    if (input.length !== expectedLength) {
      setError(`Строка должна содержать ${expectedLength} символов для ${numVars} переменных.`)
      setSDNF('')
      setMinimized('')
      return
    }

    setError('')

    if (numVars === 10) {
      const simpleExpr = simpleDNF10vars(input)
      setSDNF(simpleExpr)
    } else {
      setMinimized(minimizeSDNF(input))
    }
  }

  return (
    <div className='app'>
      <div className='container'>
        <h1>Булевый калькулятор</h1>

        <div className='form'>
          <select value={numVars} onChange={(e) => setNumVars(parseInt(e.target.value))}>
            <option value={3}>Задание 1 (3x7)</option>
            <option value={10}>Задание 2 (10x7)</option>
          </select>

          <input
            placeholder='Введите значение...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
          />
          <button onClick={handleCalculate} disabled={!input}>
            Посчитать
          </button>
        </div>
        {error && <div className='error'>⚠️ {error}</div>}
        {sdnf && (
          <div className='result'>
            <p>Готовое уравнение:</p>
            <span>{sdnf}</span>
          </div>
        )}
        {minimized && (
          <div className='result'>
            <p>Готовое уравнение:</p>
            <span>{minimized}</span>
          </div>
        )}
        <a className='promo' href='https://t.me/justfrontend' target='_blank'>
          Created by <span>JustFrontend</span>
        </a>
      </div>
    </div>
  )
}

export default App