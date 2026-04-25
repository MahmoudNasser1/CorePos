import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config } from 'dotenv'

/** مجلد `apps/backend` بغض النظر عن cwd (مهم عند `npm run start -w` من جذر المستودع) */
const backendRoot = resolve(__dirname, '..')
const envPath = resolve(backendRoot, '.env')
const envLocalPath = resolve(backendRoot, '.env.local')

if (existsSync(envPath)) {
  config({ path: envPath })
} else if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
} else {
  config({ path: resolve(process.cwd(), '.env') })
}
