'use client';

import { useActionState, useEffect, useState } from 'react';
import { createMenuCategory, updateMenuCategory, restoreMenuCategory } from '@/app/actions/menu';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useModalUX } from '@/hooks/useModalUX';

export function CategoryModal({ isOpen, onClose, category }: { isOpen: boolean, onClose: () => void, category: Record<string, unknown> | null }) {
  const isEditing = !!category;
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  useModalUX(isOpen, onClose);
  
  const [state, formAction, isPending] = useActionState(
    isEditing ? updateMenuCategory : createMenuCategory,
    { success: false, error: null, isArchivedDuplicate: false, archivedId: undefined } as { success: boolean, error: string | null, isArchivedDuplicate?: boolean, archivedId?: string }
  );

  const typedState = state as { success: boolean, error: string | null, isArchivedDuplicate?: boolean, archivedId?: string };

  const [restoreState, restoreAction, isRestorePending] = useActionState(restoreMenuCategory, { success: false, error: null });

  useEffect(() => {
    if (state.success || restoreState.success) {
      onClose();
    }
  }, [state.success, restoreState.success, onClose]);

  if (!isOpen) return null;

  const isPendingAny = isPending || isRestorePending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-lg rounded-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold font-heading text-foreground">
            {isEditing ? 'Edit Category' : 'Add Category'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isPendingAny} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {typedState.isArchivedDuplicate ? (
          <form action={restoreAction} className="p-6 space-y-6">
             <div className="text-sm text-warning font-medium bg-warning/10 border border-warning/20 p-4 rounded-md">
               {typedState.error}
             </div>
             <input type="hidden" name="id" value={typedState.archivedId} />
             <div className="pt-4 flex gap-3">
               <Button type="button" variant="outline" onClick={onClose} disabled={isPendingAny} className="flex-1">
                 Cancel
               </Button>
               <Button type="submit" disabled={isPendingAny} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] transition-transform">
                 Restore Category
               </Button>
             </div>
          </form>
        ) : (
          <form action={formAction} className="p-6 space-y-6">
            {(typedState.error || restoreState.error) && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {(typedState.error) || (restoreState.error as string)}
              </div>
            )}

          {isEditing && <input type="hidden" name="id" value={category?.id as string} />}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Category Name <span className="text-destructive">*</span>
            </label>
            <input 
              type="text" 
              name="name" 
              defaultValue={(category?.name as string) || ''}
              placeholder="e.g. Starters, Mains, Drinks"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
              required
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description (Optional)</label>
            <textarea 
              name="description" 
              defaultValue={(category?.description as string) || ''}
              placeholder="A brief description of this section..."
              className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none" 
              maxLength={300}
            />
          </div>

          <div className="pt-2">
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Advanced display settings
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-sm font-medium text-foreground">Display Order</label>
                <input 
                  type="number" 
                  name="sort_order" 
                  defaultValue={(category?.sort_order as number) ?? 0}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                />
                <p className="text-[10px] text-muted-foreground">Lower numbers appear earlier in the menu. Most users can leave this unchanged.</p>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPendingAny} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPendingAny} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] transition-transform">
              Save Category
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
