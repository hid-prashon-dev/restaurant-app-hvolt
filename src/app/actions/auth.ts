'use server';

import { createClient } from '@/utils/supabase/server';
import { createHash } from 'crypto';

export async function signupFromInvite(prevState: any, formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token || !password || !confirmPassword) {
      return { success: false, error: 'Missing required fields.' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    // Verify invite
    const { data: invite } = await adminSupabase
      .from('tenant_invitations')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!invite) {
      return { success: false, error: 'Invalid, expired, or revoked invitation link.' };
    }

    // Check if user already exists
    const { data: existingUser } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', invite.email)
      .maybeSingle();
      
    if (existingUser) {
      return { success: false, error: 'An account already exists for this email. Please log in to accept the invite.' };
    }

    // Create user securely via admin client
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: invite.email,
      password: password,
      email_confirm: true // MVP
    });

    if (authError) {
      console.error(authError);
      return { success: false, error: 'Failed to create user account. ' + authError.message };
    }

    const userId = authData.user.id;

    // Safe upsert into profiles (trigger might have created it)
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: userId,
        email: invite.email,
        role: invite.role,
        tenant_id: invite.tenant_id
      });

    if (profileError) {
      console.error(profileError);
      return { success: false, error: 'Account created, but profile assignment failed.' };
    }

    // Mark invite as accepted
    await adminSupabase
      .from('tenant_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    // Sign the user in
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: invite.email,
      password: password
    });

    if (signInError) {
      console.error(signInError);
      return { success: true, error: null, requireManualLogin: true };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Unexpected error in signupFromInvite:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
