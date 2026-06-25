import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { LocationsManager } from './LocationsManager';

export default async function AdminLocationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/access-denied');

  if (!profile.tenant_id) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-2xl text-muted-foreground">📍</div>
          <h2 className="text-2xl font-bold font-heading text-foreground">No Business Assigned</h2>
          <p className="text-muted-foreground">Your administrator account has not been assigned to a tenant yet. Please contact Himavolt support.</p>
        </div>
      </div>
    );
  }

  // Get areas and locations
  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();

  const { data: areas } = await adminSupabase
    .from('service_areas')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const { data: locations } = await adminSupabase
    .from('service_locations')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  const safeAreas = areas || [];
  const safeLocations = locations || [];

  return <LocationsManager areas={safeAreas} locations={safeLocations} />;
}
