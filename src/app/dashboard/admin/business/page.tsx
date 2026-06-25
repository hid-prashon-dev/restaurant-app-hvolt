import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BusinessSettingsForm } from './BusinessSettingsForm';

export default async function AdminBusinessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/access-denied');

  if (!profile.tenant_id) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-2xl text-muted-foreground">🏢</div>
          <h2 className="text-2xl font-bold font-heading text-foreground">No Business Assigned</h2>
          <p className="text-muted-foreground">Your administrator account has not been assigned to a tenant yet. Please contact Himavolt support.</p>
        </div>
      </div>
    );
  }

  // Fetch the assigned tenant and settings
  const { data: tenant } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id).single();
  const { data: settings } = await supabase.from('tenant_settings').select('*').eq('tenant_id', profile.tenant_id).single();

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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Business</h1>
          <p className="text-muted-foreground mt-2">
            Manage your fundamental business details and localization settings.
          </p>
        </div>
        <div>
          {isProfileComplete ? (
            <div className="bg-success/10 text-success px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              Setup Complete
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <div className="bg-warning/10 text-warning px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                Setup Incomplete
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {requiredFields.length - missingFields.length} of {requiredFields.length} required fields
              </div>
              <div className="text-xs text-destructive">
                Missing: {missingFields.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 mb-8">
        <h2 className="font-heading font-bold text-lg border-b border-border pb-2">Tenant Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col"><span className="text-muted-foreground">Public Name:</span> <span className="font-medium">{tenant?.public_name}</span></div>
          <div className="flex flex-col"><span className="text-muted-foreground">Slug:</span> <span className="font-medium">{tenant?.slug}</span></div>
          <div className="flex flex-col"><span className="text-muted-foreground">Type:</span> <span className="font-medium">{tenant?.business_type}</span></div>
          <div className="flex flex-col"><span className="text-muted-foreground">Status:</span> <span className="font-medium">{tenant?.status}</span></div>
        </div>
      </div>

      <BusinessSettingsForm settings={settings} />
    </div>
  );
}
