import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwhdvrhqohtayarwbtbg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGR2cmhxb2h0YXlhcndidGJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY0NzU5NywiZXhwIjoyMDc4MjIzNTk3fQ.xK2OdGC2W2s1eOaneLYCXKcj4ZSvGsB2bdK63zCRlLc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('stores').select('count', { count: 'exact', head: true })
  console.log('Stores count:', data, error)
  
  const { data: stores } = await supabase.from('stores').select('*').limit(5)
  console.log('Stores sample:', stores)
}

test()
