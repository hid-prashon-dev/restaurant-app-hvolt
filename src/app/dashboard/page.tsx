import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardRedirector() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile to get role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Default fallback if profile fetch fails or role is missing
  if (!profile || !profile.role) {
    redirect('/access-denied')
  }

  // Redirect based on role exactly as it appears in DB Enum
  const role = profile.role
  
  switch(role) {
    case 'MASTER_ADMIN':
      redirect('/dashboard/master')
    case 'SUPER_ADMIN':
      redirect('/dashboard/superadmin')
    case 'ADMIN':
      redirect('/dashboard/admin')
    case 'MANAGER':
      redirect('/dashboard/manager')
    case 'CASHIER':
      redirect('/dashboard/cashier')
    case 'WAITER':
      redirect('/dashboard/waiter')
    case 'KITCHEN_STAFF':
      redirect('/dashboard/kitchen')
    case 'FRONT_DESK':
      redirect('/dashboard/front-desk')
    case 'HOUSEKEEPING':
      redirect('/dashboard/housekeeping')
    case 'INVENTORY_MANAGER':
      redirect('/dashboard/inventory')
    case 'GUEST':
    default:
      redirect('/access-denied')
  }
}
