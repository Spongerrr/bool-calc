import React, { useState } from "react"

function generateVariables(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `X${n - i - 1}`)
}

function getBinaryCombinations(n: number): number[][] {
  return Array.from({ length: Math.pow(2, n) }, (_, i) =>
    i
      .toString(2)
      .padStart(n, "0")
      .split("")
      .map(Number)
  )
}

function toSDNF(boolStr: string): string {
  const n = Math.log2(boolStr.length)
  if (!Number.isInteger(n)) return "Неверная длина строки (не 2^n)"
  const vars = generateVariables(n)
  const combos = getBinaryCombinations(n)

  const terms: string[] = []
  boolStr.split("").forEach((bit, i) => {
    if (bit === "1") {
      const term = combos[i]
        .map((val, idx) => (val ? vars[idx] : `!${vars[idx]}`))
        .join(" & ")
      terms.push(`(${term})`)
    }
  })

  return terms.length > 0 ? terms.join(" v ") : "0"
}

function toSKNF(boolStr: string): string {
  const n = Math.log2(boolStr.length)
  if (!Number.isInteger(n)) return "Неверная длина строки (не 2^n)"
  const vars = generateVariables(n)
  const combos = getBinaryCombinations(n)

  const terms: string[] = []
  boolStr.split("").forEach((bit, i) => {
    if (bit === "0") {
      const term = combos[i]
        .map((val, idx) => (val ? `!${vars[idx]}` : vars[idx]))
        .join(" v ")
      terms.push(`(${term})`)
    }
  })

  return terms.length > 0 ? terms.join(" & ") : "1"
}

// Куайн-МакКласки: Минимизация
function minimizeSDNF(boolStr: string): string {
  const n = Math.log2(boolStr.length)
  if (!Number.isInteger(n)) return "Неверная длина строки (не 2^n)"
  const vars = generateVariables(n)

  let minterms: number[] = []
  boolStr.split("").forEach((bit, i) => {
    if (bit === "1") minterms.push(i)
  })

  if (minterms.length === 0) return "0"
  if (minterms.length === Math.pow(2, n)) return "1"

  type Term = { bits: string; minterms: number[]; used: boolean }

  function combine(a: Term, b: Term): Term | null {
    let diff = 0
    let combined = ""
    for (let i = 0; i < a.bits.length; i++) {
      if (a.bits[i] !== b.bits[i]) {
        diff++
        combined += "-"
      } else {
        combined += a.bits[i]
      }
    }
    if (diff === 1) {
      return { bits: combined, minterms: [...a.minterms, ...b.minterms], used: false }
    }
    return null
  }

  let groups: Term[][] = Array.from({ length: n + 1 }, () => [] as Term[])
  minterms.forEach((num) => {
    const bits = num.toString(2).padStart(n, "0")
    const ones = bits.split("1").length - 1
    groups[ones].push({ bits, minterms: [num], used: false })
  })

  let primeImplicants: Term[] = []
  let nextGroups

  do {
    nextGroups = Array.from({ length: n }, () => [] as Term[])
    let marked = new Set<string>()

    for (let i = 0; i < groups.length - 1; i++) {
      for (let a of groups[i]) {
        for (let b of groups[i + 1]) {
          const combined = combine(a, b)
          if (combined) {
            a.used = true
            b.used = true
            const key = combined.bits + combined.minterms.join(",")
            if (!marked.has(key)) {
              nextGroups[i].push(combined)
              marked.add(key)
            }
          }
        }
      }
    }

    for (let group of groups.flat()) {
      if (!group.used) {
        primeImplicants.push(group)
      }
    }

    groups = nextGroups
  } while (groups.flat().length > 0)

  // Покрытие минтермов
  const expressions: string[] = Array.from(
    new Set(
      primeImplicants.map((term) => {
        const bits = term.bits
        return bits
          .split("")
          .map((b, i) => (b === "-" ? null : b === "1" ? vars[i] : `!${vars[i]}`))
          .filter(Boolean)
          .join(" & ")
      })
    )
  )

  return expressions.length > 0 ? expressions.map(e => `(${e})`).join(" v ") : "0"
}

const App: React.FC = () => {
  const [input, setInput] = useState("")
  const [sdnf, setSDNF] = useState("")
  const [sknf, setSKNF] = useState("")
  const [minimized, setMinimized] = useState("")

  const handleCalculate = () => {
    setSDNF(toSDNF(input))
    setSKNF(toSKNF(input))
    setMinimized(minimizeSDNF(input))
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Булевый калькулятор</h1>
        <div className='form'>
          <input
            placeholder="Введите строку, например: 10001110"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
          />
          <button onClick={handleCalculate} disabled={!input}>
            Посчитать
          </button>
        </div>
        {sknf && (
          <div className='result'>
            <p>СКНФ:</p>
            <span>{sknf}</span>
          </div>
        )}
        {sdnf && (
          <div className='result'>
            <p>СДНФ:</p>
            <span>{sdnf}</span>
          </div>
        )}
        {minimized && (
          <div className='result'>
            <p>Минимизированная ДНФ:</p>
            <span className="">{minimized}</span>
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