'use client';

import { useActionState } from 'react';
import { updateTenantModules } from '@/app/actions/tenant';
import { Button } from '@/components/ui/button';

export function ModulesForm({ initialModules }: { initialModules: any }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        return await updateTenantModules(prevState, formData);
      } catch (e: any) {
        return { success: false, error: 'Something went wrong. Please try again.' };
      }
    },
    { success: false, error: null }
  );

  const modules = [
    { key: 'restaurant', label: 'Restaurant Operations', desc: 'Core dining, tables, and service areas.' },
    { key: 'pos', label: 'Point of Sale (POS)', desc: 'Order entry, ticketing, and checkout.', comingSoon: true },
    { key: 'kitchen_display', label: 'Kitchen Display System (KDS)', desc: 'Digital order fulfillment for kitchen staff.', comingSoon: true },
    { key: 'qr_ordering', label: 'QR Ordering', desc: 'Customer-facing table ordering.', comingSoon: true },
    { key: 'hotel', label: 'Hotel Operations', desc: 'Core property, floors, and room management.' },
    { key: 'rooms', label: 'Room Booking Engine', desc: 'Reservations and folios.', comingSoon: true },
    { key: 'housekeeping', label: 'Housekeeping', desc: 'Task workflows and cleaning status.', comingSoon: true },
    { key: 'room_service', label: 'Room Service', desc: 'In-room dining integration.', comingSoon: true },
    { key: 'inventory', label: 'Inventory Management', desc: 'Stock tracking and movements.', comingSoon: true },
    { key: 'reports', label: 'Advanced Reporting', desc: 'Business analytics and exports.', comingSoon: true }
  ];

  return (
    <form action={formAction} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="font-heading font-bold text-xl text-foreground">Module Setup</h2>
        {state.success && <span className="text-sm text-success font-medium">Saved successfully!</span>}
      </div>

      {state.error && (
        <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        {modules.map((mod) => (
          <div key={mod.key} className="flex items-start justify-between p-4 border border-border rounded-lg bg-background">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground">{mod.label}</h3>
                {mod.comingSoon && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Coming Later
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{mod.desc}</p>
            </div>
            <div className="pt-1 flex items-center">
              <input
                type="checkbox"
                name={mod.key}
                defaultChecked={initialModules[mod.key] === true}
                className="w-5 h-5 rounded border-input text-primary focus:ring-primary/50 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 min-w-32">
          {isPending ? 'Saving...' : 'Save Modules'}
        </Button>
      </div>
    </form>
  );
}
