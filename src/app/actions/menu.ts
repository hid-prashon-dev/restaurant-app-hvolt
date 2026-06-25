'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// Helper to verify admin permissions and get tenant_id
async function verifyAdminAndGetTenant() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) throw new Error('Unauthorized');
  
  if (profile.role !== 'ADMIN') {
    throw new Error('Forbidden: Tenant Admin access required');
  }

  return profile.tenant_id;
}

// ------------------------------------------------------------------
// Menu Categories
// ------------------------------------------------------------------

export async function createMenuCategory(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    
    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const sort_order = parseInt(formData.get('sort_order')?.toString() || '0', 10);
    
    if (!name) return { success: false, error: 'Category name is required.' };
    if (name.length > 80) return { success: false, error: 'Category name is too long (max 80 chars).' };
    if (description && description.length > 300) return { success: false, error: 'Description is too long.' };

    const adminSupabase = createAdminClient();
    
    // Check for duplicate names (case-insensitive) in the same tenant
    const { data: existing } = await adminSupabase
      .from('menu_categories')
      .select('id, status')
      .eq('tenant_id', tenant_id)
      .ilike('name', name)
      .maybeSingle();
      
    if (existing) {
      if (existing.status === 'ARCHIVED') {
        return { 
          success: false, 
          error: `A category named "${name}" is archived. Restore it instead?`,
          isArchivedDuplicate: true,
          archivedId: existing.id
        };
      }
      return { success: false, error: `A category named "${name}" already exists.` };
    }

    const { error } = await adminSupabase.from('menu_categories').insert({
      tenant_id,
      name,
      description: description || null,
      sort_order
    });

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('createMenuCategory error:', err);
    return { success: false, error: err.message === 'Unauthorized' || err.message.startsWith('Forbidden') ? err.message : 'Something went wrong. Please try again.' };
  }
}

export async function updateMenuCategory(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const sort_order = parseInt(formData.get('sort_order')?.toString() || '0', 10);
    
    if (!id) return { success: false, error: 'Category ID is required.' };
    if (!name) return { success: false, error: 'Category name is required.' };
    if (name.length > 80) return { success: false, error: 'Category name is too long (max 80 chars).' };

    const adminSupabase = createAdminClient();
    
    // Check for duplicate name excluding self
    const { data: existing } = await adminSupabase
      .from('menu_categories')
      .select('id')
      .eq('tenant_id', tenant_id)
      .ilike('name', name)
      .eq('status', 'ACTIVE')
      .neq('id', id)
      .maybeSingle();
      
    if (existing) {
      return { success: false, error: 'An active category with this name already exists.' };
    }

    const { error } = await adminSupabase
      .from('menu_categories')
      .update({
        name,
        description: description || null,
        sort_order
      })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('updateMenuCategory error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function archiveMenuCategory(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    
    if (!id) return { success: false, error: 'Category ID is required.' };

    const adminSupabase = createAdminClient();
    
    // Check if category has active items
    const { count } = await adminSupabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('status', 'ACTIVE');
      
    if (count && count > 0) {
      return { success: false, error: 'Cannot archive category because it has active items. Archive the items first.' };
    }

    const { error } = await adminSupabase
      .from('menu_categories')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('archiveMenuCategory error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function restoreMenuCategory(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    
    if (!id) return { success: false, error: 'Category ID is required.' };

    const adminSupabase = createAdminClient();

    const { data: cat } = await adminSupabase
      .from('menu_categories')
      .select('id, name, status')
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .single();

    if (!cat) return { success: false, error: 'Category not found.' };
    if (cat.status === 'ACTIVE') return { success: false, error: 'Category is already active.' };

    const { data: activeConflict } = await adminSupabase
      .from('menu_categories')
      .select('id')
      .eq('tenant_id', tenant_id)
      .ilike('name', cat.name)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (activeConflict) {
      return { success: false, error: 'Cannot restore: an active category with the same name already exists.' };
    }

    const { error } = await adminSupabase
      .from('menu_categories')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('restoreMenuCategory error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function bulkArchiveMenuCategories(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const idsRaw = formData.get('ids')?.toString();
    if (!idsRaw) return { success: false, error: 'No categories selected.' };
    const ids = idsRaw.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length === 0) return { success: false, error: 'No categories selected.' };

    const adminSupabase = createAdminClient();

    // Verify tenant ownership
    const { data: categories } = await adminSupabase
      .from('menu_categories')
      .select('id')
      .in('id', ids)
      .eq('tenant_id', tenant_id);
      
    if (!categories || categories.length !== ids.length) {
      return { success: false, error: 'Some categories were not found or unauthorized.' };
    }

    // Verify active items
    const { data: activeItems } = await adminSupabase
      .from('menu_items')
      .select('id')
      .in('category_id', ids)
      .eq('tenant_id', tenant_id)
      .eq('status', 'ACTIVE')
      .limit(1);

    if (activeItems && activeItems.length > 0) {
      return { success: false, error: 'Cannot bulk archive: some categories have active items. Archive items first.' };
    }

    const { error } = await adminSupabase
      .from('menu_categories')
      .update({ status: 'ARCHIVED' })
      .in('id', ids)
      .eq('tenant_id', tenant_id);

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('bulkArchiveMenuCategories error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function bulkRestoreMenuCategories(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const idsRaw = formData.get('ids')?.toString();
    if (!idsRaw) return { success: false, error: 'No categories selected.' };
    const ids = idsRaw.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length === 0) return { success: false, error: 'No categories selected.' };

    const adminSupabase = createAdminClient();

    // Fetch categories to verify and check for naming conflicts
    const { data: categories } = await adminSupabase
      .from('menu_categories')
      .select('id, name')
      .in('id', ids)
      .eq('tenant_id', tenant_id)
      .eq('status', 'ARCHIVED');

    if (!categories || categories.length !== ids.length) {
      return { success: false, error: 'Some categories were not found, unauthorized, or already active.' };
    }

    // Check naming conflicts
    const { data: existingActive } = await adminSupabase
      .from('menu_categories')
      .select('name')
      .eq('tenant_id', tenant_id)
      .eq('status', 'ACTIVE');
      
    const activeNames = new Set((existingActive || []).map(c => c.name.toLowerCase()));
    const conflicting = categories.filter(c => activeNames.has(c.name.toLowerCase()));
    
    if (conflicting.length > 0) {
      return { success: false, error: `Cannot bulk restore: an active category named "${conflicting[0].name}" already exists.` };
    }

    const { error } = await adminSupabase
      .from('menu_categories')
      .update({ status: 'ACTIVE' })
      .in('id', ids)
      .eq('tenant_id', tenant_id);

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('bulkRestoreMenuCategories error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function createTemplateCategories(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    
    // categories come in as a comma-separated string from the hidden input
    const categoriesRaw = formData.get('categories')?.toString();
    if (!categoriesRaw) return { success: false, error: 'No categories selected.' };
    
    const categoriesToCreate = categoriesRaw.split(',').map(c => c.trim()).filter(c => c.length > 0);
    if (categoriesToCreate.length === 0) return { success: false, error: 'No valid categories selected.' };

    const adminSupabase = createAdminClient();

    // Get all existing categories for this tenant to avoid active conflicts and check for archives
    const { data: existingAll } = await adminSupabase
      .from('menu_categories')
      .select('id, name, status')
      .eq('tenant_id', tenant_id);

    const existingMap = new Map((existingAll || []).map(c => [c.name.toLowerCase(), c]));

    let createdCount = 0;
    let restoredCount = 0;

    for (let i = 0; i < categoriesToCreate.length; i++) {
      const name = categoriesToCreate[i];
      const existing = existingMap.get(name.toLowerCase());

      if (!existing) {
        // Create new
        const { error } = await adminSupabase.from('menu_categories').insert({
          tenant_id,
          name,
          sort_order: i * 10
        });
        if (!error) createdCount++;
      } else if (existing.status === 'ARCHIVED') {
        // Restore archived
        const { error } = await adminSupabase
          .from('menu_categories')
          .update({ status: 'ACTIVE' })
          .eq('id', existing.id);
        if (!error) restoredCount++;
      }
    }

    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null, message: `Created ${createdCount} new, restored ${restoredCount} archived.` };
  } catch (err: any) {
    console.error('createTemplateCategories error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ------------------------------------------------------------------
// Menu Subcategories
// ------------------------------------------------------------------

export async function createMenuSubcategories(category_id: string, subcategories: { name: string; description?: string; sort_order?: number }[]) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    
    if (!category_id) return { success: false, error: 'Parent category is required.' };
    if (!subcategories || subcategories.length === 0) return { success: false, error: 'At least one subcategory is required.' };
    if (subcategories.length > 25) return { success: false, error: 'Maximum 25 subcategories per request.' };

    const validSubcategories = subcategories.map(s => ({
      name: s.name.trim(),
      description: s.description?.trim() || null,
      sort_order: s.sort_order || 0
    })).filter(s => s.name.length > 0);

    if (validSubcategories.length === 0) return { success: false, error: 'No valid subcategory names provided.' };
    
    // Check duplicates in batch
    const nameSet = new Set<string>();
    for (const sub of validSubcategories) {
      if (sub.name.length > 80) return { success: false, error: `Subcategory name "${sub.name}" is too long (max 80 chars).` };
      const lowerName = sub.name.toLowerCase();
      if (nameSet.has(lowerName)) return { success: false, error: `Duplicate name "${sub.name}" in batch.` };
      nameSet.add(lowerName);
    }

    const adminSupabase = createAdminClient();
    
    // Verify category belongs to tenant
    const { data: cat } = await adminSupabase
      .from('menu_categories')
      .select('id')
      .eq('id', category_id)
      .eq('tenant_id', tenant_id)
      .single();
      
    if (!cat) return { success: false, error: 'Invalid parent category.' };

    // Check duplicate existing active
    const { data: existing } = await adminSupabase
      .from('menu_subcategories')
      .select('name')
      .eq('category_id', category_id)
      .eq('status', 'ACTIVE');
      
    const existingNames = new Set((existing || []).map(s => s.name.toLowerCase()));
    for (const sub of validSubcategories) {
      if (existingNames.has(sub.name.toLowerCase())) {
        return { success: false, error: `A subcategory named "${sub.name}" already exists and is active.` };
      }
    }

    const inserts = validSubcategories.map(sub => ({
      tenant_id,
      category_id,
      name: sub.name,
      description: sub.description,
      sort_order: sub.sort_order
    }));

    const { data: inserted, error } = await adminSupabase.from('menu_subcategories').insert(inserts).select();

    if (error) throw error;
    if (!inserted || inserted.length === 0) return { success: false, error: 'Failed to create subcategories.' };
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null, data: inserted };
  } catch (err: any) {
    console.error('createMenuSubcategories error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function createMenuSubcategory(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    
    const category_id = formData.get('category_id')?.toString();
    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const sort_order = parseInt(formData.get('sort_order')?.toString() || '0', 10);
    
    if (!category_id) return { success: false, error: 'Parent category is required.' };
    if (!name) return { success: false, error: 'Subcategory name is required.' };
    if (name.length > 80) return { success: false, error: 'Subcategory name is too long (max 80 chars).' };

    const adminSupabase = createAdminClient();
    
    // Verify category belongs to tenant
    const { data: cat } = await adminSupabase
      .from('menu_categories')
      .select('id')
      .eq('id', category_id)
      .eq('tenant_id', tenant_id)
      .single();
      
    if (!cat) return { success: false, error: 'Invalid parent category.' };

    // Check duplicate
    const { data: existing } = await adminSupabase
      .from('menu_subcategories')
      .select('id, status')
      .eq('category_id', category_id)
      .ilike('name', name)
      .maybeSingle();
      
    if (existing) {
      if (existing.status === 'ARCHIVED') {
        return { success: false, error: `A subcategory named "${name}" is archived. Restore it instead.` };
      }
      return { success: false, error: `A subcategory named "${name}" already exists in this category.` };
    }

    const { error } = await adminSupabase.from('menu_subcategories').insert({
      tenant_id,
      category_id,
      name,
      description: description || null,
      sort_order
    });

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('createMenuSubcategory error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function updateMenuSubcategory(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    
    const id = formData.get('id')?.toString();
    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const sort_order = parseInt(formData.get('sort_order')?.toString() || '0', 10);
    
    if (!id) return { success: false, error: 'Subcategory ID is required.' };
    if (!name) return { success: false, error: 'Subcategory name is required.' };
    if (name.length > 80) return { success: false, error: 'Subcategory name is too long.' };

    const adminSupabase = createAdminClient();
    
    // Check duplicate
    const { data: existing } = await adminSupabase
      .from('menu_subcategories')
      .select('id, category_id')
      .ilike('name', name)
      .neq('id', id)
      .maybeSingle();
      
    if (existing) {
      // Need to make sure it's duplicate in the same category
      // First get current subcategory
      const { data: current } = await adminSupabase
        .from('menu_subcategories')
        .select('category_id')
        .eq('id', id)
        .eq('tenant_id', tenant_id)
        .single();
        
      if (current && current.category_id === existing.category_id) {
        return { success: false, error: `A subcategory named "${name}" already exists in this category.` };
      }
    }

    const { error } = await adminSupabase
      .from('menu_subcategories')
      .update({
        name,
        description: description || null,
        sort_order
      })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('updateMenuSubcategory error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function archiveMenuSubcategory(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    
    if (!id) return { success: false, error: 'Subcategory ID is required.' };

    const adminSupabase = createAdminClient();
    
    // Ensure no active dishes are in this subcategory
    const { count, error: countError } = await adminSupabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('subcategory_id', id)
      .eq('status', 'ACTIVE')
      .eq('tenant_id', tenant_id);
      
    if (countError) throw countError;
    
    if (count && count > 0) {
      return { success: false, error: `Cannot archive subcategory. It has ${count} active dish(es).` };
    }

    const { data, error } = await adminSupabase
      .from('menu_subcategories')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    if (!data) return { success: false, error: 'Subcategory not found.' };

    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('archiveMenuSubcategory error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function restoreMenuSubcategory(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    
    if (!id) return { success: false, error: 'Subcategory ID is required.' };

    const adminSupabase = createAdminClient();

    // Verify parent category is ACTIVE
    const { data: subcat } = await adminSupabase
      .from('menu_subcategories')
      .select('category_id')
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .single();
      
    if (!subcat) return { success: false, error: 'Subcategory not found.' };
    
    const { data: cat } = await adminSupabase
      .from('menu_categories')
      .select('status')
      .eq('id', subcat.category_id)
      .single();
      
    if (cat?.status === 'ARCHIVED') {
      return { success: false, error: 'Cannot restore subcategory because its parent category is archived. Restore the category first.' };
    }

    const { data, error } = await adminSupabase
      .from('menu_subcategories')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    if (!data) return { success: false, error: 'Subcategory not found.' };

    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('restoreMenuSubcategory error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ------------------------------------------------------------------
// Menu Items
// ------------------------------------------------------------------

export async function createMenuItem(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    
    const category_id = formData.get('category_id')?.toString();
    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const priceRaw = formData.get('price')?.toString();
    const sort_order = parseInt(formData.get('sort_order')?.toString() || '0', 10);
    const is_available = formData.get('is_available') === 'on' || formData.get('is_available') === 'true';
    const image_url = formData.get('image_url')?.toString().trim();
    
    const subcategory_id = formData.get('subcategory_id')?.toString() || null;
    const dish_type = formData.get('dish_type')?.toString() || null;
    const is_recommended = formData.get('is_recommended') === 'on' || formData.get('is_recommended') === 'true';
    const prepTimeRaw = formData.get('preparation_time_minutes')?.toString();
    const preparation_time_minutes = prepTimeRaw ? parseInt(prepTimeRaw, 10) : null;
    
    // Basic dietary labels logic: comma separated or multiple checkboxes (for simplicity, we parse comma-separated if string, or assume it's sent as multiple entries if handled client-side)
    // For Phase 7A, we will parse a simple comma separated list or array if we encode it.
    const dietaryRaw = formData.get('dietary_labels')?.toString() || '';
    const dietary_labels = dietaryRaw.split(',').map(l => l.trim()).filter(l => l.length > 0);

    if (!category_id) return { success: false, error: 'Category is required.' };
    if (!name) return { success: false, error: 'Item name is required.' };
    if (name.length > 100) return { success: false, error: 'Item name is too long (max 100 chars).' };
    if (!priceRaw) return { success: false, error: 'Price is required.' };
    
    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) return { success: false, error: 'Price must be a valid positive number.' };
    if (!/^\d+(\.\d{1,2})?$/.test(priceRaw)) return { success: false, error: 'Price can have a maximum of 2 decimal places.' };

    if (image_url && !/^https?:\/\/.+/.test(image_url)) {
      return { success: false, error: 'Image URL must be a valid http or https link.' };
    }
    
    if (preparation_time_minutes !== null && (isNaN(preparation_time_minutes) || preparation_time_minutes < 0 || preparation_time_minutes > 240)) {
      return { success: false, error: 'Preparation time must be an integer between 0 and 240.' };
    }

    const adminSupabase = createAdminClient();
    
    if (process.env.NODE_ENV === 'development') console.time('[menu:create] batch validation');
    const [catResult, subResult, existingResult] = await Promise.all([
      adminSupabase.from('menu_categories').select('id').eq('id', category_id).eq('tenant_id', tenant_id).single(),
      subcategory_id ? adminSupabase.from('menu_subcategories').select('id').eq('id', subcategory_id).eq('category_id', category_id).eq('tenant_id', tenant_id).single() : Promise.resolve({ data: null }),
      adminSupabase.from('menu_items').select('id').eq('category_id', category_id).ilike('name', name).eq('status', 'ACTIVE').maybeSingle()
    ]);
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:create] batch validation');
      
    if (!catResult.data) return { success: false, error: 'Invalid category.' };
    if (subcategory_id && !subResult.data) return { success: false, error: 'Subcategory must belong to the selected category.' };
    if (existingResult.data) return { success: false, error: 'An active item with this name already exists in this category.' };

    const variantsRaw = formData.get('variants')?.toString();
    let variants: any[] = [];
    if (variantsRaw) {
      try {
        variants = JSON.parse(variantsRaw);
        if (!Array.isArray(variants)) throw new Error();
        if (variants.length > 25) return { success: false, error: 'Maximum 25 variants allowed.' };
        
        let activeVariantsCount = 0;
        let defaultCount = 0;
        const activeNames = new Set<string>();
        
        for (const v of variants) {
          if (v.status !== 'ARCHIVED') {
            activeVariantsCount++;
            if (!v.name || v.name.trim().length === 0) return { success: false, error: 'Variant name is required.' };
            if (v.name.length > 80) return { success: false, error: 'Variant name is too long.' };
            if (typeof v.price !== 'number' || v.price < 0) return { success: false, error: 'Variant price must be valid.' };
            const lowerName = v.name.toLowerCase().trim();
            if (activeNames.has(lowerName)) return { success: false, error: 'Duplicate active variant names not allowed.' };
            activeNames.add(lowerName);
            if (v.is_default) defaultCount++;
          }
        }
        
        if (activeVariantsCount > 0 && defaultCount !== 1) {
          return { success: false, error: 'Exactly one active variant must be marked as default.' };
        }
      } catch (e) {
        return { success: false, error: 'Invalid variants format.' };
      }
    }

    let modifierGroups: string[] = [];
    try {
      const raw = formData.get('modifier_groups')?.toString();
      if (raw) modifierGroups = JSON.parse(raw);
    } catch (e) {
      return { success: false, error: 'Invalid modifier groups format.' };
    }
    
    if (modifierGroups.length > 20) {
      return { success: false, error: 'Maximum 20 modifier groups allowed per dish.' };
    }

    if (process.env.NODE_ENV === 'development') console.time('[menu:create] item insert');
    const { data: newItem, error } = await adminSupabase.from('menu_items').insert({
      tenant_id,
      category_id,
      subcategory_id,
      dish_type,
      is_recommended,
      preparation_time_minutes,
      name,
      description: description || null,
      price,
      image_url: image_url || null,
      dietary_labels,
      sort_order,
      is_available
    }).select('id').single();
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:create] item insert');

    if (error) throw error;
    
    const insertPromises = [];
    if (variants.length > 0) {
      const variantsToInsert = variants.map((v, index) => ({
        tenant_id,
        item_id: newItem.id,
        name: v.name.trim(),
        price: v.price,
        is_default: v.is_default,
        sort_order: index,
        status: v.status || 'ACTIVE'
      }));
      insertPromises.push(adminSupabase.from('menu_item_variants').insert(variantsToInsert));
    }

    if (modifierGroups.length > 0) {
      const groupAttachments = modifierGroups.map((groupId, index) => ({
        tenant_id,
        item_id: newItem.id,
        group_id: groupId,
        sort_order: index,
        status: 'ACTIVE'
      }));
      insertPromises.push(adminSupabase.from('menu_item_modifier_groups').insert(groupAttachments));
    }
    
    if (insertPromises.length > 0) {
      if (process.env.NODE_ENV === 'development') console.time('[menu:create] variants and modifiers sync');
      const results = await Promise.all(insertPromises);
      for (const res of results) {
        if (res.error) console.error('Failed to insert variant/modifier:', res.error);
      }
      if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:create] variants and modifiers sync');
    }
    
    if (process.env.NODE_ENV === 'development') console.time('[menu:create] revalidate');
    revalidatePath('/dashboard/admin/menu');
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:create] revalidate');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('createMenuItem error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function updateMenuItem(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    
    const id = formData.get('id')?.toString();
    const category_id = formData.get('category_id')?.toString();
    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const priceRaw = formData.get('price')?.toString();
    const sort_order = parseInt(formData.get('sort_order')?.toString() || '0', 10);
    const is_available = formData.get('is_available') === 'on' || formData.get('is_available') === 'true';
    const image_url = formData.get('image_url')?.toString().trim();
    
    const subcategory_id = formData.get('subcategory_id')?.toString() || null;
    const dish_type = formData.get('dish_type')?.toString() || null;
    const is_recommended = formData.get('is_recommended') === 'on' || formData.get('is_recommended') === 'true';
    const prepTimeRaw = formData.get('preparation_time_minutes')?.toString();
    const preparation_time_minutes = prepTimeRaw ? parseInt(prepTimeRaw, 10) : null;
    
    const dietaryRaw = formData.get('dietary_labels')?.toString() || '';
    const dietary_labels = dietaryRaw.split(',').map(l => l.trim()).filter(l => l.length > 0);

    if (!id) return { success: false, error: 'Item ID is required.' };
    if (!category_id) return { success: false, error: 'Category is required.' };
    if (!name) return { success: false, error: 'Item name is required.' };
    if (name.length > 100) return { success: false, error: 'Item name is too long.' };
    if (!priceRaw) return { success: false, error: 'Price is required.' };
    
    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) return { success: false, error: 'Price must be a valid positive number.' };
    if (!/^\d+(\.\d{1,2})?$/.test(priceRaw)) return { success: false, error: 'Price can have a maximum of 2 decimal places.' };

    if (image_url && !/^https?:\/\/.+/.test(image_url)) {
      return { success: false, error: 'Image URL must be a valid http or https link.' };
    }
    
    if (preparation_time_minutes !== null && (isNaN(preparation_time_minutes) || preparation_time_minutes < 0 || preparation_time_minutes > 240)) {
      return { success: false, error: 'Preparation time must be an integer between 0 and 240.' };
    }

    const adminSupabase = createAdminClient();
    
    if (process.env.NODE_ENV === 'development') console.time('[menu:update] batch validation');
    // Batch validation queries
    const [catResult, subResult, existingResult] = await Promise.all([
      adminSupabase.from('menu_categories').select('id').eq('id', category_id).eq('tenant_id', tenant_id).single(),
      subcategory_id ? adminSupabase.from('menu_subcategories').select('id').eq('id', subcategory_id).eq('category_id', category_id).eq('tenant_id', tenant_id).single() : Promise.resolve({ data: null }),
      adminSupabase.from('menu_items').select('id').eq('category_id', category_id).ilike('name', name).eq('status', 'ACTIVE').neq('id', id).maybeSingle()
    ]);
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:update] batch validation');

    if (!catResult.data) return { success: false, error: 'Invalid category.' };
    if (subcategory_id && !subResult.data) return { success: false, error: 'Subcategory must belong to the selected category.' };
    if (existingResult.data) return { success: false, error: 'An active item with this name already exists in this category.' };

    const variantsRaw = formData.get('variants')?.toString();
    let variants: any[] = [];
    if (variantsRaw) {
      try {
        variants = JSON.parse(variantsRaw);
        if (!Array.isArray(variants)) throw new Error();
        if (variants.length > 25) return { success: false, error: 'Maximum 25 variants allowed.' };
        
        let activeVariantsCount = 0;
        let defaultCount = 0;
        const activeNames = new Set<string>();
        
        for (const v of variants) {
          if (v.status !== 'ARCHIVED') {
            activeVariantsCount++;
            if (!v.name || v.name.trim().length === 0) return { success: false, error: 'Variant name is required.' };
            if (v.name.length > 80) return { success: false, error: 'Variant name is too long.' };
            if (typeof v.price !== 'number' || v.price < 0) return { success: false, error: 'Variant price must be valid.' };
            const lowerName = v.name.toLowerCase().trim();
            if (activeNames.has(lowerName)) return { success: false, error: 'Duplicate active variant names not allowed.' };
            activeNames.add(lowerName);
            if (v.is_default) defaultCount++;
          }
        }
        
        if (activeVariantsCount > 0 && defaultCount !== 1) {
          return { success: false, error: 'Exactly one active variant must be marked as default.' };
        }
      } catch (e) {
        return { success: false, error: 'Invalid variants format.' };
      }
    }

    let modifierGroups: string[] = [];
    try {
      const raw = formData.get('modifier_groups')?.toString();
      if (raw) modifierGroups = JSON.parse(raw);
    } catch (e) {
      return { success: false, error: 'Invalid modifier groups format.' };
    }
    if (modifierGroups.length > 20) return { success: false, error: 'Maximum 20 modifier groups allowed per dish.' };

    if (process.env.NODE_ENV === 'development') console.time('[menu:update] item update');
    const { error } = await adminSupabase
      .from('menu_items')
      .update({
        category_id,
        subcategory_id,
        dish_type,
        is_recommended,
        preparation_time_minutes,
        name,
        description: description || null,
        price,
        image_url: image_url || null,
        dietary_labels,
        sort_order,
        is_available
      })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:update] item update');

    if (error) throw error;
    
    if (variants.length > 0) {
      if (process.env.NODE_ENV === 'development') console.time('[menu:update] variants sync');
      const variantsToUpdate = variants
        .filter(v => v.id && !v.id.startsWith('temp_'))
        .map((v, index) => ({
          id: v.id,
          tenant_id,
          item_id: id,
          name: v.name.trim(),
          price: v.price,
          is_default: v.is_default,
          sort_order: index,
          status: v.status || 'ACTIVE'
        }));

      const variantsToInsert = variants
        .filter(v => !v.id || v.id.startsWith('temp_'))
        .map((v, index) => ({
          tenant_id,
          item_id: id,
          name: v.name.trim(),
          price: v.price,
          is_default: v.is_default,
          sort_order: index,
          status: v.status || 'ACTIVE'
        }));

      const variantPromises = [];
      if (variantsToUpdate.length > 0) variantPromises.push(adminSupabase.from('menu_item_variants').upsert(variantsToUpdate));
      if (variantsToInsert.length > 0) variantPromises.push(adminSupabase.from('menu_item_variants').insert(variantsToInsert));
      
      if (variantPromises.length > 0) {
        await Promise.all(variantPromises);
      }
      if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:update] variants sync');
    }
    
    // Update Modifier Groups Attachment
    if (process.env.NODE_ENV === 'development') console.time('[menu:update] modifier attachments sync');
    const { data: existingAttachments } = await adminSupabase
      .from('menu_item_modifier_groups')
      .select('group_id, status')
      .eq('item_id', id)
      .eq('tenant_id', tenant_id);
      
    const existingActive = (existingAttachments || []).filter(a => a.status === 'ACTIVE').map(a => a.group_id);
    
    const toArchive = existingActive.filter(gId => !modifierGroups.includes(gId));
    
    const attachmentPromises = [];
    if (toArchive.length > 0) {
      attachmentPromises.push(adminSupabase.from('menu_item_modifier_groups')
        .update({ status: 'ARCHIVED' })
        .eq('item_id', id)
        .eq('tenant_id', tenant_id)
        .in('group_id', toArchive));
    }
    
    if (modifierGroups.length > 0) {
      const { data: existingRows } = await adminSupabase
        .from('menu_item_modifier_groups')
        .select('id, group_id')
        .eq('item_id', id)
        .eq('tenant_id', tenant_id)
        .in('group_id', modifierGroups);
        
      const existingMap = new Map((existingRows || []).map(row => [row.group_id, row.id]));
      
      const attachmentsToUpsert = modifierGroups.map((gId, index) => ({
        id: existingMap.get(gId),
        tenant_id,
        item_id: id,
        group_id: gId,
        sort_order: index,
        status: 'ACTIVE'
      }));
      
      const toUpdate = attachmentsToUpsert.filter(a => a.id);
      const toInsert = attachmentsToUpsert.filter(a => !a.id).map(({ id, ...rest }) => rest);
      
      if (toUpdate.length > 0) attachmentPromises.push(adminSupabase.from('menu_item_modifier_groups').upsert(toUpdate));
      if (toInsert.length > 0) attachmentPromises.push(adminSupabase.from('menu_item_modifier_groups').insert(toInsert));
    }
    if (attachmentPromises.length > 0) {
      await Promise.all(attachmentPromises);
    }
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:update] modifier attachments sync');

    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('updateMenuItem error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function archiveMenuItem(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    
    if (!id) return { success: false, error: 'Item ID is required.' };

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from('menu_items')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('archiveMenuItem error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function restoreMenuItem(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    
    if (!id) return { success: false, error: 'Item ID is required.' };

    const adminSupabase = createAdminClient();

    // Verify item exists and is archived
    const { data: item } = await adminSupabase
      .from('menu_items')
      .select('id, name, category_id, status')
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .single();

    if (!item) return { success: false, error: 'Item not found.' };
    if (item.status === 'ACTIVE') return { success: false, error: 'Item is already active.' };

    // Verify parent category exists and is active
    const { data: cat } = await adminSupabase
      .from('menu_categories')
      .select('status')
      .eq('id', item.category_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (!cat || cat.status !== 'ACTIVE') {
      return { success: false, error: 'Cannot restore dish: Parent category is archived or missing.' };
    }

    // Check for duplicate active item name in category
    const { data: activeConflict } = await adminSupabase
      .from('menu_items')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('category_id', item.category_id)
      .ilike('name', item.name)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (activeConflict) {
      return { success: false, error: 'Cannot restore: an active dish with the same name exists in this category.' };
    }

    const { error } = await adminSupabase
      .from('menu_items')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('restoreMenuItem error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function toggleMenuItemAvailability(prevState: any, formData: FormData) {
  try {
    if (process.env.NODE_ENV === 'development') console.time('[menu:toggle] all');
    if (process.env.NODE_ENV === 'development') console.time('[menu:toggle] actor verify');
    const tenant_id = await verifyAdminAndGetTenant();
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:toggle] actor verify');
    
    const id = formData.get('id')?.toString();
    const is_available = formData.get('is_available') === 'true'; // string to boolean
    
    if (!id) return { success: false, error: 'Item ID is required.' };

    const adminSupabase = createAdminClient();

    if (process.env.NODE_ENV === 'development') console.time('[menu:toggle] item update');
    const { error } = await adminSupabase
      .from('menu_items')
      .update({ is_available })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:toggle] item update');

    if (error) throw error;
    
    // Omitted revalidatePath to speed up optimistic UI response for short toggle action
    
    if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:toggle] all');
    return { success: true, error: null, item_id: id, is_available };
  } catch (err: any) {
    console.error('toggleMenuItemAvailability error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ------------------------------------------------------------------
// Menu Modifier Groups
// ------------------------------------------------------------------

export async function upsertModifierGroup(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    
    const id = formData.get('id')?.toString();
    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const selection_type = formData.get('selection_type')?.toString();
    const is_required = formData.get('is_required') === 'true';
    const min_selections = parseInt(formData.get('min_selections')?.toString() || '0', 10);
    const max_selections_raw = formData.get('max_selections')?.toString();
    const max_selections = max_selections_raw ? parseInt(max_selections_raw, 10) : null;
    
    if (!name) return { success: false, error: 'Group name is required.' };
    if (name.length > 80) return { success: false, error: 'Group name is too long.' };
    if (selection_type !== 'SINGLE' && selection_type !== 'MULTIPLE') return { success: false, error: 'Invalid selection type.' };
    
    if (selection_type === 'SINGLE') {
      if (max_selections !== 1) return { success: false, error: 'Single selection must have max 1.' };
      if (is_required && min_selections !== 1) return { success: false, error: 'Required single selection must have min 1.' };
      if (!is_required && min_selections !== 0) return { success: false, error: 'Optional single selection must have min 0.' };
    } else {
      if (is_required && min_selections < 1) return { success: false, error: 'Required multiple selection must have min >= 1.' };
      if (max_selections !== null && max_selections < min_selections) return { success: false, error: 'Max selections must be >= min selections.' };
    }

    const adminSupabase = createAdminClient();
    
    // Check duplicate name
    const nameQuery = adminSupabase.from('menu_modifier_groups').select('id').eq('tenant_id', tenant_id).ilike('name', name).eq('status', 'ACTIVE');
    if (id) nameQuery.neq('id', id);
    const { data: existing } = await nameQuery.maybeSingle();
    if (existing) return { success: false, error: 'An active modifier group with this name already exists.' };

    let groupId = id;
    if (id) {
      const { error } = await adminSupabase.from('menu_modifier_groups').update({
        name, description: description || null, selection_type, is_required, min_selections, max_selections
      }).eq('id', id).eq('tenant_id', tenant_id);
      if (error) throw error;
    } else {
      const { data, error } = await adminSupabase.from('menu_modifier_groups').insert({
        tenant_id, name, description: description || null, selection_type, is_required, min_selections, max_selections
      }).select('id').single();
      if (error) throw error;
      groupId = data.id;
    }

    const modifiersRaw = formData.get('modifiers')?.toString();
    if (modifiersRaw) {
      try {
        const modifiers = JSON.parse(modifiersRaw);
        if (!Array.isArray(modifiers)) throw new Error();
        if (modifiers.length > 50) return { success: false, error: 'Maximum 50 modifiers per group.' };

        const activeNames = new Set<string>();
        for (const m of modifiers) {
          if (m.status !== 'ARCHIVED') {
            if (!m.name || m.name.trim().length === 0) return { success: false, error: 'Modifier name is required.' };
            if (m.name.length > 80) return { success: false, error: 'Modifier name is too long.' };
            if (typeof m.price !== 'number' || m.price < 0 || m.price > 999999.99) return { success: false, error: 'Invalid modifier price.' };
            const lowerName = m.name.toLowerCase().trim();
            if (activeNames.has(lowerName)) return { success: false, error: 'Duplicate modifier names not allowed.' };
            activeNames.add(lowerName);
          }
        }

        const modsToUpdate = modifiers.filter(m => m.id && !m.id.startsWith('temp_')).map((m, index) => ({
          id: m.id, tenant_id, group_id: groupId, name: m.name.trim(), price: m.price, sort_order: index, status: m.status || 'ACTIVE'
        }));
        
        const modsToInsert = modifiers.filter(m => !m.id || m.id.startsWith('temp_')).map((m, index) => ({
          tenant_id, group_id: groupId, name: m.name.trim(), price: m.price, sort_order: index, status: m.status || 'ACTIVE'
        }));

        if (modsToUpdate.length > 0) await adminSupabase.from('menu_modifiers').upsert(modsToUpdate);
        if (modsToInsert.length > 0) await adminSupabase.from('menu_modifiers').insert(modsToInsert);
      } catch (e) {
        return { success: false, error: 'Invalid modifiers format.' };
      }
    }

    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('upsertModifierGroup error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function archiveModifierGroup(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    if (!id) return { success: false, error: 'Group ID is required.' };

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from('menu_modifier_groups').update({ status: 'ARCHIVED' }).eq('id', id).eq('tenant_id', tenant_id);
    if (error) throw error;
    
    // We should also archive active attachments for this group, but it's optional as UI filters them. Let's do it for cleanliness.
    await adminSupabase.from('menu_item_modifier_groups').update({ status: 'ARCHIVED' }).eq('group_id', id).eq('tenant_id', tenant_id);

    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('archiveModifierGroup error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function restoreModifierGroup(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    if (!id) return { success: false, error: 'Group ID is required.' };

    const adminSupabase = createAdminClient();
    
    // Check for duplicate active group name
    const { data: group } = await adminSupabase.from('menu_modifier_groups').select('name, status').eq('id', id).eq('tenant_id', tenant_id).single();
    if (!group) return { success: false, error: 'Group not found.' };
    if (group.status === 'ACTIVE') return { success: false, error: 'Already active.' };
    
    const { data: conflict } = await adminSupabase.from('menu_modifier_groups').select('id').eq('tenant_id', tenant_id).ilike('name', group.name).eq('status', 'ACTIVE').maybeSingle();
    if (conflict) return { success: false, error: 'An active group with this name already exists.' };

    const { error } = await adminSupabase.from('menu_modifier_groups').update({ status: 'ACTIVE' }).eq('id', id).eq('tenant_id', tenant_id);
    if (error) throw error;

    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('restoreModifierGroup error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function createTemplateModifierGroups(prevState: any, formData: FormData) {
  try {
    const tenant_id = await verifyAdminAndGetTenant();
    const templatesRaw = formData.get('templates')?.toString();
    if (!templatesRaw) return { success: false, error: 'No templates provided.' };
    
    let templates: { name: string; selection_type: string; min: number; max: number | null; required: boolean; modifiers: { name: string; price: number }[] }[] = [];
    try {
      templates = JSON.parse(templatesRaw);
    } catch {
      return { success: false, error: 'Invalid templates data.' };
    }
    
    if (templates.length === 0) return { success: true, error: null };

    const adminSupabase = createAdminClient();
    const { data: existingGroups } = await adminSupabase.from('menu_modifier_groups').select('name').eq('tenant_id', tenant_id).eq('status', 'ACTIVE');
    const existingNames = new Set((existingGroups || []).map(g => g.name.toLowerCase()));

    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      if (existingNames.has(t.name.toLowerCase())) continue; // Skip if already exists
      
      const { data, error } = await adminSupabase.from('menu_modifier_groups').insert({
        tenant_id, name: t.name, selection_type: t.selection_type, is_required: t.required, min_selections: t.min, max_selections: t.max, sort_order: i * 10
      }).select('id').single();
      
      if (error || !data) continue;
      
      if (t.modifiers && t.modifiers.length > 0) {
        const mods = t.modifiers.map((m, mIdx) => ({
          tenant_id, group_id: data.id, name: m.name, price: m.price, sort_order: mIdx * 10
        }));
        await adminSupabase.from('menu_modifiers').insert(mods);
      }
    }

    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('createTemplateModifierGroups error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
