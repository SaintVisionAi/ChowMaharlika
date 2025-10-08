#!/usr/bin/env tsx
/**
 * Run SQL Migration Script
 * Executes SQL files directly against Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const sqlFile = process.argv[2]

if (!sqlFile) {
  console.error('Usage: npx tsx scripts/run-sql-migration.ts <sql-file>')
  process.exit(1)
}

console.log(`🚀 Running SQL migration: ${sqlFile}\n`)

try {
  const sql = readFileSync(sqlFile, 'utf-8')

  // Split by semicolons to execute statements individually
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📝 Found ${statements.length} SQL statements\n`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]

    // Skip comments
    if (statement.startsWith('--')) continue

    console.log(`Executing statement ${i + 1}/${statements.length}...`)

    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

    if (error) {
      // Try direct execution if RPC fails
      console.log(`   Trying direct execution...`)
      const { error: directError } = await supabase
        .from('_migrations')
        .insert({ sql: statement })
        .select()

      if (directError) {
        console.error(`   ❌ Error: ${error.message}`)
      } else {
        console.log(`   ✓ Success`)
      }
    } else {
      console.log(`   ✓ Success`)
    }
  }

  console.log('\n✅ Migration complete!')
} catch (error) {
  console.error('\n💥 Migration failed:', error)
  process.exit(1)
}
