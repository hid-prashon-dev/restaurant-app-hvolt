'use client';

import { useState, useOptimistic } from 'react';
import { AreaFormModal } from './AreaForm';
import { LocationFormModal } from './LocationForm';
import { ArchiveAreaButton, ArchiveLocationButton, RestoreAreaButton, RestoreLocationButton } from './ArchiveButtons';
import { formatAreaType, formatLocationType } from '@/lib/formatters';

type RecordType = { id: string, name: string, type: string, description?: string, capacity?: number, area_id?: string, status: string, [key: string]: any };

export function LocationsManager({ areas, locations }: { areas: RecordType[], locations: RecordType[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [optimisticAreas, addOptimisticArea] = useOptimistic(areas, (state, updatedArea: RecordType) => 
    state.map(a => a.id === updatedArea.id ? updatedArea : a)
  );

  const [optimisticLocations, addOptimisticLocation] = useOptimistic(locations, (state, updatedLoc: RecordType) => 
    state.map(l => l.id === updatedLoc.id ? updatedLoc : l)
  );

  const activeAreas = optimisticAreas.filter(a => a.status === 'ACTIVE');
  const activeLocations = optimisticLocations.filter(l => l.status === 'ACTIVE');
  
  const archivedAreas = optimisticAreas.filter(a => a.status === 'ARCHIVED');
  const archivedLocations = optimisticLocations.filter(l => l.status === 'ARCHIVED');

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
          {activeAreas.length > 0 && <LocationFormModal areas={activeAreas} />}
          <AreaFormModal />
        </div>
      </div>

      {globalError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium p-3 rounded-md animate-in fade-in">
          {globalError}
          <button onClick={() => setGlobalError(null)} className="ml-4 underline opacity-80 hover:opacity-100">Dismiss</button>
        </div>
      )}

      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'active' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'archived' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Archived
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeAreas.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground">No Areas Mapped</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                You haven't added any service areas yet. Start by creating an area like "Main Dining Room" or "First Floor".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeAreas.map(area => {
                const areaLocations = activeLocations.filter(l => l.area_id === area.id);
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
                        <LocationFormModal areas={activeAreas} initialAreaId={area.id} />
                        <ArchiveAreaButton id={area.id} name={area.name} onOptimistic={() => addOptimisticArea({ ...area, status: 'ARCHIVED' })} onError={setGlobalError} />
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {areaLocations.map(loc => (
                          <div key={loc.id} className="border border-border rounded-lg p-3 bg-background flex flex-col justify-between group hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-sm text-foreground truncate pr-2">{loc.name}</div>
                              <ArchiveLocationButton id={loc.id} name={loc.name} onOptimistic={() => addOptimisticLocation({ ...loc, status: 'ARCHIVED' })} onError={setGlobalError} />
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
      )}

      {activeTab === 'archived' && (
        <div className="space-y-6">
          {archivedAreas.length === 0 && archivedLocations.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground opacity-50">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground">Archive Empty</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                No archived areas or locations.
              </p>
            </div>
          ) : (
            <>
              {archivedAreas.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-heading font-bold text-muted-foreground">Archived Areas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archivedAreas.map(area => (
                      <div key={area.id} className="bg-card border border-border rounded-xl p-4 opacity-75">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-foreground line-through decoration-muted-foreground/50">{area.name}</h4>
                          <RestoreAreaButton id={area.id} name={area.name} onOptimistic={() => addOptimisticArea({ ...area, status: 'ACTIVE' })} onError={setGlobalError} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded inline-block">
                          {formatAreaType(area.type)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {archivedLocations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-heading font-bold text-muted-foreground">Archived Locations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archivedLocations.map(loc => {
                      const parentArea = areas.find(a => a.id === loc.area_id);
                      return (
                        <div key={loc.id} className="bg-card border border-border rounded-xl p-4 opacity-75">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-foreground line-through decoration-muted-foreground/50">{loc.name}</h4>
                            <RestoreLocationButton id={loc.id} name={loc.name} parentAreaActive={parentArea?.status === 'ACTIVE'} onOptimistic={() => addOptimisticLocation({ ...loc, status: 'ACTIVE' })} onError={setGlobalError} />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Area: {parentArea?.name || 'Unknown'} {parentArea?.status === 'ARCHIVED' && '(Archived)'}
                          </div>
                          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-2">
                            {formatLocationType(loc.type)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
