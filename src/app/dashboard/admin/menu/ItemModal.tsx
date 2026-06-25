'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { createMenuItem, updateMenuItem } from '@/app/actions/menu';
import { uploadMenuMedia } from '@/app/actions/media';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp, Image as ImageIcon, Upload, Trash2, Library } from 'lucide-react';
import { useModalUX } from '@/hooks/useModalUX';

export type VariantDraft = {
  id?: string;
  item_id?: string;
  name: string;
  price: number;
  is_default: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  sort_order?: number;
};

export function ItemModal({ 
  isOpen, 
  onClose, 
  item, 
  categories, 
  subcategories = [], 
  variants = [],
  modifierGroups = [],
  itemModifierGroups = [],
  currency,
  onOptimistic,
  onError
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  item: Record<string, unknown> | null, 
  categories: Record<string, unknown>[], 
  subcategories?: Record<string, unknown>[], 
  variants?: Record<string, unknown>[],
  modifierGroups?: Record<string, unknown>[],
  itemModifierGroups?: Record<string, unknown>[],
  currency: string,
  onOptimistic?: (dish: Record<string, unknown>) => void,
  onError?: (err: string) => void
}) {
  const isEditing = !!item;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>((item?.image_url as string) || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const activeUploadPromise = useRef<Promise<string | null> | null>(null);
  const currentUploadId = useRef<number>(0);
  const [previewName, setPreviewName] = useState<string>((item?.name as string) || '');
  const [previewPrice, setPreviewPrice] = useState<string>((item?.price as number)?.toString() || '');
  const [previewCategory, setPreviewCategory] = useState<string>((item?.category_id as string) || categories[0]?.id as string || '');
  const [previewSubcategory, setPreviewSubcategory] = useState<string>((item?.subcategory_id as string) || '');
  const [previewDishType, setPreviewDishType] = useState<string>((item?.dish_type as string) || '');
  const [previewRecommended, setPreviewRecommended] = useState<boolean>(item ? !!item.is_recommended : false);
  const [previewDesc, setPreviewDesc] = useState<string>((item?.description as string) || '');
  const [previewAvail, setPreviewAvail] = useState<boolean>(item ? (item.is_available as boolean) : true);
  const [previewPrepTime, setPreviewPrepTime] = useState<string>((item?.preparation_time_minutes as number)?.toString() || '');
  
  const initialVariants = (variants || []) as VariantDraft[];
  const [previewVariants, setPreviewVariants] = useState<VariantDraft[]>(initialVariants);
  const [showVariants, setShowVariants] = useState(initialVariants.some((v) => v.status === 'ACTIVE'));
  const [showArchivedVariants, setShowArchivedVariants] = useState(false);

  const [selectedModifierGroupIds, setSelectedModifierGroupIds] = useState<string[]>(
    (itemModifierGroups || []).filter(a => a.status === 'ACTIVE').map(a => a.group_id as string)
  );

  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  useModalUX(isOpen, onClose);

  const formRef = useRef<HTMLFormElement>(null);

  const handleRemoveImage = () => {
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }
    setImageFile(null);
    setPreviewImage('');
    setUploadStatus('idle');
    setUploadedUrl(null);
    setUploadError(null);
    currentUploadId.current++; // invalidate pending uploads
    activeUploadPromise.current = null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3145728) {
      setLocalError('Image must be under 3MB.');
      e.target.value = '';
      return;
    }
    
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setUploadStatus('uploading');
    setUploadError(null);
    setLocalError(null);
    setUploadedUrl(null);

    const uploadId = ++currentUploadId.current;
    
    const uploadTask = (async () => {
      const mediaFd = new FormData();
      mediaFd.append('image_file', file);
      try {
        const res = await uploadMenuMedia(mediaFd);
        if (currentUploadId.current !== uploadId) return null; // superseded
        
        if (!res.success) {
          setUploadStatus('error');
          setUploadError(res.error || 'Image upload failed. Please try again.');
          return null;
        }
        
        setUploadStatus('uploaded');
        setUploadedUrl(res.public_url as string);
        return res.public_url as string;
      } catch (err) {
        if (currentUploadId.current !== uploadId) return null;
        setUploadStatus('error');
        setUploadError('Network error or file too large. Please check your connection and ensure file is under 3MB.');
        return null;
      }
    })();

    activeUploadPromise.current = uploadTask;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    const formData = new FormData(e.currentTarget);
    
    // Quick validation
    if (!formData.get('name') || !formData.get('price') || !formData.get('category_id')) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    startTransition(async () => {
      let finalImageUrl = previewImage && !previewImage.startsWith('blob:') ? previewImage : (item?.image_url as string || null);

      if (imageFile) {
        if (uploadStatus === 'error') {
          setLocalError(uploadError || 'Image upload failed. Please try again or remove the image.');
          return;
        }

        if (uploadStatus === 'uploading' && activeUploadPromise.current) {
          setUploadStatus('uploading'); // visual feedback if they hit save too fast
          const url = await activeUploadPromise.current;
          if (!url) {
            setLocalError(uploadError || 'Image upload failed. Please try again or remove the image.');
            return;
          }
          finalImageUrl = url;
        } else if (uploadStatus === 'uploaded' && uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } else if (!previewImage) {
        finalImageUrl = null;
      }

      const newItem = {
        ...item,
        id: isEditing ? item?.id : `temp-${Date.now()}`,
        name: formData.get('name'),
        price: Number(formData.get('price')),
        category_id: formData.get('category_id'),
        subcategory_id: formData.get('subcategory_id') || null,
        dish_type: formData.get('dish_type') || null,
        is_recommended: formData.get('is_recommended') === 'on',
        is_available: formData.get('is_available') === 'true',
        preparation_time_minutes: formData.get('preparation_time_minutes') ? Number(formData.get('preparation_time_minutes')) : null,
        description: formData.get('description') || null,
        image_url: finalImageUrl || null,
        status: 'ACTIVE',
        labels: [] as string[],
      };
      
      if (formData.get('is_veg')) newItem.labels.push('VEG');
      if (formData.get('is_vegan')) newItem.labels.push('VEGAN');
      if (formData.get('is_gluten_free')) newItem.labels.push('GLUTEN_FREE');
      if (formData.get('is_spicy')) newItem.labels.push('SPICY');

      formData.append('variants', JSON.stringify(previewVariants));
      formData.append('modifier_groups', JSON.stringify(selectedModifierGroupIds));
      formData.set('image_url', finalImageUrl || '');

      onClose();

      if (onOptimistic) onOptimistic(newItem);
      const action = isEditing ? updateMenuItem : createMenuItem;
      const res = await action(null, formData);
      if (!res.success) {
        if (onError) onError(res.error || 'Failed to save dish.');
      }
    });
  };

  const categoryName = categories.find(c => c.id === previewCategory)?.name as string || 'Uncategorized';
  const availableSubcategories = subcategories.filter(s => s.category_id === previewCategory && s.status === 'ACTIVE');
  const subcategoryName = availableSubcategories.find(s => s.id === previewSubcategory)?.name as string || '';
  
  // Reset subcategory if it doesn't belong to newly selected category
  useEffect(() => {
    if (previewSubcategory && !availableSubcategories.find(s => s.id === previewSubcategory)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewSubcategory('');
    }
  }, [previewCategory, availableSubcategories, previewSubcategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-5xl h-[90vh] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative">
        
        {/* Left Panel - Form */}
        <div className="flex-1 flex flex-col h-full border-r border-border relative bg-background">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0">
            <div>
              <h2 className="text-xl font-bold font-heading text-foreground">
                {isEditing ? 'Edit Dish' : 'Add New Dish'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Fill in the details to publish to your menu.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isPending} className="h-8 w-8 text-muted-foreground hover:text-foreground md:hidden">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8" id="item-form">
              {localError && (
                <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                  {localError as string}
                </div>
              )}

              {isEditing && <input type="hidden" name="id" value={item.id as string} />}
              <input type="hidden" name="is_available" value={previewAvail ? 'true' : 'false'} />

              {/* Subcategories Phase 7B Callout */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                   <span className="text-primary font-bold text-xs">i</span>
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-foreground">Modifiers are coming in Phase 7B.</h4>
                   <p className="text-xs text-muted-foreground mt-1">You will soon be able to add add-ons like Extra Cheese or side options. For now, you can add variants (sizes, etc.) below.</p>
                 </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">Dish Image</label>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-border bg-muted/30 overflow-hidden flex-shrink-0 relative group">
                    {previewImage ? (
                      <img src={previewImage} alt="Dish preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-[10px] uppercase font-bold opacity-50">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Upload a high-quality image of the dish. Supported formats: JPG, PNG, WebP. Max size: 3MB.
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/jpeg, image/png, image/webp" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          onChange={handleImageSelect}
                        />
                        <Button type="button" variant="outline" size="sm" className="pointer-events-none flex items-center gap-2 h-9">
                          <Upload className="w-4 h-4" />
                          {previewImage ? 'Replace Image' : 'Upload Image'}
                        </Button>
                      </div>
                      {previewImage && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-2"
                          onClick={handleRemoveImage}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      )}
                      
                      {uploadStatus === 'uploading' && (
                        <span className="text-xs text-muted-foreground animate-pulse ml-2">Finishing image upload...</span>
                      )}
                      {uploadStatus === 'error' && (
                        <span className="text-xs text-destructive ml-2 font-medium">Upload failed</span>
                      )}
                      {uploadStatus === 'uploaded' && (
                        <span className="text-xs text-green-600 dark:text-green-400 ml-2 font-medium">Image ready</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Dish Type
                  </label>
                  <select 
                    name="dish_type"
                    value={previewDishType}
                    onChange={(e) => setPreviewDishType(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                  >
                    <option value="">None / General</option>
                    <option value="VEG">Veg</option>
                    <option value="NON_VEG">Non-Veg</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="EGG">Egg</option>
                    <option value="SEAFOOD">Seafood</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Dish Name <span className="text-destructive">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={previewName}
                    onChange={e => setPreviewName(e.target.value)}
                    placeholder="e.g. Chicken Momo, Margherita Pizza"
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select 
                    name="category_id" 
                    value={previewCategory}
                    onChange={e => setPreviewCategory(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                    required
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map(c => (
                      <option key={c.id as string} value={c.id as string}>{c.name as string}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Subcategory
                  </label>
                  <select 
                    name="subcategory_id" 
                    value={previewSubcategory}
                    onChange={e => setPreviewSubcategory(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50" 
                    disabled={availableSubcategories.length === 0}
                  >
                    <option value="">No Subcategory</option>
                    {availableSubcategories.map(s => (
                      <option key={s.id as string} value={s.id as string}>{s.name as string}</option>
                    ))}
                  </select>
                  {availableSubcategories.length === 0 && previewCategory && (
                    <p className="text-xs text-muted-foreground mt-1">This category has no active subcategories.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Price <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">{currency}</span>
                    <input 
                      type="number" 
                      name="price" 
                      step="0.01"
                      min="0"
                      value={previewPrice}
                      onChange={e => setPreviewPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full flex h-10 rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Preparation Time (Minutes)
                  </label>
                  <input 
                    type="number" 
                    name="preparation_time_minutes" 
                    min="0"
                    max="240"
                    value={previewPrepTime}
                    onChange={e => setPreviewPrepTime(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used later for KDS, QR ordering, and customer expectations.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Item Variants</h3>
                    <p className="text-xs text-muted-foreground">Add sizes or types (e.g., Half/Full, Small/Medium/Large).</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (!showVariants) setShowVariants(true);
                      setPreviewVariants(prev => [...prev, { id: `temp_${Date.now()}`, name: '', price: Number(previewPrice) || 0, is_default: prev.filter(v => v.status !== 'ARCHIVED').length === 0, status: 'ACTIVE' }]);
                    }}
                  >
                    Add Variant
                  </Button>
                </div>
                
                {showVariants && previewVariants.filter(v => v.status === 'ACTIVE').length > 0 && (
                  <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-border">
                    <div className="hidden min-[430px]:grid grid-cols-[1fr_100px_60px_40px] gap-3 text-xs font-bold text-muted-foreground mb-1 px-1">
                      <div>Name</div>
                      <div>Price ({currency})</div>
                      <div className="text-center">Default</div>
                      <div></div>
                    </div>
                    {previewVariants.map((v, i) => v.status === 'ACTIVE' && (
                      <div key={v.id as string} className="relative flex flex-col min-[430px]:grid min-[430px]:grid-cols-[1fr_100px_60px_40px] gap-2 min-[430px]:gap-3 items-start min-[430px]:items-center max-w-full bg-background min-[430px]:bg-transparent p-3 min-[430px]:p-0 rounded-md border min-[430px]:border-none border-border">
                        <div className="w-full">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block min-[430px]:hidden">Name</label>
                          <input
                            type="text"
                            value={v.name as string}
                            onChange={(e) => setPreviewVariants(prev => prev.map(p => p.id === v.id ? { ...p, name: e.target.value } : p))}
                            placeholder="Variant Name"
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            required
                          />
                        </div>
                        <div className="w-full">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block min-[430px]:hidden">Price ({currency})</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={v.price as number}
                            onChange={(e) => setPreviewVariants(prev => prev.map(p => p.id === v.id ? { ...p, price: Number(e.target.value) } : p))}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1 min-[430px]:mt-0 min-[430px]:justify-center">
                          <input
                            type="radio"
                            name={`default_variant_${i}`}
                            checked={v.is_default as boolean}
                            onChange={() => setPreviewVariants(prev => prev.map(p => p.status === 'ACTIVE' ? { ...p, is_default: p.id === v.id } : p))}
                            className="w-4 h-4 text-primary focus:ring-primary/50"
                          />
                          <span className="text-[10px] uppercase font-bold text-muted-foreground min-[430px]:hidden">Default</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 min-[430px]:static h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => {
                            setPreviewVariants(prev => {
                              const next = prev.map(p => p.id === v.id ? { ...p, status: 'ARCHIVED' as const, is_default: false } : p);
                              // Auto-assign default if we just removed the default
                              const actives = next.filter(p => p.status === 'ACTIVE');
                              if (actives.length > 0 && !actives.some(p => p.is_default)) {
                                actives[0].is_default = true;
                              }
                              return next;
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {previewVariants.filter(v => v.status === 'ARCHIVED').length > 0 && (
                  <div className="mt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowArchivedVariants(!showArchivedVariants)} 
                      className="text-xs font-bold text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {showArchivedVariants ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Archived Variants ({previewVariants.filter(v => v.status === 'ARCHIVED').length})
                    </button>
                    {showArchivedVariants && (
                      <div className="mt-3 space-y-2">
                        {previewVariants.map((v, i) => v.status === 'ARCHIVED' && (
                          <div key={v.id as string} className="flex items-center justify-between p-2 rounded border border-border bg-muted/20 text-sm">
                            <span className="text-muted-foreground line-through opacity-70">{v.name as string} ({currency} {(v.price as number).toFixed(2)})</span>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => {
                                setPreviewVariants(prev => prev.map(p => p.id === v.id ? { ...p, status: 'ACTIVE' as const, is_default: prev.filter(a => a.status === 'ACTIVE').length === 0 } : p));
                                setShowVariants(true);
                              }}
                            >
                              Restore
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Modifiers</h3>
                    <p className="text-xs text-muted-foreground">Attach optional or required additions.</p>
                  </div>
                </div>
                
                {modifierGroups && modifierGroups.filter(g => g.status === 'ACTIVE').length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modifierGroups.filter(g => g.status === 'ACTIVE').map((group) => {
                      const isSelected = selectedModifierGroupIds.includes(group.id as string);
                      return (
                        <label 
                          key={group.id as string} 
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-primary/5 border-primary/30' 
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded border-input text-primary focus:ring-primary h-4 w-4"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModifierGroupIds(prev => [...prev, group.id as string]);
                              } else {
                                setSelectedModifierGroupIds(prev => prev.filter(id => id !== group.id));
                              }
                            }}
                          />
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-foreground block leading-none">{group.name as string}</span>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {group.selection_type as string}
                              </span>
                              {!!group.is_required && (
                                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-warning/10 text-warning">
                                  REQUIRED
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-border">
                    No active modifier groups exist. Create them from the Modifiers tab.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                  <span className="text-[10px] text-muted-foreground">{previewDesc.length}/500</span>
                </div>
                <textarea 
                  name="description" 
                  value={previewDesc}
                  onChange={e => setPreviewDesc(e.target.value)}
                  placeholder="Ingredients or brief description. What makes this dish special?"
                  className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none" 
                  maxLength={500}
                />
              </div>



              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Dietary Labels (Optional)</label>
                <div className="flex flex-wrap gap-4 p-4 rounded-xl border border-border bg-muted/10">
                  <label className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" name="is_veg" defaultChecked={((item?.labels as string[]) || []).includes('VEG')} className="rounded border-input text-primary focus:ring-primary/50 w-4 h-4" />
                    <span className="font-medium">Vegetarian (Veg)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" name="is_vegan" defaultChecked={((item?.labels as string[]) || []).includes('VEGAN')} className="rounded border-input text-primary focus:ring-primary/50 w-4 h-4" />
                    <span className="font-medium">Vegan</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" name="is_gluten_free" defaultChecked={((item?.labels as string[]) || []).includes('GLUTEN_FREE')} className="rounded border-input text-primary focus:ring-primary/50 w-4 h-4" />
                    <span className="font-medium">Gluten-Free</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" name="is_spicy" defaultChecked={((item?.labels as string[]) || []).includes('SPICY')} className="rounded border-input text-primary focus:ring-primary/50 w-4 h-4" />
                    <span className="font-medium">Spicy</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Recommended Dish</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Highlight this dish on the menu with a special badge.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_recommended" checked={previewRecommended} onChange={e => setPreviewRecommended(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  className="text-sm font-bold text-foreground flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Advanced Options
                </button>
                
                {showAdvanced && (
                  <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200 bg-muted/20 p-5 rounded-xl border border-border">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Display Order</label>
                      <input 
                        type="number" 
                        name="sort_order" 
                        defaultValue={(item?.sort_order as number) ?? 0}
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                      />
                      <p className="text-xs text-muted-foreground">Lower numbers appear earlier. Most users can leave this unchanged.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="pb-10"></div>
            </form>
          </div>

          <div className="p-6 border-t border-border bg-background shrink-0 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1 bg-background">
              Cancel
            </Button>
            <Button type="submit" form="item-form" disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold active:scale-[0.98] transition-transform">
              {isEditing ? 'Save Changes' : 'Create Dish'}
            </Button>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="hidden md:flex w-80 lg:w-96 bg-muted/30 flex-col items-center justify-center p-8 relative shrink-0">
           <Button variant="ghost" size="icon" onClick={onClose} disabled={isPending} className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground">
             <X className="w-5 h-5" />
           </Button>
           
           <div className="w-full max-w-[320px] mx-auto text-center mb-8">
             <h3 className="font-heading font-bold text-lg text-foreground">Live Preview</h3>
             <p className="text-xs text-muted-foreground mt-1">This is how your dish might look on a customer menu.</p>
           </div>

           {/* Mobile Card Preview */}
           <div className="w-full max-w-[300px] bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden scale-100 transition-all">
             <div className="aspect-[4/3] w-full bg-muted relative border-b border-border">
               {previewImage ? (
                 <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                   <ImageIcon className="w-12 h-12" />
                 </div>
               )}
               
               {!previewAvail && (
                 <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                   <span className="bg-background px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-muted-foreground">Sold Out</span>
                 </div>
               )}
             </div>
             
             <div className="p-5">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-bold text-foreground leading-tight line-clamp-2">{previewName || 'Dish Name'}</h4>
                  <span className="font-bold text-foreground whitespace-nowrap">
                    {previewVariants.filter(v => v.status === 'ACTIVE').length > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold leading-none">From</span>
                        <span className="leading-none">{currency} {Math.min(...previewVariants.filter(v => v.status === 'ACTIVE').map(v => v.price as number)).toFixed(2)}</span>
                      </div>
                    ) : (
                      `${currency} ${previewPrice ? Number(previewPrice).toFixed(2) : '0.00'}`
                    )}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-md">
                    {categoryName} {subcategoryName ? `> ${subcategoryName}` : ''}
                  </span>
                  {previewDishType && previewDishType !== 'GENERAL' && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {previewDishType.replace('_', '-')}
                    </span>
                  )}
                  {previewRecommended && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Recommended
                    </span>
                  )}
                </div>
               
               {previewDesc ? (
                 <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{previewDesc}</p>
               ) : (
                 <div className="space-y-2 opacity-20">
                   <div className="h-3 bg-muted-foreground rounded w-full"></div>
                   <div className="h-3 bg-muted-foreground rounded w-4/5"></div>
                 </div>
               )}
             </div>
           </div>
           
           <div className="mt-8 flex items-center gap-3 w-full max-w-[300px] justify-center">
             <label className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-full shadow-sm hover:border-primary/50 transition-colors">
               <input 
                 type="checkbox" 
                 checked={previewAvail} 
                 onChange={(e) => setPreviewAvail(e.target.checked)}
                 className="rounded border-input text-primary focus:ring-primary/50 w-4 h-4" 
               />
               Item is Available
             </label>
           </div>
        </div>
      </div>
    </div>
  );
}
