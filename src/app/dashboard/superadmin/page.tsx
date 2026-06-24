import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function superadminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'SUPER_ADMIN') redirect('/access-denied')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-heading mb-4">Superadmin Dashboard</h1>
      <p className="text-muted-foreground">This is the dedicated workspace for the Superadmin role.</p>
    </div>
  )
}
