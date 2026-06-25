'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function getAdminProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN' || !profile.tenant_id) return null;
  
  return { profile, user, supabase };
}

export async function createServiceArea(prevState: any, formData: FormData) {
  try {
    const auth = await getAdminProfile();
    if (!auth) return { success: false, error: 'Forbidden: Admin access required.' };

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;

    if (!name || !type) return { success: false, error: 'Name and Type are required.' };

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from('service_areas')
      .insert({
        tenant_id: auth.profile.tenant_id,
        name,
        type,
        description: description || null
      });

    if (error) {
      console.error(error);
      return { success: false, error: 'Failed to create service area.' };
    }

    revalidatePath('/dashboard/admin/locations');
    return { success: true, error: null };
  } catch (e: any) {
    console.error('Unexpected error during createServiceArea:', e);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function createServiceLocation(prevState: any, formData: FormData) {
  try {
    const auth = await getAdminProfile();
    if (!auth) return { success: false, error: 'Forbidden: Admin access required.' };

    const area_id = formData.get('area_id') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const capacity = formData.get('capacity') as string;

    if (!area_id || !name || !type) return { success: false, error: 'Area, Name, and Type are required.' };

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    const { data: area } = await adminSupabase
      .from('service_areas')
      .select('id')
      .eq('id', area_id)
      .eq('tenant_id', auth.profile.tenant_id)
      .single();

    if (!area) return { success: false, error: 'Invalid or unauthorized service area.' };

    const { error } = await adminSupabase
      .from('service_locations')
      .insert({
        tenant_id: auth.profile.tenant_id,
        area_id,
        name,
        type,
        capacity: capacity ? parseInt(capacity, 10) : null
      });

    if (error) {
      console.error(error);
      return { success: false, error: 'Failed to create service location.' };
    }

    revalidatePath('/dashboard/admin/locations');
    return { success: true, error: null };
  } catch (e: any) {
    console.error('Unexpected error during createServiceLocation:', e);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function archiveServiceArea(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { success: false, error: 'Missing area ID.' };

    const auth = await getAdminProfile();
    if (!auth) return { success: false, error: 'Forbidden: Admin access required.' };

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from('service_areas')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq('tenant_id', auth.profile.tenant_id);

    if (error) {
      console.error(error);
      return { success: false, error: 'Failed to archive area.' };
    }

    await adminSupabase
      .from('service_locations')
      .update({ status: 'ARCHIVED' })
      .eq('area_id', id)
      .eq('tenant_id', auth.profile.tenant_id);

    revalidatePath('/dashboard/admin/locations');
    return { success: true, error: null };
  } catch (e: any) {
    console.error('Unexpected error during archiveServiceArea:', e);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function archiveServiceLocation(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { success: false, error: 'Missing location ID.' };

    const auth = await getAdminProfile();
    if (!auth) return { success: false, error: 'Forbidden: Admin access required.' };

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from('service_locations')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq('tenant_id', auth.profile.tenant_id);

    if (error) {
      console.error(error);
      return { success: false, error: 'Failed to archive location.' };
    }

    revalidatePath('/dashboard/admin/locations');
    return { success: true, error: null };
  } catch (e: any) {
    console.error('Unexpected error during archiveServiceLocation:', e);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function restoreServiceArea(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { success: false, error: 'Missing area ID.' };

    const auth = await getAdminProfile();
    if (!auth) return { success: false, error: 'Forbidden: Admin access required.' };

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from('service_areas')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .eq('tenant_id', auth.profile.tenant_id)
      .eq('status', 'ARCHIVED');

    if (error) {
      console.error(error);
      return { success: false, error: 'Failed to restore area.' };
    }

    revalidatePath('/dashboard/admin/locations');
    return { success: true, error: null };
  } catch (e: any) {
    console.error('Unexpected error during restoreServiceArea:', e);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function restoreServiceLocation(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { success: false, error: 'Missing location ID.' };

    const auth = await getAdminProfile();
    if (!auth) return { success: false, error: 'Forbidden: Admin access required.' };

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    // Verify location exists and get area_id
    const { data: loc } = await adminSupabase
      .from('service_locations')
      .select('area_id, status')
      .eq('id', id)
      .eq('tenant_id', auth.profile.tenant_id)
      .single();

    if (!loc) return { success: false, error: 'Location not found.' };
    if (loc.status === 'ACTIVE') return { success: false, error: 'Location is already active.' };

    // Verify parent area is active
    const { data: area } = await adminSupabase
      .from('service_areas')
      .select('status')
      .eq('id', loc.area_id)
      .eq('tenant_id', auth.profile.tenant_id)
      .single();

    if (!area || area.status !== 'ACTIVE') {
      return { success: false, error: 'Restore the parent area before restoring this location.' };
    }

    const { error } = await adminSupabase
      .from('service_locations')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .eq('tenant_id', auth.profile.tenant_id);

    if (error) {
      console.error(error);
      return { success: false, error: 'Failed to restore location.' };
    }

    revalidatePath('/dashboard/admin/locations');
    return { success: true, error: null };
  } catch (e: any) {
    console.error('Unexpected error during restoreServiceLocation:', e);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
