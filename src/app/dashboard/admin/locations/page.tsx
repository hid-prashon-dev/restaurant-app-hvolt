import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AreaFormModal } from './AreaForm';
import { LocationFormModal } from './LocationForm';
import { ArchiveAreaButton, ArchiveLocationButton } from './ArchiveButtons';
import { formatAreaType, formatLocationType } from '@/lib/formatters';

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
    .neq('status', 'ARCHIVED')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const { data: locations } = await adminSupabase
    .from('service_locations')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .neq('status', 'ARCHIVED')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  const safeAreas = areas || [];
  const safeLocations = locations || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Operational Areas</h1>
          <p className="text-muted-foreground mt-2">
            Map out your physical business layout (e.g., Dining Rooms, Hotel Floors) and their specific locations (e.g., Tables, Rooms).
          </p>
        </div>
        <div className="flex items-center gap-3">
          {safeAreas.length > 0 && <LocationFormModal areas={safeAreas} />}
          <AreaFormModal />
        </div>
      </div>

      <div className="space-y-6">
        {safeAreas.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground">No Areas Mapped</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              You haven't added any service areas yet. Start by creating an area like "Main Dining Room" or "First Floor".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {safeAreas.map(area => {
              const areaLocations = safeLocations.filter(l => l.area_id === area.id);
              return (
                <div key={area.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                        {area.name}
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {formatAreaType(area.type)}
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {area.description ? `${area.description} • ` : ''}
                        {areaLocations.length} active location{areaLocations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <LocationFormModal areas={safeAreas} initialAreaId={area.id} />
                      <ArchiveAreaButton id={area.id} name={area.name} />
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {areaLocations.map(loc => (
                        <div key={loc.id} className="border border-border rounded-lg p-3 bg-background flex flex-col justify-between group hover:border-primary/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm text-foreground truncate pr-2">{loc.name}</div>
                            <ArchiveLocationButton id={loc.id} name={loc.name} />
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{formatLocationType(loc.type)}</div>
                            {loc.capacity && <div className="text-xs text-muted-foreground mt-0.5">Capacity: {loc.capacity}</div>}
                          </div>
                        </div>
                      ))}

                      {areaLocations.length === 0 && (
                        <div className="col-span-full text-sm text-muted-foreground italic p-4 border border-border border-dashed rounded-lg text-center">
                          No locations added to this area yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
