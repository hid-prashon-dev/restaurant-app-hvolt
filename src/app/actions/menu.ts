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
    
    // Verify category belongs to tenant
    const { data: cat } = await adminSupabase
      .from('menu_categories')
      .select('id')
      .eq('id', category_id)
      .eq('tenant_id', tenant_id)
      .single();
      
    if (!cat) return { success: false, error: 'Invalid category.' };
    
    if (subcategory_id) {
      const { data: sub } = await adminSupabase
        .from('menu_subcategories')
        .select('id')
        .eq('id', subcategory_id)
        .eq('category_id', category_id)
        .eq('tenant_id', tenant_id)
        .single();
      if (!sub) return { success: false, error: 'Subcategory must belong to the selected category.' };
    }
    
    // Check for duplicate name in category
    const { data: existing } = await adminSupabase
      .from('menu_items')
      .select('id')
      .eq('category_id', category_id)
      .ilike('name', name)
      .eq('status', 'ACTIVE')
      .maybeSingle();
      
    if (existing) {
      return { success: false, error: 'An active item with this name already exists in this category.' };
    }

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

    if (error) throw error;
    
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
      const { error: varError } = await adminSupabase.from('menu_item_variants').insert(variantsToInsert);
      if (varError) {
        console.error('Failed to insert variants:', varError);
      }
    }
    
    revalidatePath('/dashboard/admin/menu');
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
    
    // Verify category belongs to tenant
    const { data: cat } = await adminSupabase
      .from('menu_categories')
      .select('id')
      .eq('id', category_id)
      .eq('tenant_id', tenant_id)
      .single();
      
    if (!cat) return { success: false, error: 'Invalid category.' };
    
    if (subcategory_id) {
      const { data: sub } = await adminSupabase
        .from('menu_subcategories')
        .select('id')
        .eq('id', subcategory_id)
        .eq('category_id', category_id)
        .eq('tenant_id', tenant_id)
        .single();
      if (!sub) return { success: false, error: 'Subcategory must belong to the selected category.' };
    }
    
    // Check duplicate
    const { data: existing } = await adminSupabase
      .from('menu_items')
      .select('id')
      .eq('category_id', category_id)
      .ilike('name', name)
      .eq('status', 'ACTIVE')
      .neq('id', id)
      .maybeSingle();
      
    if (existing) {
      return { success: false, error: 'An active item with this name already exists in this category.' };
    }

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

    if (error) throw error;
    
    if (variants.length > 0) {
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

      if (variantsToUpdate.length > 0) {
        const { error: updateError } = await adminSupabase.from('menu_item_variants').upsert(variantsToUpdate);
        if (updateError) {
          console.error('Failed to update variants:', updateError);
        }
      }

      if (variantsToInsert.length > 0) {
        const { error: insertError } = await adminSupabase.from('menu_item_variants').insert(variantsToInsert);
        if (insertError) {
          console.error('Failed to insert variants:', insertError);
        }
      }
    }
    
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
    const tenant_id = await verifyAdminAndGetTenant();
    const id = formData.get('id')?.toString();
    const is_available = formData.get('is_available') === 'true'; // string to boolean
    
    if (!id) return { success: false, error: 'Item ID is required.' };

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from('menu_items')
      .update({ is_available })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath('/dashboard/admin/menu');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('toggleMenuItemAvailability error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
