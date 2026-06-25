import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ModulesForm } from './ModulesForm';

export default async function AdminModulesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/access-denied');

  if (!profile.tenant_id) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-2xl text-muted-foreground">⚙️</div>
          <h2 className="text-2xl font-bold font-heading text-foreground">No Business Assigned</h2>
          <p className="text-muted-foreground">Your administrator account has not been assigned to a tenant yet. Please contact Himavolt support.</p>
        </div>
      </div>
    );
  }

  const { data: settings } = await supabase.from('tenant_settings').select('modules_enabled').eq('tenant_id', profile.tenant_id).single();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Operational Modules</h1>
        <p className="text-muted-foreground mt-2">
          Toggle which operational modules are active for your business. Note that most modules are currently in <strong>setup-only</strong> mode.
        </p>
      </div>

      <ModulesForm key={JSON.stringify(settings?.modules_enabled || {})} initialModules={settings?.modules_enabled || {}} />
    </div>
  );
}
