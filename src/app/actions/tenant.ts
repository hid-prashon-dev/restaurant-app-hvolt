'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTenant(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'MASTER_ADMIN') throw new Error('Forbidden');

  const slug = formData.get('slug') as string;
  const public_name = formData.get('public_name') as string;
  const legal_name = formData.get('legal_name') as string || null;
  const business_type = formData.get('business_type') as string;

  if (!slug || !public_name || !business_type) {
    throw new Error('Missing required fields');
  }

  // Server-side slug validation
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Invalid slug format. Must be lowercase alphanumeric with hyphens between words only.');
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      slug,
      public_name,
      legal_name,
      business_type,
      status: 'SETUP_PENDING'
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error('Failed to create tenant: ' + error.message);
  }
  
  // Create default settings row
  await supabase.from('tenant_settings').insert({
    tenant_id: tenant.id
  });

  revalidatePath('/dashboard/master/tenants');
  redirect(`/dashboard/master/tenants/${tenant.id}`);
}

export async function assignTenantAdmin(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    // Normal SSR client check for MASTER_ADMIN
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'MASTER_ADMIN') {
      return { success: false, message: 'Forbidden: Only Master Admin can assign tenant admins.' };
    }

    const tenantId = formData.get('tenantId') as string;
    const email = formData.get('email') as string;

    if (!tenantId || !email) {
      return { success: false, message: 'Missing required fields' };
    }

    // Only after validation, import and use the service role client
    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    // 1. Verify tenant exists and check current admin
    const { data: tenant } = await adminSupabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .single();

    if (!tenant) return { success: false, message: 'Tenant not found.' };

    const { data: existingAdmin } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('role', 'ADMIN')
      .maybeSingle();

    if (existingAdmin) {
      return { success: false, message: 'Tenant already has an assigned Admin. Reassignment is deferred.' };
    }

    // 2. Fetch target user by email
    const { data: targetUsers, error: lookupError } = await adminSupabase
      .from('profiles')
      .select('id, role, tenant_id')
      .eq('email', email);

    if (lookupError || !targetUsers || targetUsers.length === 0) {
      return { success: false, message: 'Target user not found with that email.' };
    }
    
    const targetUser = targetUsers[0];

    // 3. Validation rules
    if (targetUser.role === 'MASTER_ADMIN' || targetUser.role === 'SUPER_ADMIN') {
      return { success: false, message: 'Cannot assign platform admins to a tenant.' };
    }
    
    if (targetUser.tenant_id !== null) {
      return { success: false, message: 'Target user already belongs to a tenant.' };
    }
    
    if (targetUser.role !== 'GUEST') {
      return { success: false, message: 'Target user must be a GUEST to be assigned as Admin.' };
    }

    // 4. Update the user atomically using service role
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ 
        role: 'ADMIN',
        tenant_id: tenantId 
      })
      .eq('id', targetUser.id)
      .is('tenant_id', null) // double-check race condition
      .in('role', ['GUEST']); // explicitly only allow unassigned guests for MVP

    if (updateError) {
      console.error(updateError);
      return { success: false, message: 'Failed to assign admin: Only unassigned GUEST users can be assigned as ADMIN in MVP.' };
    }

    revalidatePath(`/dashboard/master/tenants/${tenantId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error during assignTenantAdmin:', err);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}
