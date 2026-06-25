'use client';

import { useActionState, useEffect, useState } from 'react';
import { createMenuItem, updateMenuItem } from '@/app/actions/menu';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp, Image as ImageIcon, Upload, Library } from 'lucide-react';

export function ItemModal({ isOpen, onClose, item, categories, currency }: { isOpen: boolean, onClose: () => void, item: Record<string, unknown> | null, categories: Record<string, unknown>[], currency: string }) {
  const isEditing = !!item;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>((item?.image_url as string) || '');
  const [previewName, setPreviewName] = useState<string>((item?.name as string) || '');
  const [previewPrice, setPreviewPrice] = useState<string>((item?.price as number)?.toString() || '');
  const [previewCategory, setPreviewCategory] = useState<string>((item?.category_id as string) || categories[0]?.id as string || '');
  const [previewDesc, setPreviewDesc] = useState<string>((item?.description as string) || '');
  const [previewAvail, setPreviewAvail] = useState<boolean>(item ? (item.is_available as boolean) : true);
  
  const [state, formAction, isPending] = useActionState(
    isEditing ? updateMenuItem : createMenuItem,
    { success: false, error: null } as { success: boolean, error: string | null }
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  const categoryName = categories.find(c => c.id === previewCategory)?.name as string || 'Uncategorized';

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
            <form action={formAction} className="space-y-8" id="item-form">
              {state.error && (
                <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                  {state.error as string}
                </div>
              )}

              {isEditing && <input type="hidden" name="id" value={item.id as string} />}
              <input type="hidden" name="is_available" value={previewAvail ? 'true' : 'false'} />

              {/* Subcategories and Variants Phase 7B Callout */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                   <span className="text-primary font-bold text-xs">i</span>
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-foreground">Subcategories and variants are coming in Phase 7B.</h4>
                   <p className="text-xs text-muted-foreground mt-1">You will soon be able to add options like Half/Full, Extra Cheese, and size variations. For now, add dishes as single standard items.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Dish Type
                  </label>
                  <select 
                    disabled
                    className="w-full flex h-10 rounded-md border border-input bg-muted/50 text-muted-foreground px-3 py-2 text-sm opacity-80 cursor-not-allowed" 
                  >
                    <option>Not set (Planned Phase 7B)</option>
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
                <label className="text-sm font-medium text-foreground">Dish Photo</label>
                <div className="border border-border rounded-xl p-5 bg-muted/20 border-dashed relative">
                   <div className="flex flex-col sm:flex-row gap-6 items-center">
                     {previewImage ? (
                       <div className="relative aspect-video sm:aspect-square sm:w-32 sm:h-32 w-full rounded-lg overflow-hidden border border-border shadow-sm shrink-0 bg-background group">
                         <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                       </div>
                     ) : (
                       <div className="relative aspect-video sm:aspect-square sm:w-32 sm:h-32 w-full rounded-lg border border-border border-dashed bg-muted flex flex-col items-center justify-center shrink-0 text-muted-foreground/50">
                         <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                         <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
                       </div>
                     )}
                     
                     <div className="flex-1 space-y-4 w-full">
                       <div>
                         <h4 className="text-sm font-medium text-foreground">Media Upload</h4>
                         <p className="text-xs text-muted-foreground mt-1">Upload high-quality images to increase orders. PNG or JPG, max 5MB.</p>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         <Button type="button" variant="outline" disabled className="h-9 text-xs opacity-70">
                           <Upload className="w-3.5 h-3.5 mr-2" /> Upload coming next
                         </Button>
                         <Button type="button" variant="outline" disabled className="h-9 text-xs opacity-70">
                           <Library className="w-3.5 h-3.5 mr-2" /> Media Library coming next
                         </Button>
                       </div>
                     </div>
                   </div>
                </div>
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
                      <label className="text-sm font-medium text-foreground">Advanced Image URL</label>
                      <input 
                        type="url" 
                        name="image_url" 
                        value={previewImage}
                        onChange={e => setPreviewImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
                      />
                      <p className="text-xs text-muted-foreground">Directly set an image link. Temporary feature until media upload is ready.</p>
                    </div>
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
              Save Dish
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
                 <span className="font-bold text-foreground whitespace-nowrap">{currency} {previewPrice ? Number(previewPrice).toFixed(2) : '0.00'}</span>
               </div>
               
               <p className="text-xs text-muted-foreground mb-3 font-medium px-2 py-0.5 bg-muted rounded-md inline-block">
                 {categoryName}
               </p>
               
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
