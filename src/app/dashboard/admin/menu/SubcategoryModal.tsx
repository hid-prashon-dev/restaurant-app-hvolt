'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { createMenuSubcategories, updateMenuSubcategory } from '@/app/actions/menu';
import { Button } from '@/components/ui/button';
import { Plus, X, ListPlus } from 'lucide-react';
import { useModalUX } from '@/hooks/useModalUX';

type Subcategory = Record<string, unknown>;
type Category = Record<string, unknown>;

export function SubcategoryModal({ 
  isOpen, 
  onClose, 
  category,
  subcategory, 
  onOptimistic 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  category: Category,
  subcategory?: Subcategory | null, 
  onOptimistic?: (s: Subcategory) => void 
}) {
  useModalUX(isOpen, onClose);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-lg rounded-xl max-w-2xl w-full p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold font-heading mb-4 shrink-0">
          {subcategory ? 'Edit Subcategory' : `Add Subcategories to ${category.name}`}
        </h2>
        
        {subcategory ? (
           <SingleEditMode subcategory={subcategory} category={category} onClose={onClose} />
        ) : (
           <BulkAddMode category={category} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function SingleEditMode({ subcategory, category, onClose }: { subcategory: Subcategory, category: Category, onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(updateMenuSubcategory, null);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4 overflow-y-auto">
      {state?.error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md font-medium">
          {state.error}
        </div>
      )}
      <input type="hidden" name="id" value={subcategory.id as string} />
      
      <div>
        <label className="block text-sm font-bold text-foreground mb-1.5">Subcategory Name</label>
        <input 
          type="text" 
          name="name" 
          defaultValue={subcategory.name as string || ''}
          required 
          maxLength={80}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-medium"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground mb-1.5">Description (Optional)</label>
        <textarea 
          name="description" 
          defaultValue={subcategory.description as string || ''}
          maxLength={300}
          className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-medium resize-y"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6 shrink-0">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-[100px] font-bold">
          Update
        </Button>
      </div>
    </form>
  );
}

function BulkAddMode({ category, onClose }: { category: Category, onClose: () => void }) {
  const [rows, setRows] = useState([{ id: Date.now(), name: '', description: '' }]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const addRow = () => {
    if (rows.length >= 25) return;
    setRows([...rows, { id: Date.now(), name: '', description: '' }]);
  };

  const removeRow = (id: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: string, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleQuickPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
      const newRows = lines.map((name, i) => ({ id: Date.now() + i, name: name.substring(0, 80), description: '' }));
      const emptyCount = rows.filter(r => !r.name && !r.description).length;
      if (emptyCount === rows.length) {
         setRows(newRows.slice(0, 25));
      } else {
         setRows([...rows, ...newRows].slice(0, 25));
      }
      e.target.value = '';
    }
  };

  const applyTemplate = (names: string[]) => {
    const newRows = names.map((name, i) => ({ id: Date.now() + i, name, description: '' }));
    setRows(newRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validRows = rows.filter(r => r.name.trim().length > 0).map((r, i) => ({
      name: r.name,
      description: r.description,
      sort_order: i * 10
    }));

    if (validRows.length === 0) {
      setError('Please enter at least one subcategory name.');
      return;
    }

    startTransition(async () => {
      const res = await createMenuSubcategories(category.id as string, validRows);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save subcategories.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md font-medium shrink-0">
          {error}
        </div>
      )}

      <div className="overflow-y-auto flex-1 pr-2 space-y-6">
        <div className="space-y-4">
           {rows.map((row, index) => (
             <div key={row.id} className="flex items-start gap-2 bg-muted/20 p-3 rounded-lg border border-border">
               <div className="flex-1 space-y-2">
                 <input 
                   type="text" 
                   value={row.name}
                   onChange={e => updateRow(row.id, 'name', e.target.value)}
                   placeholder={`Subcategory ${index + 1}`}
                   maxLength={80}
                   className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-medium"
                 />
                 <input 
                   type="text" 
                   value={row.description}
                   onChange={e => updateRow(row.id, 'description', e.target.value)}
                   placeholder="Optional description"
                   maxLength={150}
                   className="w-full h-8 px-3 rounded-md border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-muted-foreground"
                 />
               </div>
               {rows.length > 1 && (
                 <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(row.id)} className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive">
                   <X className="w-4 h-4" />
                 </Button>
               )}
             </div>
           ))}
        </div>

        {rows.length < 25 && (
          <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Add another row
          </Button>
        )}

        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <label className="block text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
            <ListPlus className="w-3 h-3" /> Quick Paste (Multiple Lines)
          </label>
          <textarea 
            onChange={handleQuickPaste}
            placeholder="Paste a list of items here, one per line..."
            className="w-full min-h-[60px] p-2.5 rounded-md border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-y"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground">Quick Templates</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => applyTemplate(['Steam', 'Jhol', 'Fried', 'C-Momo', 'Kothey'])} className="text-[10px] font-bold bg-muted hover:bg-muted/80 px-2 py-1 rounded border border-border/50 transition-colors">
               Momo Types
            </button>
            <button type="button" onClick={() => applyTemplate(['Hot', 'Cold', 'Bottled', 'Fresh Juice'])} className="text-[10px] font-bold bg-muted hover:bg-muted/80 px-2 py-1 rounded border border-border/50 transition-colors">
               Drinks
            </button>
            <button type="button" onClick={() => applyTemplate(['Small Plates', 'Mains', 'Sides', 'Dessert'])} className="text-[10px] font-bold bg-muted hover:bg-muted/80 px-2 py-1 rounded border border-border/50 transition-colors">
               General Menu
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4 shrink-0 bg-card">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-[150px] font-bold">
          Save Subcategories
        </Button>
      </div>
    </form>
  );
}
