import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwhdvrhqohtayarwbtbg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGR2cmhxb2h0YXlhcndidGJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY0NzU5NywiZXhwIjoyMDc4MjIzNTk3fQ.xK2OdGC2W2s1eOaneLYCXKcj4ZSvGsB2bdK63zCRlLc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: stores, error } = await supabase.from('stores').select('*').limit(1)
  if (error) console.error(error)
  else console.log('Columns in stores:', Object.keys(stores[0]))
  
  const { data: subs, error: err2 } = await supabase.from('store_subscriptions').select('*').limit(1)
  if (err2) console.error(err2)
  else console.log('Columns in store_subscriptions:', Object.keys(subs[0]))
}

test()
