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

export async function updateTenantSettings(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN' || !profile.tenant_id) {
      return { success: false, error: 'Forbidden: Only Tenant Admins can edit business settings.' };
    }

    const timezone = formData.get('timezone') as string;
    const currency = formData.get('currency') as string;
    const country = formData.get('country') as string;
    const contact_email = formData.get('contact_email') as string;
    const dial_code = formData.get('dial_code') as string || '';
    const phone_number = formData.get('phone_number') as string || '';
    const address_line = formData.get('address_line') as string;
    const city = formData.get('city') as string;
    const region = formData.get('region') as string;
    const postal_code = formData.get('postal_code') as string;

    // Validation
    const allowedTimezones = ['UTC', 'Asia/Kathmandu', 'Asia/Kolkata', 'Europe/Lisbon', 'America/New_York', 'Europe/London', 'Australia/Sydney'];
    if (timezone && !allowedTimezones.includes(timezone)) return { success: false, error: 'Invalid timezone selected.' };

    const allowedCurrencies = ['USD', 'NPR', 'INR', 'EUR', 'GBP', 'AUD'];
    if (currency && !allowedCurrencies.includes(currency)) return { success: false, error: 'Invalid currency selected.' };

    const allowedCountries = ['Nepal', 'India', 'Portugal', 'United States', 'United Kingdom', 'Australia'];
    if (country && !allowedCountries.includes(country)) return { success: false, error: 'Invalid country selected.' };

    if (contact_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact_email)) return { success: false, error: 'Invalid email format.' };
    }

    let full_phone = '';
    if (phone_number) {
      const cleanPhone = phone_number.replace(/\D/g, '');
      
      // Country-aware phone validation
      if (country === 'Nepal' && cleanPhone.length !== 10) {
        return { success: false, error: 'Enter a valid 10-digit Nepal phone number.' };
      }
      if (country === 'India' && cleanPhone.length !== 10) {
        return { success: false, error: 'Enter a valid 10-digit India phone number.' };
      }
      if (country === 'Portugal' && cleanPhone.length !== 9) {
        return { success: false, error: 'Enter a valid 9-digit Portugal phone number.' };
      }
      if (country === 'United States' && cleanPhone.length !== 10) {
        return { success: false, error: 'Enter a valid 10-digit United States phone number.' };
      }
      if (country === 'United Kingdom' && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
        return { success: false, error: 'Enter a valid 10 or 11-digit United Kingdom phone number.' };
      }
      if (country === 'Australia' && cleanPhone.length !== 9) {
        return { success: false, error: 'Enter a valid 9-digit Australia phone number.' };
      }
      
      if (cleanPhone.length < 5) return { success: false, error: 'Phone number is too short.' };
      
      full_phone = dial_code ? `${dial_code}${cleanPhone}` : cleanPhone;
    }

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('tenant_settings')
      .update({
        timezone: timezone || 'UTC',
        currency: currency || 'USD',
        country,
        contact_email,
        phone: full_phone || null,
        address_line,
        city,
        region,
        postal_code
      })
      .eq('tenant_id', profile.tenant_id)
      .select('tenant_id')
      .single();

    if (error || !data) {
      console.error(error);
      return { success: false, error: 'Failed to update business settings. Record not found or error occurred.' };
    }

    revalidatePath('/dashboard/admin/business');
    revalidatePath('/dashboard/admin');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Unexpected error during updateTenantSettings:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function updateTenantModules(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN' || !profile.tenant_id) {
      return { success: false, error: 'Forbidden: Only Tenant Admins can edit modules.' };
    }

    // Build JSON payload matching exactly the keys in default config
    const modules_enabled = {
      restaurant: formData.get('restaurant') === 'on',
      hotel: formData.get('hotel') === 'on',
      qr_ordering: formData.get('qr_ordering') === 'on',
      pos: formData.get('pos') === 'on',
      kitchen_display: formData.get('kitchen_display') === 'on',
      rooms: formData.get('rooms') === 'on',
      housekeeping: formData.get('housekeeping') === 'on',
      room_service: formData.get('room_service') === 'on',
      inventory: formData.get('inventory') === 'on',
      reports: formData.get('reports') === 'on'
    };

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('tenant_settings')
      .update({ modules_enabled: modules_enabled as any })
      .eq('tenant_id', profile.tenant_id)
      .select('tenant_id')
      .single();

    if (error || !data) {
      console.error(error);
      return { success: false, error: 'Failed to update modules. Record not found or error occurred.' };
    }

    revalidatePath('/dashboard/admin/modules');
    revalidatePath('/dashboard/admin');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Unexpected error during updateTenantModules:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
