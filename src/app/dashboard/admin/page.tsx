import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (!profile || profile.role !== 'ADMIN' || !profile.tenant_id) redirect('/access-denied')

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();

  const [{ data: settings }, { count: areaCount }, { count: locationCount }] = await Promise.all([
    adminSupabase.from('tenant_settings').select('*').eq('tenant_id', profile.tenant_id).single(),
    adminSupabase.from('service_areas').select('id', { count: 'exact', head: true }).eq('tenant_id', profile.tenant_id).neq('status', 'ARCHIVED'),
    adminSupabase.from('service_locations').select('id', { count: 'exact', head: true }).eq('tenant_id', profile.tenant_id).neq('status', 'ARCHIVED')
  ]);

  const modules = settings?.modules_enabled || {};
  const activeModules = Object.keys(modules).filter(k => modules[k]);

  const requiredFields = [
    { key: 'country', label: 'Country' },
    { key: 'currency', label: 'Currency' },
    { key: 'timezone', label: 'Timezone' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address_line', label: 'Address Line' },
    { key: 'city', label: 'City' }
  ];

  const missingFields = requiredFields.filter(f => !settings?.[f.key]).map(f => f.label);
  const isProfileComplete = missingFields.length === 0;
  
  const isAreasMapped = (areaCount || 0) > 0;
  const isLocationsMapped = (locationCount || 0) > 0;

  const steps = [
    {
      title: 'Complete Business Profile',
      description: isProfileComplete 
        ? 'Your fundamental business details are set.' 
        : `Missing: ${missingFields.join(', ')}`,
      status: isProfileComplete ? 'complete' : 'pending',
      action: 'Go to Settings',
      href: '/dashboard/admin/business'
    },
    {
      title: 'Enable Operational Modules',
      description: activeModules.length > 0
        ? `${activeModules.length} module(s) enabled.`
        : 'Choose which Himavolt modules you need (e.g., Restaurant, Hotel).',
      status: activeModules.length > 0 ? 'complete' : 'pending',
      action: 'Manage Modules',
      href: '/dashboard/admin/modules'
    },
    {
      title: 'Map Physical Layout',
      description: isAreasMapped
        ? `${areaCount} area(s) and ${locationCount} location(s) mapped.`
        : 'Define your service areas (e.g., Dining Room, Floor 1) and locations (e.g., Tables, Rooms).',
      status: isAreasMapped ? 'complete' : 'pending',
      action: 'Map Layout',
      href: '/dashboard/admin/locations'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Welcome to Himavolt</h1>
        <p className="text-muted-foreground mt-2">
          Your dashboard is currently in <strong>Setup Mode</strong>. Please complete the operational foundation before we launch full features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-2">
          <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Business Profile</h3>
          <div className="text-2xl font-bold text-foreground">{isProfileComplete ? 'Complete' : 'Incomplete'}</div>
          {settings?.country && <p className="text-xs text-muted-foreground mt-1">{settings.country} • {settings.currency}</p>}
        </div>
        
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-2">
          <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Enabled Modules</h3>
          <div className="text-2xl font-bold text-foreground">{activeModules.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Operational modules turned on</p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-2">
          <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Mapped Locations</h3>
          <div className="text-2xl font-bold text-foreground">{locationCount || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Across {areaCount || 0} service areas</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <h2 className="font-heading font-bold text-lg text-foreground">Setup Checklist</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isProfileComplete ? 'bg-success/20 text-success' : 'bg-muted border border-border'}`}>
                {isProfileComplete && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div>
                <h4 className="font-medium text-foreground">Configure Business Settings</h4>
                <p className="text-sm text-muted-foreground">Set your timezone, currency, and contact details.</p>
              </div>
            </div>
            <Link href="/dashboard/admin/business" className="text-sm font-medium text-primary hover:underline">Edit Settings</Link>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeModules.length > 0 ? 'bg-success/20 text-success' : 'bg-muted border border-border'}`}>
                {activeModules.length > 0 && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div>
                <h4 className="font-medium text-foreground">Enable Operational Modules</h4>
                <p className="text-sm text-muted-foreground">Select which features your business needs (Restaurant, Hotel, etc.).</p>
              </div>
            </div>
            <Link href="/dashboard/admin/modules" className="text-sm font-medium text-primary hover:underline">Manage Modules</Link>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAreasMapped && isLocationsMapped ? 'bg-success/20 text-success' : 'bg-muted border border-border'}`}>
                {isAreasMapped && isLocationsMapped && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div>
                <h4 className="font-medium text-foreground">Map Physical Layout</h4>
                <p className="text-sm text-muted-foreground">Create service areas (e.g., Dining Room) and locations (e.g., Tables).</p>
              </div>
            </div>
            <Link href="/dashboard/admin/locations" className="text-sm font-medium text-primary hover:underline">Manage Locations</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
