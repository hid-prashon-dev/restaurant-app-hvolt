'use client';

import { useActionState, useState, useRef } from 'react';
import { createServiceLocation } from '@/app/actions/locations';
import { Button } from '@/components/ui/button';

export function LocationFormModal({ areas, initialAreaId }: { areas: any[], initialAreaId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await createServiceLocation(prevState, formData);
        if (result.success) {
          formRef.current?.reset();
          setIsOpen(false);
        }
        return result;
      } catch (e: any) {
        return { success: false, error: 'Something went wrong. Please try again.' };
      }
    },
    { success: false, error: null }
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant={initialAreaId ? 'outline' : 'default'} size={initialAreaId ? 'sm' : 'default'} className={initialAreaId ? "" : "bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2"}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add Location
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border shadow-lg rounded-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="font-heading font-bold text-lg text-foreground">Add Location</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
            </div>

            <form ref={formRef} action={formAction} className="p-6 space-y-4">
              {state.error && (
                <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                  {state.error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Area</label>
                <select 
                  name="area_id" 
                  required
                  defaultValue={initialAreaId}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name} ({area.type.replace(/_/g, ' ')})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  placeholder="e.g. Table 1, Room 101"
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <select 
                  name="type" 
                  required
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <option value="TABLE">Table</option>
                  <option value="ROOM">Room</option>
                  <option value="KITCHEN_STATION">Kitchen Station</option>
                  <option value="COUNTER">Counter</option>
                  <option value="FRONT_DESK_STATION">Front Desk Station</option>
                  <option value="STORAGE">Storage</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Capacity (Optional)</label>
                <input 
                  type="number" 
                  name="capacity" 
                  placeholder="e.g. 4 (Seats/Beds)"
                  min="1"
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2">
                  {isPending ? 'Adding...' : 'Add Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
