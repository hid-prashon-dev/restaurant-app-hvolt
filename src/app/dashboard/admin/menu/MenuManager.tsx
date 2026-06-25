'use client';

import { useState, useMemo, useTransition, useOptimistic, useEffect, useActionState } from 'react';
import { createTemplateCategories, archiveMenuCategory, archiveMenuItem, restoreMenuCategory, restoreMenuItem, bulkArchiveMenuCategories, bulkRestoreMenuCategories, archiveMenuSubcategory, restoreMenuSubcategory, archiveModifierGroup, restoreModifierGroup } from '@/app/actions/menu';
import { Plus, Archive, Search, Filter, SlidersHorizontal, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryModal } from './CategoryModal';
import { ItemModal } from './ItemModal';
import { ToggleAvailabilityButton } from './ToggleAvailabilityButton';
import { SubcategoryModal } from './SubcategoryModal';
import { ModifierGroupModal } from './ModifierGroupModal';

type Category = Record<string, unknown>;
type Subcategory = Record<string, unknown>;
type Item = Record<string, unknown>;

function ActionConfirmModal({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-lg rounded-xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="button" variant="destructive" onClick={onConfirm} className="flex-1">Archive</Button>
        </div>
      </div>
    </div>
  );
}

function ArchiveItemAction({ item, onOptimistic, onError }: { item: Item, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', item.id as string);
      const res = await archiveMenuItem(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50" 
          disabled={isPending}
          onClick={() => setIsOpen(true)}
        >
          <Archive className="w-4 h-4" />
        </Button>
      </div>
      <ActionConfirmModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} title="Archive Dish" message={`Are you sure you want to archive "${item.name}"?`} />
    </>
  );
}

function ArchiveCategoryAction({ category, activeItemsCount, onOptimistic, onError }: { category: Category, activeItemsCount: number, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    if (activeItemsCount > 0) {
      onError?.(`Cannot archive category "${category.name}" because it contains ${activeItemsCount} active dish(es). Archive the dishes first.`);
      return;
    }
    setIsOpen(true);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', category.id as string);
      const res = await archiveMenuCategory(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50" 
          disabled={isPending}
          onClick={handleOpen}
        >
          Archive Category
        </Button>
      </div>
      <ActionConfirmModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} title="Archive Category" message={`Are you sure you want to archive "${category.name}"?`} />
    </>
  );
}

function ArchiveSubcategoryAction({ subcategory, activeItemsCount, onOptimistic, onError }: { subcategory: Subcategory, activeItemsCount: number, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    if (activeItemsCount > 0) {
      onError?.(`Cannot archive subcategory "${subcategory.name}" because it contains ${activeItemsCount} active dish(es). Archive the dishes first.`);
      return;
    }
    setIsOpen(true);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', subcategory.id as string);
      const res = await archiveMenuSubcategory(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive disabled:opacity-50" 
        disabled={isPending}
        onClick={handleOpen}
      >
        Archive
      </Button>
      <ActionConfirmModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} title="Archive Subcategory" message={`Are you sure you want to archive "${subcategory.name}"?`} />
    </>
  );
}

function RestoreItemAction({ item, activeCategoryIds, onOptimistic, onError }: { item: Item, activeCategoryIds: string[], onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    if (!activeCategoryIds.includes(item.category_id as string)) {
      onError?.('Restore the parent category first.');
      return;
    }
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', item.id as string);
      const res = await restoreMenuItem(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end">
      <Button variant="outline" size="sm" onClick={handleRestore} disabled={isPending} className="h-8 text-xs font-bold disabled:opacity-50">
        Restore Dish
      </Button>
    </div>
  );
}

function RestoreSubcategoryAction({ subcategory, activeCategoryIds, onOptimistic, onError }: { subcategory: Subcategory, activeCategoryIds: string[], onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    if (!activeCategoryIds.includes(subcategory.category_id as string)) {
      onError?.('Restore the parent category first.');
      return;
    }
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', subcategory.id as string);
      const res = await restoreMenuSubcategory(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRestore} disabled={isPending} className="h-6 text-[10px] font-bold disabled:opacity-50 px-2">
      Restore
    </Button>
  );
}

function RestoreCategoryAction({ category, onOptimistic, onError }: { category: Category, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', category.id as string);
      const res = await restoreMenuCategory(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end">
      <Button variant="outline" size="sm" className="h-7 px-3 text-xs font-bold disabled:opacity-50" disabled={isPending} onClick={handleRestore}>
        Restore Category
      </Button>
    </div>
  );
}

function ArchiveModifierGroupAction({ group, activeItemsCount, onOptimistic, onError }: { group: ModifierGroup, activeItemsCount: number, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    if (activeItemsCount > 0) {
      onError?.(`Cannot archive group "${group.name}" because it is attached to ${activeItemsCount} active dish(es). Remove it from the dishes first.`);
      return;
    }
    setIsOpen(true);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', group.id as string);
      const res = await archiveModifierGroup(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50" 
          disabled={isPending}
          onClick={handleOpen}
        >
          Archive Group
        </Button>
      </div>
      <ActionConfirmModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} title="Archive Modifier Group" message={`Are you sure you want to archive "${group.name}"? This group will be hidden from the active list.`} />
    </>
  );
}

function RestoreModifierGroupAction({ group, onOptimistic, onError }: { group: ModifierGroup, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', group.id as string);
      const res = await restoreModifierGroup(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end">
      <Button variant="outline" size="sm" className="h-7 px-3 text-xs font-bold disabled:opacity-50" disabled={isPending} onClick={handleRestore}>
        Restore Group
      </Button>
    </div>
  );
}


function BulkArchiveCategoriesAction({ selectedIds, activeItems, onClear, onOptimistic, onError }: { selectedIds: string[], activeItems: Item[], onClear: () => void, onOptimistic: (ids: string[]) => void, onError: (err: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    const categoriesWithItems = selectedIds.filter(id => activeItems.some(i => i.category_id === id));
    if (categoriesWithItems.length > 0) {
      onError(`Cannot bulk archive: ${categoriesWithItems.length} selected category(s) contain active dishes.`);
      return;
    }
    setIsOpen(true);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic(selectedIds);
      const fd = new FormData();
      fd.append('ids', selectedIds.join(','));
      const res = await bulkArchiveMenuCategories(null, fd);
      if (!res.success) {
        onError(res.error);
      } else {
        onClear();
      }
    });
  };

  return (
    <>
      <Button variant="destructive" size="sm" className="h-7 px-3 text-xs disabled:opacity-50" disabled={isPending} onClick={handleOpen}>
        Archive Selected
      </Button>
      <ActionConfirmModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} title="Bulk Archive Categories" message={`Are you sure you want to archive ${selectedIds.length} categories?`} />
    </>
  );
}

function BulkRestoreCategoriesAction({ selectedIds, onClear, onOptimistic, onError }: { selectedIds: string[], onClear: () => void, onOptimistic: (ids: string[]) => void, onError: (err: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic(selectedIds);
      const fd = new FormData();
      fd.append('ids', selectedIds.join(','));
      const res = await bulkRestoreMenuCategories(null, fd);
      if (!res.success) {
        onError(res.error);
      } else {
        onClear();
      }
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" className="h-7 px-3 text-xs font-bold disabled:opacity-50" disabled={isPending} onClick={() => setIsOpen(true)}>
        Restore Selected
      </Button>
      <ActionConfirmModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} title="Bulk Restore Categories" message={`Are you sure you want to restore ${selectedIds.length} categories?`} />
    </>
  );
}

type Variant = Record<string, unknown>;
type ModifierGroup = Record<string, unknown>;
type Modifier = Record<string, unknown>;
type ItemModifierGroup = Record<string, unknown>;

export function MenuManager({ 
  categories, 
  subcategories = [], 
  items, 
  variants = [], 
  modifierGroups = [],
  modifiers = [],
  itemModifierGroups = [],
  currency 
}: { 
  categories: Category[], 
  subcategories?: Subcategory[], 
  items: Item[], 
  variants?: Variant[], 
  modifierGroups?: ModifierGroup[],
  modifiers?: Modifier[],
  itemModifierGroups?: ItemModifierGroup[],
  currency: string 
}) {
  const [activeSection, setActiveSection] = useState<'DISHES' | 'CATEGORIES' | 'MODIFIERS' | 'ARCHIVED'>('DISHES');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [optimisticCategories, addOptimisticCategory] = useOptimistic(categories, (state, updatedCategory: Category) => 
    state.map(c => c.id === updatedCategory.id ? updatedCategory : c)
  );

  const [optimisticSubcategories, addOptimisticSubcategory] = useOptimistic(subcategories, (state, updatedSubcategory: Subcategory) => 
    state.map(s => s.id === updatedSubcategory.id ? updatedSubcategory : s)
  );

  const [optimisticItems, addOptimisticItem] = useOptimistic(items, (state, updatedItem: Item) => 
    state.map(i => i.id === updatedItem.id ? updatedItem : i)
  );

  const [optimisticVariants, addOptimisticVariant] = useOptimistic(variants, (state, updatedVariant: Variant) => {
    const exists = state.find(v => v.id === updatedVariant.id);
    if (exists) return state.map(v => v.id === updatedVariant.id ? updatedVariant : v);
    return [...state, updatedVariant];
  });
  
  const [optimisticModifierGroups, addOptimisticModifierGroup] = useOptimistic(modifierGroups, (state, updatedGroup: ModifierGroup) => {
    const exists = state.find(g => g.id === updatedGroup.id);
    if (exists) return state.map(g => g.id === updatedGroup.id ? updatedGroup : g);
    return [...state, updatedGroup];
  });

  const [optimisticModifiers, addOptimisticModifier] = useOptimistic(modifiers, (state, updatedMod: Modifier) => {
    const exists = state.find(m => m.id === updatedMod.id);
    if (exists) return state.map(m => m.id === updatedMod.id ? updatedMod : m);
    return [...state, updatedMod];
  });

  const [optimisticItemModifierGroups, addOptimisticItemModifierGroup] = useOptimistic(itemModifierGroups, (state, updatedAttach: ItemModifierGroup) => {
    const exists = state.find(a => a.id === updatedAttach.id);
    if (exists) return state.map(a => a.id === updatedAttach.id ? updatedAttach : a);
    return [...state, updatedAttach];
  });
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isModifierGroupModalOpen, setIsModifierGroupModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [activeCategoryForSub, setActiveCategoryForSub] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingModifierGroup, setEditingModifierGroup] = useState<ModifierGroup | null>(null);

  const activeCategories = optimisticCategories.filter(c => c.status === 'ACTIVE');
  const activeSubcategories = optimisticSubcategories.filter(s => s.status === 'ACTIVE');
  const activeItems = optimisticItems.filter(i => i.status === 'ACTIVE');
  const activeModifierGroups = optimisticModifierGroups.filter(g => g.status === 'ACTIVE');
  const archivedCategories = optimisticCategories.filter(c => c.status === 'ARCHIVED');
  const archivedSubcategories = optimisticSubcategories.filter(s => s.status === 'ARCHIVED');
  const archivedItems = optimisticItems.filter(i => i.status === 'ARCHIVED');
  const archivedModifierGroups = optimisticModifierGroups.filter(g => g.status === 'ARCHIVED');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    setSelectedCategories([]);
    setGlobalError(null);
  }, [activeSection]);

  const toggleCategorySelection = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('ALL');
  const [filterDishType, setFilterDishType] = useState<string>('ALL');
  const [filterAvailability, setFilterAvailability] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');
  
  const [showFutureFilters, setShowFutureFilters] = useState(false);

  const filteredItems = useMemo(() => {
    return activeItems.filter(item => {
      if (filterCategory !== 'ALL' && item.category_id !== filterCategory) return false;
      if (filterSubcategory !== 'ALL' && item.subcategory_id !== filterSubcategory) return false;
      if (filterDishType !== 'ALL' && item.dish_type !== filterDishType) return false;
      if (filterAvailability === 'AVAILABLE' && !item.is_available) return false;
      if (filterAvailability === 'UNAVAILABLE' && item.is_available) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!(item.name as string).toLowerCase().includes(q) && !((item.description as string) || '').toLowerCase().includes(q)) return false;
    }
      return true;
    });
  }, [activeItems, filterCategory, filterSubcategory, filterDishType, filterAvailability, searchQuery]);

  const getItemPriceDisplay = (item: Item) => {
    const itemVariants = optimisticVariants.filter(v => v.item_id === item.id && v.status === 'ACTIVE');
    if (itemVariants.length > 0) {
      const minPrice = Math.min(...itemVariants.map(v => v.price as number));
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold leading-none">From</span>
          <span className="leading-none">{currency} {minPrice.toFixed(2)}</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mt-0.5">
             {itemVariants.length} Variant{itemVariants.length > 1 ? 's' : ''}
          </span>
        </div>
      );
    }
    return <span className="leading-none">{currency} {(item.price as number).toFixed(2)}</span>;
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setIsCategoryModalOpen(true);
  };

  const openAddSubcategory = (c: Category) => {
    setActiveCategoryForSub(c);
    setEditingSubcategory(null);
    setIsSubcategoryModalOpen(true);
  };

  const openEditSubcategory = (c: Category, s: Subcategory) => {
    setActiveCategoryForSub(c);
    setEditingSubcategory(s);
    setIsSubcategoryModalOpen(true);
  };

  const openAddItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const openEditItem = (i: Item) => {
    setEditingItem(i);
    setIsItemModalOpen(true);
  };

  const openAddModifierGroup = () => {
    setEditingModifierGroup(null);
    setIsModifierGroupModalOpen(true);
  };

  const openEditModifierGroup = (g: ModifierGroup) => {
    setEditingModifierGroup(g);
    setIsModifierGroupModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('ALL');
    setFilterSubcategory('ALL');
    setFilterDishType('ALL');
    setFilterAvailability('ALL');
  };

  const [templateState, templateAction, isTemplatePending] = useActionState(createTemplateCategories, { success: false, error: null, message: undefined } as { success: boolean, error: string | null, message?: string });

  const getCategoryName = (id: string | unknown) => {
    const cat = activeCategories.find(c => c.id === id) || archivedCategories.find(c => c.id === id);
    return cat ? (cat.name as string) : 'Uncategorized';
  };

  const getSubcategoryName = (id: string | unknown) => {
    if (!id) return '';
    const sub = activeSubcategories.find(s => s.id === id) || archivedSubcategories.find(s => s.id === id);
    return sub ? (sub.name as string) : '';
  };

  const formatDishType = (type: string | unknown) => {
    if (!type) return '';
    const map: Record<string, string> = { VEG: 'Veg', NON_VEG: 'Non-Veg', VEGAN: 'Vegan', EGG: 'Egg', SEAFOOD: 'Seafood', GENERAL: 'General' };
    return map[type as string] || (type as string).replace('_', '-');
  };

  const topDishTypeData = useMemo(() => {
    const types = activeItems.filter(i => i.dish_type).map(i => i.dish_type as string);
    if (types.length === 0) return null;
    const counts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    let topType = '';
    let max = 0;
    for (const [type, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        topType = type;
      }
    }
    return { type: topType, count: max };
  }, [activeItems]);

  const activeCategoryIds = activeCategories.map(c => c.id as string);

  if (activeCategories.length === 0 && archivedCategories.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-card border border-border shadow-sm rounded-xl p-8 max-w-4xl mx-auto mt-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-2">Setup Your Menu Catalog</h2>
            <p className="text-muted-foreground">
              Start building your restaurant catalog. Create categories manually or use a quick-start template.
            </p>
          </div>

            {templateState.error && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md mb-6 text-center max-w-xl mx-auto">
                {templateState.error as string}
              </div>
            )}
            {templateState.message && (
              <div className="text-sm text-primary font-medium bg-primary/10 border border-primary/20 p-3 rounded-md mb-6 text-center max-w-xl mx-auto">
                {templateState.message as string}
              </div>
            )}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="border border-border rounded-xl p-6 bg-background hover:border-primary/50 transition-colors">
              <h3 className="font-heading font-bold text-lg mb-2">Create Manually</h3>
              <p className="text-sm text-muted-foreground mb-8">
                Start by adding categories like &quot;Starters&quot;, &quot;Mains&quot;, and &quot;Drinks&quot;, then populate them with dishes.
              </p>
              <Button onClick={openAddCategory} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Create Category Manually
              </Button>
            </div>

            <div className="border border-border rounded-xl p-6 bg-background hover:border-primary/50 transition-colors">
              <h3 className="font-heading font-bold text-lg mb-2">Quick Start Templates</h3>
              <p className="text-sm text-muted-foreground mb-6">Instantly create common categories to save time.</p>
              
              <div className="space-y-3 flex flex-col">
                <form action={templateAction}>
                  <input type="hidden" name="categories" value="Starters, Mains, Sides, Drinks, Desserts" />
                  <Button type="submit" variant="outline" disabled={isTemplatePending} className="w-full justify-between hover:bg-primary/5 whitespace-normal h-auto py-2 text-left">
                    <span>Basic Restaurant</span>
                  </Button>
                </form>

                <form action={templateAction}>
                  <input type="hidden" name="categories" value="Coffee, Tea, Bakery, Sandwiches, Desserts" />
                  <Button type="submit" variant="outline" disabled={isTemplatePending} className="w-full justify-between hover:bg-primary/5 whitespace-normal h-auto py-2 text-left">
                    <span>Cafe & Bakery</span>
                  </Button>
                </form>

                <form action={templateAction}>
                  <input type="hidden" name="categories" value="Momo, Chowmein, Thukpa, Rice & Curry, Snacks, Drinks" />
                  <Button type="submit" variant="outline" disabled={isTemplatePending} className="w-full justify-between hover:bg-primary/5 whitespace-normal h-auto py-2 text-left">
                    <span>Nepali Restaurant</span>
                  </Button>
                </form>
                
                <form action={templateAction}>
                  <input type="hidden" name="categories" value="Breakfast, Room Service, Dining, Beverages" />
                  <Button type="submit" variant="outline" disabled={isTemplatePending} className="w-full justify-between hover:bg-primary/5 whitespace-normal h-auto py-2 text-left">
                    <span>Hotel / Room Service</span>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {isCategoryModalOpen && (
          <CategoryModal 
            isOpen={isCategoryModalOpen} 
            onClose={() => setIsCategoryModalOpen(false)} 
            category={editingCategory} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* View Toggle & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex bg-muted/50 p-1 rounded-lg shrink-0 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveSection('DISHES')}
            className={`whitespace-nowrap flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeSection === 'DISHES' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Dishes
          </button>
          <button 
            onClick={() => setActiveSection('CATEGORIES')}
            className={`whitespace-nowrap flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeSection === 'CATEGORIES' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Categories
          </button>
          <button 
            onClick={() => setActiveSection('ARCHIVED')}
            className={`whitespace-nowrap flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeSection === 'ARCHIVED' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Archived
          </button>
          <button 
            onClick={() => setActiveSection('MODIFIERS')}
            className={`whitespace-nowrap flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeSection === 'MODIFIERS' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Modifiers
          </button>
          <button disabled className="whitespace-nowrap flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold text-muted-foreground opacity-50 cursor-not-allowed">
            Media <span className="ml-1 text-[9px] bg-muted-foreground/20 px-1 rounded-sm uppercase">Ph 7B</span>
          </button>
          <button disabled className="whitespace-nowrap flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold text-muted-foreground opacity-50 cursor-not-allowed">
            Variants <span className="ml-1 text-[9px] bg-muted-foreground/20 px-1 rounded-sm uppercase">Ph 7B</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          {activeSection === 'DISHES' && (
            <>
              <Button onClick={openAddCategory} variant="outline" className="bg-background shadow-sm whitespace-nowrap order-2 sm:order-1 font-bold">
                Add Category
              </Button>
              <Button onClick={openAddItem} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm whitespace-nowrap order-1 sm:order-2 font-bold">
                <Plus className="w-4 h-4 mr-2" /> Add Dish
              </Button>
            </>
          )}
          {activeSection === 'CATEGORIES' && (
            <>
              <form action={templateAction} className="order-2 sm:order-1 w-full sm:w-auto">
                <input type="hidden" name="categories" value="Starters, Mains, Sides, Drinks, Desserts" />
                <Button type="submit" variant="outline" disabled={isTemplatePending} className="w-full bg-background shadow-sm whitespace-nowrap font-bold">
                  Template Categories
                </Button>
              </form>
              <Button onClick={openAddCategory} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm whitespace-nowrap order-1 sm:order-2 font-bold w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </>
          )}
          {activeSection === 'MODIFIERS' && (
            <Button onClick={openAddModifierGroup} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm whitespace-nowrap font-bold">
              <Plus className="w-4 h-4 mr-2" /> Add Group
            </Button>
          )}

        </div>
      </div>

      {globalError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium p-3 rounded-md animate-in fade-in my-4">
          {globalError}
          <button onClick={() => setGlobalError(null)} className="ml-4 underline opacity-80 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {activeSection === 'DISHES' && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
               <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1">Total Dishes</p>
               <p className="text-xl sm:text-2xl font-bold font-heading">{activeItems.length}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
               <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1">Available</p>
               <p className="text-xl sm:text-2xl font-bold font-heading text-success">{activeItems.filter(i => i.is_available).length}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
               <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1">Categories</p>
               <p className="text-xl sm:text-2xl font-bold font-heading">{activeCategories.length}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
               <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-1">Top Dish Type</p>
               {topDishTypeData ? (
                 <p className="text-xl sm:text-2xl font-bold font-heading">{formatDishType(topDishTypeData.type)} <span className="text-sm font-medium text-muted-foreground ml-1">({topDishTypeData.count})</span></p>
               ) : (
                 <p className="text-sm font-medium text-muted-foreground mt-1.5">Not set yet</p>
               )}
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            <div className="flex flex-col items-start gap-4 w-full xl:w-auto">
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search dishes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-medium"
                />
              </div>
              <div className="grid grid-cols-1 min-[430px]:grid-cols-2 sm:flex sm:flex-row sm:flex-wrap items-center gap-2 w-full">
                <Filter className="w-4 h-4 text-muted-foreground hidden sm:block shrink-0" />
                <select 
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setFilterSubcategory('ALL'); // Reset subcategory when category changes
                  }}
                  className="w-full sm:w-auto h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-medium"
                >
                  <option value="ALL">All Categories</option>
                  {activeCategories.map(c => (
                    <option key={c.id as string} value={c.id as string}>{c.name as string}</option>
                  ))}
                </select>
                
                {filterCategory !== 'ALL' && activeSubcategories.filter(s => s.category_id === filterCategory).length > 0 && (
                  <select 
                    value={filterSubcategory}
                    onChange={(e) => setFilterSubcategory(e.target.value)}
                    className="w-full sm:w-auto h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-medium"
                  >
                    <option value="ALL">All Subcategories</option>
                    {activeSubcategories.filter(s => s.category_id === filterCategory).map(s => (
                      <option key={s.id as string} value={s.id as string}>{s.name as string}</option>
                    ))}
                  </select>
                )}

                <select 
                  value={filterDishType}
                  onChange={(e) => setFilterDishType(e.target.value)}
                  className="w-full sm:w-auto h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-medium"
                >
                  <option value="ALL">All Types</option>
                  <option value="VEG">Veg</option>
                  <option value="NON_VEG">Non-Veg</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="EGG">Egg</option>
                  <option value="SEAFOOD">Seafood</option>
                </select>

                <select 
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value as 'ALL' | 'AVAILABLE' | 'UNAVAILABLE')}
                  className="w-full sm:w-auto h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 font-medium"
                >
                  <option value="ALL">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowFutureFilters(!showFutureFilters)} className="text-muted-foreground text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                {showFutureFilters ? 'Hide Future Filters' : 'Future Filters'}
              </Button>
              {(searchQuery || filterCategory !== 'ALL' || filterAvailability !== 'ALL') && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                   Clear
                </Button>
              )}
            </div>
          </div>
          
          {showFutureFilters && (
            <div className="bg-muted/30 border border-border p-4 rounded-xl flex flex-wrap gap-3 animate-in slide-in-from-top-2 duration-200">
               <span className="text-xs font-bold text-muted-foreground w-full mb-1">These filters will be active in Phase 7B:</span>
               <select disabled className="h-8 rounded-md border border-input bg-background/50 text-muted-foreground px-3 py-1 text-xs font-medium opacity-70">
                 <option>Dish Type (Planned)</option>
               </select>
               <select disabled className="h-8 rounded-md border border-input bg-background/50 text-muted-foreground px-3 py-1 text-xs font-medium opacity-70">
                 <option>Subcategory (Planned)</option>
               </select>
               <select disabled className="h-8 rounded-md border border-input bg-background/50 text-muted-foreground px-3 py-1 text-xs font-medium opacity-70">
                 <option>KOT Type (Planned)</option>
               </select>
            </div>
          )}

          {/* Dishes Table (Desktop) / Cards (Mobile) */}
          {filteredItems.length === 0 ? (
            <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center text-muted-foreground">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                   <Search className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="font-bold text-foreground mb-1">No dishes found</p>
                <p className="text-sm">Add your first dish or adjust your filters.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
              {filteredItems.map(item => {
                const attachedGroupsCount = optimisticItemModifierGroups.filter(a => a.item_id === item.id && a.status === 'ACTIVE').length;
                const activeVariantsCount = optimisticVariants.filter(v => v.item_id === item.id && v.status === 'ACTIVE').length;
                return (
                <div key={item.id as string} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col">
                   <div className="flex items-start gap-4 mb-3">
                     {(item.image_url as string) ? (
                       // Remote image domains are unpredictable for user uploads; using standard img tag
                       /* eslint-disable-next-line @next/next/no-img-element */
                       <img src={item.image_url as string} alt={item.name as string} className="w-16 h-16 rounded-md object-cover border border-border shrink-0" />
                     ) : (
                       <div className="w-16 h-16 rounded-md bg-muted/50 border border-border border-dashed flex items-center justify-center text-[10px] text-muted-foreground/50 shrink-0 font-medium">No img</div>
                     )}
                     <div className="flex-1">
                       <h4 className="font-bold text-foreground leading-tight line-clamp-2">{item.name as string}</h4>
                       <span className="text-sm font-bold text-foreground mt-1 block flex items-start">{getItemPriceDisplay(item)}</span>
                       <div className="text-[11px] font-medium text-muted-foreground mt-1">
                          {getCategoryName(item.category_id)} {item.subcategory_id ? `> ${getSubcategoryName(item.subcategory_id)}` : ''}
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex flex-col gap-1 mb-4">
                     <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                        {(item.dish_type as string) && (item.dish_type as string) !== 'GENERAL' && (
                          <span className="inline-flex items-center text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            {formatDishType(item.dish_type as string)}
                          </span>
                        )}
                        {Boolean(item.is_recommended) && (
                          <span className="inline-flex items-center text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Rec
                          </span>
                        )}
                        {Boolean(item.preparation_time_minutes) && (
                          <span className="flex items-center gap-1">
                            · {item.preparation_time_minutes as number}m
                          </span>
                        )}
                        {(item.dietary_labels as string[])?.map((label: string, lIdx: number) => (
                           <span key={lIdx} className="flex items-center gap-1 uppercase">
                             · {label}
                           </span>
                        ))}
                     </div>
                     
                     {(activeVariantsCount > 0 || attachedGroupsCount > 0) && (
                       <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md w-fit mt-1">
                         {activeVariantsCount > 0 && <span>{activeVariantsCount} {activeVariantsCount === 1 ? 'variant' : 'variants'}</span>}
                         {activeVariantsCount > 0 && attachedGroupsCount > 0 && <span>·</span>}
                         {attachedGroupsCount > 0 && <span>{attachedGroupsCount} {attachedGroupsCount === 1 ? 'modifier group' : 'modifier groups'}</span>}
                       </div>
                     )}
                   </div>
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                     <ToggleAvailabilityButton item={item} />
                     <div className="flex items-center gap-1">
                       <Button variant="ghost" size="icon" onClick={() => openEditItem(item)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                         <Edit2 className="w-4 h-4" />
                       </Button>
                       <ArchiveItemAction item={item} onOptimistic={() => addOptimisticItem({ ...item, status: 'ARCHIVED' })} onError={setGlobalError} />
                     </div>
                   </div>
                </div>
              )})}
            </div>
          )}

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto hidden lg:block">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/30 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                 <tr>
                   <th className="px-5 py-3 font-semibold w-12">#</th>
                   <th className="px-5 py-3 font-semibold">Dish</th>
                   <th className="px-5 py-3 font-semibold">Price</th>
                   <th className="px-5 py-3 font-semibold">Category</th>
                   <th className="px-5 py-3 font-semibold">Availability</th>
                   <th className="px-5 py-3 font-semibold text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {filteredItems.map((item, idx) => {
                   const attachedGroupsCount = optimisticItemModifierGroups.filter(a => a.item_id === item.id && a.status === 'ACTIVE').length;
                   const activeVariantsCount = optimisticVariants.filter(v => v.item_id === item.id && v.status === 'ACTIVE').length;
                   return (
                   <tr key={item.id as string} className="hover:bg-muted/30 transition-colors group">
                     <td className="px-5 py-4 text-muted-foreground font-medium">{idx + 1}</td>
                     <td className="px-5 py-4 max-w-[300px]">
                       <div className="flex items-start gap-3">
                         {(item.image_url as string) ? (
                           // Remote image domains are unpredictable for user uploads; using standard img tag
                           /* eslint-disable-next-line @next/next/no-img-element */
                           <img src={item.image_url as string} alt={item.name as string} className="w-10 h-10 rounded-md object-cover border border-border shrink-0 mt-0.5" />
                         ) : (
                           <div className="w-10 h-10 rounded-md bg-muted/50 border border-border border-dashed flex items-center justify-center text-[9px] text-muted-foreground/50 shrink-0 font-medium mt-0.5">No img</div>
                         )}
                         <div className="flex flex-col">
                           <p className="font-bold text-foreground whitespace-normal line-clamp-1">{item.name as string}</p>
                           <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-medium text-muted-foreground">
                             {(item.dish_type as string) && (item.dish_type as string) !== 'GENERAL' && (
                               <span className="inline-flex items-center text-primary bg-primary/10 px-1 py-0.5 rounded font-bold uppercase tracking-wider">
                                 {formatDishType(item.dish_type as string)}
                               </span>
                             )}
                             {Boolean(item.is_recommended) && (
                               <span className="inline-flex items-center text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-bold uppercase tracking-wider">
                                 Rec
                               </span>
                             )}
                             {Boolean(item.preparation_time_minutes) && (
                               <span>· {item.preparation_time_minutes as number}m</span>
                             )}
                             {(item.dietary_labels as string[])?.map((label: string, lIdx: number) => (
                               <span key={lIdx} className="uppercase">· {label}</span>
                             ))}
                             {attachedGroupsCount > 0 && (
                               <span>· {attachedGroupsCount} {attachedGroupsCount === 1 ? 'modifier group' : 'modifier groups'}</span>
                             )}
                           </div>
                         </div>
                       </div>
                     </td>
                     <td className="px-5 py-4">
                       <div className="flex flex-col items-start gap-0.5">
                         <span className="font-medium text-foreground">{getItemPriceDisplay(item)}</span>
                         {activeVariantsCount > 0 && (
                           <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                             {activeVariantsCount} {activeVariantsCount === 1 ? 'variant' : 'variants'}
                           </span>
                         )}
                       </div>
                     </td>
                     <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-sm font-medium text-foreground">{getCategoryName(item.category_id)}</span>
                          {Boolean(item.subcategory_id) && (
                            <span className="text-[11px] text-muted-foreground">{getSubcategoryName(item.subcategory_id)}</span>
                          )}
                        </div>
                     </td>
                     <td className="px-5 py-4">
                        {!item.is_available ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive">Unavailable</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success">Available</span>
                        )}
                     </td>
                     <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <ToggleAvailabilityButton item={item} />
                          <Button variant="ghost" size="sm" onClick={() => openEditItem(item)} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                            Edit
                          </Button>
                          <ArchiveItemAction item={item} onOptimistic={() => addOptimisticItem({ ...item, status: 'ARCHIVED' })} onError={setGlobalError} />
                        </div>
                     </td>
                   </tr>
                 )})}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeSection === 'CATEGORIES' && (
        <>
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 hidden">
              {/* Header is visually hidden because it's managed via the top action bar now, but kept for structural layout if needed */}
            </div>

            {selectedCategories.length > 0 && activeCategories.some(c => selectedCategories.includes(c.id as string)) && (
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-primary">{selectedCategories.length} category(s) selected</span>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedCategories([])}>Clear</Button>
                   <BulkArchiveCategoriesAction 
                     selectedIds={selectedCategories} 
                     activeItems={activeItems}
                     onClear={() => setSelectedCategories([])} 
                     onOptimistic={(ids) => {
                       ids.forEach(id => {
                         const cat = optimisticCategories.find(c => c.id === id);
                         if (cat) addOptimisticCategory({ ...cat, status: 'ARCHIVED' });
                       });
                     }} 
                     onError={setGlobalError} 
                   />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategories.map(category => {
                const itemCount = activeItems.filter(i => i.category_id === category.id).length;
                return (
                  <div key={category.id as string} className="bg-muted/30 border border-border rounded-lg p-4 flex flex-col justify-between group hover:border-primary/50 transition-colors">
                     <div>
                       <div className="flex items-start justify-between">
                         <h4 className="font-bold text-foreground flex items-center gap-2">
                           <input type="checkbox" checked={selectedCategories.includes(category.id as string)} onChange={() => toggleCategorySelection(category.id as string)} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
                           {category.name as string}
                         </h4>
                         <span className="text-xs font-normal text-muted-foreground bg-background border border-border px-1.5 py-0.5 rounded-md shrink-0">{itemCount} items</span>
                       </div>
                       {(category.description as string) && (
                         <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{category.description as string}</p>
                       )}
                       <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between mb-2">
                             <h5 className="text-xs font-bold text-foreground">Subcategories</h5>
                             <Button variant="ghost" size="sm" onClick={() => openAddSubcategory(category)} className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10">
                               <Plus className="w-3 h-3 mr-1" /> Add Subcategories
                             </Button>
                          </div>
                          
                          {activeSubcategories.filter(s => s.category_id === category.id).length > 0 ? (
                            <div className="space-y-1.5">
                              {activeSubcategories.filter(s => s.category_id === category.id).map(sub => (
                                <div key={sub.id as string} className="flex items-center justify-between bg-background border border-border px-2 py-1.5 rounded-md hover:border-primary/30 transition-colors group/sub">
                                  <span className="text-xs font-medium text-foreground line-clamp-1 flex-1">{sub.name as string}</span>
                                  <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover/sub:opacity-100 transition-opacity shrink-0">
                                     <Button variant="ghost" size="icon" onClick={() => openEditSubcategory(category, sub)} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                        <Edit2 className="w-3 h-3" />
                                     </Button>
                                     <ArchiveSubcategoryAction subcategory={sub} activeItemsCount={activeItems.filter(i => i.subcategory_id === sub.id).length} onOptimistic={() => addOptimisticSubcategory({ ...sub, status: 'ARCHIVED' })} onError={setGlobalError} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground/60 italic">No subcategories yet. Add options like Steam, Jhol, Fried, or Cold Drinks.</p>
                          )}
                       </div>
                     </div>
                     <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEditCategory(category)}>Edit</Button>
                        <ArchiveCategoryAction category={category} activeItemsCount={itemCount} onOptimistic={() => addOptimisticCategory({ ...category, status: 'ARCHIVED' })} onError={setGlobalError} />
                     </div>
                  </div>
                );
              })}
              {activeCategories.length === 0 && (
                <div className="col-span-full p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground text-sm">
                  No active categories. Create one to get started.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeSection === 'MODIFIERS' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-heading font-bold text-lg text-foreground mb-4 hidden sm:block">Modifier Groups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeModifierGroups.map(group => {
                const groupModifiers = optimisticModifiers.filter(m => m.group_id === group.id && m.status === 'ACTIVE');
                const attachCount = activeItems.filter(i => optimisticItemModifierGroups.some(a => a.group_id === group.id && a.item_id === i.id && a.status === 'ACTIVE')).length;
                return (
                  <div key={group.id as string} className="bg-muted/30 border border-border rounded-lg p-4 flex flex-col justify-between group hover:border-primary/50 transition-colors">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-foreground">{group.name as string}</h4>
                        <span className="text-xs font-normal text-muted-foreground bg-background border border-border px-1.5 py-0.5 rounded-md shrink-0">{attachCount} items</span>
                      </div>
                      {(group.description as string) && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{group.description as string}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {group.selection_type as string}
                        </span>
                        {!!group.is_required ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                            Optional
                          </span>
                        )}
                        {(group.min_selections as number) > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                            Min: {group.min_selections as number}
                          </span>
                        )}
                        {(group.max_selections as number | null) !== null && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                            Max: {group.max_selections as number}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <h5 className="text-xs font-bold text-foreground mb-2">Options ({groupModifiers.length})</h5>
                        {groupModifiers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {groupModifiers.map(mod => (
                              <span key={mod.id as string} className="text-[10px] font-medium bg-background border border-border px-1.5 py-1 rounded">
                                {mod.name as string} {(mod.price as number) > 0 && `(+${currency}${(mod.price as number).toFixed(2)})`}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No options defined.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEditModifierGroup(group)}>Edit</Button>
                      <ArchiveModifierGroupAction group={group} activeItemsCount={attachCount} onOptimistic={() => addOptimisticModifierGroup({ ...group, status: 'ARCHIVED' })} onError={setGlobalError} />
                    </div>
                  </div>
                );
              })}
              {activeModifierGroups.length === 0 && (
                <div className="col-span-full p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground text-sm">
                  No active modifier groups. Create one to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'ARCHIVED' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-4">Archived Dishes</h3>
            {archivedItems.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                 No archived dishes.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedItems.map(item => (
                  <div key={item.id as string} className="bg-card border border-border opacity-75 hover:opacity-100 rounded-xl p-4 shadow-sm flex flex-col transition-opacity">
                     <div className="flex items-start gap-4 mb-4">
                       {(item.image_url as string) ? (
                         // Remote image domains are unpredictable for user uploads; using standard img tag
                         /* eslint-disable-next-line @next/next/no-img-element */
                         <img src={item.image_url as string} alt={item.name as string} className="w-12 h-12 rounded-md object-cover border border-border shrink-0 grayscale" />
                       ) : (
                         <div className="w-12 h-12 rounded-md bg-muted/50 border border-border border-dashed flex items-center justify-center text-[8px] text-muted-foreground/50 shrink-0 font-medium">No img</div>
                       )}
                       <div className="flex-1">
                         <h4 className="font-bold text-foreground leading-tight line-clamp-2 line-through text-muted-foreground">{item.name as string}</h4>
                         <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-md bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {getCategoryName(item.category_id)}
                         </span>
                       </div>
                     </div>
                     <div className="flex items-center justify-end mt-auto pt-4 border-t border-border">
                       <RestoreItemAction item={item} activeCategoryIds={activeCategories.map((c: Category) => c.id as string)} onOptimistic={() => addOptimisticItem({ ...item, status: 'ACTIVE' })} onError={setGlobalError} />
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-4">Archived Categories</h3>
            {selectedCategories.length > 0 && archivedCategories.some(c => selectedCategories.includes(c.id as string)) && (
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-primary">{selectedCategories.length} category(s) selected</span>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedCategories([])}>Clear</Button>
                   <BulkRestoreCategoriesAction 
                     selectedIds={selectedCategories} 
                     onClear={() => setSelectedCategories([])} 
                     onOptimistic={(ids) => {
                       ids.forEach(id => {
                         const cat = optimisticCategories.find(c => c.id === id);
                         if (cat) addOptimisticCategory({ ...cat, status: 'ACTIVE' });
                       });
                     }} 
                     onError={setGlobalError} 
                   />
                </div>
              </div>
            )}
            {archivedCategories.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                 No archived categories.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedCategories.map(category => (
                  <div key={category.id as string} className="bg-muted/30 border border-border opacity-75 hover:opacity-100 rounded-lg p-4 flex flex-col justify-between transition-opacity">
                     <div>
                       <h4 className="font-bold text-muted-foreground flex items-center gap-2 line-through">
                         <input type="checkbox" checked={selectedCategories.includes(category.id as string)} onChange={() => toggleCategorySelection(category.id as string)} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
                         {category.name as string}
                       </h4>
                       {(category.description as string) && (
                         <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{category.description as string}</p>
                       )}
                     </div>
                     <div className="flex items-center justify-end mt-4 pt-4 border-t border-border/50">
                        <RestoreCategoryAction category={category} onOptimistic={() => addOptimisticCategory({ ...category, status: 'ACTIVE' })} onError={setGlobalError} />
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-4">Archived Modifier Groups</h3>
            {archivedModifierGroups.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                 No archived modifier groups.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedModifierGroups.map(group => (
                  <div key={group.id as string} className="bg-muted/30 border border-border opacity-75 hover:opacity-100 rounded-lg p-4 flex flex-col justify-between transition-opacity">
                     <div>
                       <h4 className="font-bold text-muted-foreground flex items-center gap-2 line-through">
                         {group.name as string}
                       </h4>
                       {(group.description as string) && (
                         <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{group.description as string}</p>
                       )}
                     </div>
                     <div className="flex items-center justify-end mt-4 pt-4 border-t border-border/50">
                        <RestoreModifierGroupAction group={group} onOptimistic={() => addOptimisticModifierGroup({ ...group, status: 'ACTIVE' })} onError={setGlobalError} />
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <CategoryModal 
          isOpen={isCategoryModalOpen} 
          onClose={() => setIsCategoryModalOpen(false)} 
          category={editingCategory} 
        />
      )}

      {isSubcategoryModalOpen && activeCategoryForSub && (
        <SubcategoryModal
          isOpen={isSubcategoryModalOpen}
          onClose={() => setIsSubcategoryModalOpen(false)}
          category={activeCategoryForSub}
          subcategory={editingSubcategory}
          onOptimistic={(s) => addOptimisticSubcategory(s)}
        />
      )}

      {isModifierGroupModalOpen && (
        <ModifierGroupModal 
          isOpen={isModifierGroupModalOpen}
          onClose={() => setIsModifierGroupModalOpen(false)}
          group={editingModifierGroup ? {
            ...editingModifierGroup,
            selection_type: editingModifierGroup.selection_type as 'SINGLE' | 'MULTIPLE',
            is_required: editingModifierGroup.is_required as boolean,
            min_selections: editingModifierGroup.min_selections as number,
            max_selections: editingModifierGroup.max_selections as number | null,
            name: editingModifierGroup.name as string,
            description: editingModifierGroup.description as string,
            modifiers: optimisticModifiers.filter(m => m.group_id === editingModifierGroup.id) as any[]
          } : null}
        />
      )}

      {isItemModalOpen && (
        <ItemModal 
          isOpen={isItemModalOpen} 
          onClose={() => setIsItemModalOpen(false)} 
          item={editingItem}
          categories={activeCategories}
          subcategories={activeSubcategories}
          variants={optimisticVariants.filter(v => v.item_id === editingItem?.id)}
          modifierGroups={activeModifierGroups}
          itemModifierGroups={optimisticItemModifierGroups.filter(a => a.item_id === editingItem?.id)}
          currency={currency}
          onOptimistic={addOptimisticItem}
          onError={setGlobalError}
        />
      )}
    </div>
  );
}
