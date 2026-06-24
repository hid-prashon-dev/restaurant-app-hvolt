import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-foreground">Business Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-lg border-b border-border pb-2">Tenant Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Public Name:</span> <span className="font-medium">{tenant?.public_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Slug:</span> <span className="font-medium">{tenant?.slug}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="font-medium">{tenant?.business_type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className="font-medium">{tenant?.status}</span></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-lg border-b border-border pb-2">Operational Settings</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Timezone:</span> <span className="font-medium">{settings?.timezone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Currency:</span> <span className="font-medium">{settings?.currency}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contact Email:</span> <span className="font-medium">{settings?.contact_email || 'Not set'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Country:</span> <span className="font-medium">{settings?.country || 'Not set'}</span></div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/50 border border-border rounded-xl p-6 shadow-sm space-y-2 mt-8 text-center">
        <p className="text-sm text-muted-foreground">Settings editing is deferred to a future phase.</p>
      </div>
    </div>
  );
}
