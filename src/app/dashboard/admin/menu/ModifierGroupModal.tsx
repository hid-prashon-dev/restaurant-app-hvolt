'use client';

import { useActionState, useEffect, useState } from 'react';
import { upsertModifierGroup } from '@/app/actions/menu';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2 } from 'lucide-react';
import { useModalUX } from '@/hooks/useModalUX';

type Modifier = {
  id?: string;
  name: string;
  price: number;
  status?: string;
};

type ModifierGroup = {
  id?: string;
  name: string;
  description?: string;
  selection_type: 'SINGLE' | 'MULTIPLE';
  is_required: boolean;
  min_selections: number;
  max_selections: number | null;
  modifiers?: Modifier[];
};

export function ModifierGroupModal({ isOpen, onClose, group }: { isOpen: boolean, onClose: () => void, group: ModifierGroup | null }) {
  const isEditing = !!group;
  
  useModalUX(isOpen, onClose);
  
  const [state, formAction, isPending] = useActionState(upsertModifierGroup, { success: false, error: null });
  const typedState = state as { success: boolean, error: string | null };

  const [selectionType, setSelectionType] = useState<'SINGLE' | 'MULTIPLE'>(group?.selection_type || 'SINGLE');
  const [isRequired, setIsRequired] = useState(group ? group.is_required : false);
  const [min, setMin] = useState(group?.min_selections || 0);
  const [max, setMax] = useState<number | ''>(group?.max_selections ?? (selectionType === 'SINGLE' ? 1 : ''));

  const [modifiers, setModifiers] = useState<Modifier[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (group) {
        setSelectionType(group.selection_type);
        setIsRequired(group.is_required);
        setMin(group.min_selections);
        setMax(group.max_selections ?? '');
        setModifiers(group.modifiers?.filter(m => m.status !== 'ARCHIVED') || []);
      } else {
        setSelectionType('SINGLE');
        setIsRequired(false);
        setMin(0);
        setMax(1);
        setModifiers([{ name: '', price: 0 }]);
      }
    }
  }, [isOpen, group]);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  // Adjust min/max based on type changes
  useEffect(() => {
    if (selectionType === 'SINGLE') {
      setMax(1);
      if (isRequired) setMin(1);
      else setMin(0);
    } else {
      if (isRequired && min < 1) setMin(1);
      if (!isRequired) setMin(0);
    }
  }, [selectionType, isRequired]);

  const addModifier = () => setModifiers(prev => [...prev, { name: '', price: 0 }]);

  const updateModifier = (index: number, field: keyof Modifier, value: any) => {
    setModifiers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeModifier = (index: number) => {
    setModifiers(prev => {
      const copy = [...prev];
      if (copy[index].id) {
        copy[index].status = 'ARCHIVED';
      } else {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  if (!isOpen) return null;

  const visibleModifiers = modifiers.map((m, i) => ({ ...m, originalIndex: i })).filter(m => m.status !== 'ARCHIVED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-lg rounded-xl max-w-2xl w-full animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <h2 className="text-xl font-bold font-heading text-foreground">
            {isEditing ? 'Edit Modifier Group' : 'Add Modifier Group'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isPending} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="modifier-group-form" action={formAction} className="space-y-6">
            {typedState.error && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {typedState.error}
              </div>
            )}

            {isEditing && <input type="hidden" name="id" value={group?.id} />}
            <input type="hidden" name="selection_type" value={selectionType} />
            <input type="hidden" name="is_required" value={isRequired.toString()} />
            <input type="hidden" name="min_selections" value={min} />
            <input type="hidden" name="max_selections" value={max} />
            <input type="hidden" name="modifiers" value={JSON.stringify(modifiers)} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Group Name <span className="text-destructive">*</span></label>
              <input 
                type="text" name="name" defaultValue={group?.name} placeholder="e.g. Spice Level, Add-ons" required maxLength={80}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                <label className="text-sm font-bold text-foreground block">Selection Rules</label>
                
                <div className="flex gap-2">
                  <Button type="button" variant={selectionType === 'SINGLE' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setSelectionType('SINGLE')}>
                    Single
                  </Button>
                  <Button type="button" variant={selectionType === 'MULTIPLE' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setSelectionType('MULTIPLE')}>
                    Multiple
                  </Button>
                </div>

                <label className="flex items-center gap-2 mt-4 select-none cursor-pointer">
                  <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
                  <span className="text-sm font-medium">Customer must select</span>
                </label>
              </div>

              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                <label className="text-sm font-bold text-foreground block">Limits</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Min Selections</label>
                    <input 
                      type="number" value={min} onChange={e => setMin(parseInt(e.target.value) || 0)} min={isRequired ? 1 : 0} disabled={selectionType === 'SINGLE' && isRequired}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Max Selections</label>
                    <input 
                      type="number" value={max} onChange={e => setMax(e.target.value ? parseInt(e.target.value) : '')} min={min} disabled={selectionType === 'SINGLE'} placeholder="No max"
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Modifiers</label>
                <Button type="button" variant="outline" size="sm" onClick={addModifier} className="h-7 text-xs px-2 gap-1">
                  <Plus className="w-3 h-3" /> Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {visibleModifiers.map((mod, displayIndex) => (
                  <div key={displayIndex} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-muted/10 p-2 sm:p-0 sm:bg-transparent rounded-lg sm:rounded-none border sm:border-none border-border">
                    <div className="flex-1 w-full">
                      <input 
                        type="text" value={mod.name} onChange={e => updateModifier(mod.originalIndex, 'name', e.target.value)} placeholder="Option name (e.g. Extra Cheese)" required maxLength={80}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative w-full sm:w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">+</span>
                        <input 
                          type="number" step="0.01" min="0" value={mod.price} onChange={e => updateModifier(mod.originalIndex, 'price', parseFloat(e.target.value) || 0)} required
                          className="w-full h-9 rounded-md border border-input bg-background pl-6 pr-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeModifier(mod.originalIndex)} className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {visibleModifiers.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                    No modifiers added. Click "Add Option" to create one.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="modifier-group-form" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium active:scale-[0.98] transition-transform min-w-[100px]">
            {isEditing ? 'Save Changes' : 'Create Group'}
          </Button>
        </div>
      </div>
    </div>
  );
}
