'use server';

import { createClient } from '@/utils/supabase/server';
import { randomBytes, createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvite(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN' || !profile.tenant_id) {
      throw new Error('Forbidden: Only Tenant Admins can invite staff.');
    }

    const emailRaw = formData.get('email') as string;
    const role = formData.get('role') as string;

    if (!emailRaw || !role) throw new Error('Missing required fields.');
    const email = emailRaw.toLowerCase().trim();

    const allowedRoles = ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN_STAFF', 'FRONT_DESK', 'HOUSEKEEPING', 'INVENTORY_MANAGER'];
    if (!allowedRoles.includes(role)) {
      throw new Error('Invalid role selected.');
    }

    const { data: existing } = await supabase
      .from('tenant_invitations')
      .select('id')
      .eq('email', email)
      .eq('tenant_id', profile.tenant_id)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existing) {
      throw new Error('An active pending invitation already exists for this email.');
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const { error } = await supabase
      .from('tenant_invitations')
      .insert({
        tenant_id: profile.tenant_id,
        email,
        role,
        token_hash: tokenHash,
        invited_by: user.id
      });

    if (error) {
      console.error(error);
      throw new Error('Failed to create invitation.');
    }

    revalidatePath('/dashboard/admin/team');
    return { token, success: true, error: null };
  } catch (error: any) {
    return { token: null, success: false, error: error.message };
  }
}

export async function revokeInvite(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN' || !profile.tenant_id) {
    throw new Error('Forbidden: Only Tenant Admins can revoke invites.');
  }

  const id = formData.get('id') as string;
  if (!id) throw new Error('Missing invite ID');

  const { error } = await supabase
    .from('tenant_invitations')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .is('accepted_at', null);

  if (error) throw new Error('Failed to revoke invitation.');

  revalidatePath('/dashboard/admin/team');
}

export async function acceptInvite(formData: FormData) {
  const token = formData.get('token') as string;
  if (!token) throw new Error('Invalid link');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to accept an invite.');

  const tokenHash = createHash('sha256').update(token).digest('hex');

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();

  const { data: invite } = await adminSupabase
    .from('tenant_invitations')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!invite) {
    throw new Error('Invalid, expired, or revoked invitation link.');
  }

  if (user.email?.toLowerCase() !== invite.email) {
    throw new Error(`This invitation is for ${invite.email}. Please log in with the correct account.`);
  }

  const { data: targetUser } = await adminSupabase
    .from('profiles')
    .select('id, role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!targetUser || targetUser.role !== 'GUEST' || targetUser.tenant_id !== null) {
    throw new Error('Only unassigned guest users can accept invitations.');
  }

  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({ role: invite.role, tenant_id: invite.tenant_id })
    .eq('id', user.id)
    .is('tenant_id', null)
    .eq('role', 'GUEST');

  if (profileError) throw new Error('Failed to update profile.');

  await adminSupabase
    .from('tenant_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  return { success: true, error: null };
}

export async function getTenantTeam(tenantId: string) {
  // Validate caller has access to this tenant's team
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  
  if (profile?.role === 'ADMIN') {
    if (profile.tenant_id !== tenantId) throw new Error('Forbidden');
  } else if (profile?.role !== 'MASTER_ADMIN' && profile?.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden');
  }

  // Safe server-side read of profiles using admin client
  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();

  const { data: team } = await adminSupabase
    .from('profiles')
    .select('id, email, role, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });

  return team || [];
}
