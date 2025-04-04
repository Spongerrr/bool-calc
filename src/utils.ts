type Term = { bits: string; minterms: number[]; used: boolean }

function generateVariables(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `X${n - i - 1}`)
}

function combine(a: Term, b: Term): Term | null {
  let diff = 0
  let combined = ''
  for (let i = 0; i < a.bits.length; i++) {
    if (a.bits[i] !== b.bits[i]) {
      diff++
      combined += '-'
    } else {
      combined += a.bits[i]
    }
  }
  if (diff === 1) {
    return { bits: combined, minterms: [...a.minterms, ...b.minterms], used: false }
  }
  return null
}

// Новый простой вариант для 10 переменных
export function simpleDNF10vars(boolStr: string): string {
  const vars = Array.from({ length: 10 }, (_, i) => `X${i}`) // [X0, X1, ..., X9]

  return [...boolStr]
    .map((bit, i) => (bit === '1' ? vars[i] : null))
    .filter(Boolean)
    .join(' v ') || '0'
}

export function minimizeSDNF(boolStr: string): string {
  const n = Math.log2(boolStr.length)
  if (!Number.isInteger(n)) return 'Неверная длина строки (не 2^n)'
  const vars = generateVariables(n)

  let minterms: number[] = []
  boolStr.split('').forEach((bit, i) => {
    if (bit === '1') minterms.push(i)
  })

  if (minterms.length === 0) return '0'
  if (minterms.length === Math.pow(2, n)) return '1'

  let groups: Term[][] = Array.from({ length: n + 1 }, () => [] as Term[])
  minterms.forEach((num) => {
    const bits = num.toString(2).padStart(n, '0')
    const ones = bits.split('1').length - 1
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
            const key = combined.bits + combined.minterms.join(',')
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

  const expressions: string[] = Array.from(
    new Set(
      primeImplicants.map((term) => {
        const bits = term.bits
        return bits
          .split('')
          .map((b, i) => (b === '-' ? null : b === '1' ? vars[i] : `!${vars[i]}`))
          .filter(Boolean)
          .join(' & ')
      })
    )
  )

  return expressions.length > 0 ? expressions.map((e) => `(${e})`).join(' v ') : '0'
}

