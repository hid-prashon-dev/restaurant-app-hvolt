'use client';

import { useTransition, useState } from 'react';
import { toggleMenuItemAvailability } from '@/app/actions/menu';
import { Button } from '@/components/ui/button';
import { Power, PowerOff } from 'lucide-react';

export function ToggleAvailabilityButton({ 
  item,
  onOptimistic,
  onSuccess 
}: { 
  item: Record<string, unknown>;
  onOptimistic?: (newStatus: boolean) => void;
  onSuccess?: (newStatus: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isAvailable = item.is_available as boolean;

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const newStatus = !isAvailable;
      if (onOptimistic) onOptimistic(newStatus);
      
      const fd = new FormData();
      fd.append('id', item.id as string);
      fd.append('is_available', newStatus.toString());
      
      const res = await toggleMenuItemAvailability({ success: false, error: null }, fd);
      if (res && res.success) {
        if (onSuccess) onSuccess(res.is_available as boolean);
      } else {
        setError(res?.error || 'Failed to update');
        // Rollback optimistic state by triggering onOptimistic with old value if needed
        if (onOptimistic) onOptimistic(isAvailable);
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
        className={`h-8 px-2 transition-all active:scale-[0.98] disabled:opacity-50 ${isAvailable ? 'text-muted-foreground hover:text-warning hover:bg-warning/10' : 'text-warning hover:text-success hover:bg-success/10'}`}
        title={isAvailable ? 'Mark as unavailable' : 'Mark as available'}
      >
        {isAvailable ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
      </Button>
    </div>
  );
}
