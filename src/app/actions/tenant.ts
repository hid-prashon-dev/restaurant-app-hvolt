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
