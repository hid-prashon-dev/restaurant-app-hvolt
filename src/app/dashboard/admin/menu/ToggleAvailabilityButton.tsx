'use client';

import { useTransition, useState, useOptimistic } from 'react';
import { toggleMenuItemAvailability } from '@/app/actions/menu';
import { Button } from '@/components/ui/button';
import { Power, PowerOff } from 'lucide-react';

export function ToggleAvailabilityButton({ item }: { item: Record<string, unknown> }) {
  const [optimisticIsAvailable, addOptimisticIsAvailable] = useOptimistic<boolean, boolean>(
    item.is_available as boolean,
    (_, newStatus) => newStatus
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      addOptimisticIsAvailable(!optimisticIsAvailable);
      const fd = new FormData();
      fd.append('id', item.id as string);
      fd.append('is_available', (!optimisticIsAvailable).toString());
      const res = await toggleMenuItemAvailability({ success: false, error: null }, fd);
      if (res && !res.success) {
        setError(res.error || 'Failed to update');
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-[10px] text-destructive font-medium">{error}</span>}
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        onClick={handleToggle}
        disabled={isPending}
        className={`h-8 px-2 transition-all active:scale-[0.98] disabled:opacity-50 ${optimisticIsAvailable ? 'text-muted-foreground hover:text-warning hover:bg-warning/10' : 'text-warning hover:text-success hover:bg-success/10'}`}
        title={optimisticIsAvailable ? 'Mark as unavailable' : 'Mark as available'}
      >
        {optimisticIsAvailable ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
      </Button>
    </div>
  );
}
