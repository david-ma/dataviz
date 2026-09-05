import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { CSV_COLUMNS, statues } from './statues-data.ts'

function csvEscape(value: string | number): string {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const rows = statues.filter((s) => !s.notes.includes('PLACEHOLDER_REMOVE') && s.lat !== 0)

const lines = [
  CSV_COLUMNS.join(','),
  ...rows.map((row) =>
    CSV_COLUMNS.map((col) => csvEscape(row[col] as string | number)).join(','),
  ),
]

const out = path.resolve(import.meta.dirname, '../public/dataviz/statues.csv')
writeFileSync(out, lines.join('\n') + '\n')

const women = rows.filter((s) => s.type.startsWith('woman')).length
const goats = rows.filter((s) => s.type.startsWith('goat')).length
console.log(`Wrote ${rows.length} rows → ${out} (women=${women}, goats=${goats})`)
