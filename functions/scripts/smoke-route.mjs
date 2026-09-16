import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(root, '../src/index.ts'), 'utf8')

const checks = ['calculateTruckRoute', 'HERE_API_KEY', 'calculateHereTruckRoute', 'southamerica-east1']
for (const token of checks) {
  if (!src.includes(token)) {
    console.error('smoke fail: missing', token)
    process.exit(1)
  }
}

console.log('functions smoke ok (source ready for HERE secret + deploy)')
console.log('Amanhã: setar secret HERE_API_KEY e rodar npm run deploy')
