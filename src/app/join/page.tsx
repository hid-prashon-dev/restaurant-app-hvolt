import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { JoinForm } from './JoinForm';
import { createHash } from 'crypto';

export default async function JoinPage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invalid Link</h1>
          <p className="text-muted-foreground text-sm">No invitation token was provided in the URL.</p>
          <Link href="/"><Button className="w-full">Return Home</Button></Link>
        </div>
      </div>
    );
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();
  const { data: invite } = await adminSupabase
    .from('tenant_invitations')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invalid Link</h1>
          <p className="text-muted-foreground text-sm">This invitation link is invalid or does not exist.</p>
          <Link href="/"><Button className="w-full">Return Home</Button></Link>
        </div>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Already Accepted</h1>
          <p className="text-muted-foreground text-sm">This invitation has already been accepted.</p>
          <Link href="/login"><Button className="w-full">Log In</Button></Link>
        </div>
      </div>
    );
  }

  if (invite.revoked_at) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invitation Revoked</h1>
          <p className="text-muted-foreground text-sm">This invitation has been revoked by the administrator.</p>
          <Link href="/"><Button className="w-full">Return Home</Button></Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invite.expires_at) < new Date();
  if (isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invitation Expired</h1>
          <p className="text-muted-foreground text-sm">This invitation link has expired (links are valid for 7 days). Please ask your administrator to send a new one.</p>
          <Link href="/"><Button className="w-full">Return Home</Button></Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">Log In Required</h1>
          <p className="text-muted-foreground text-sm">
            This invite is currently for <strong>existing users only</strong>. Log in with the email address that received this invite.
          </p>
          <div className="bg-primary/10 border border-primary/20 p-3 rounded-md text-sm text-primary font-medium">
            New-user invite signup is deferred to Phase 5B.
          </div>
          <Link href={`/login?next=${encodeURIComponent(`/join?token=${token}`)}`}>
            <Button className="w-full">Log In to Accept</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">Account Mismatch</h1>
          <p className="text-muted-foreground text-sm">
            You are logged in as <strong>{user.email}</strong>, but this invite was sent to <strong>{invite.email}</strong>.
          </p>
          <form action={async () => {
            'use server';
            const { logout } = await import('@/app/login/actions');
            await logout();
          }}>
            <Button type="submit" className="w-full" variant="outline">Sign Out & Log In With Correct Email</Button>
          </form>
        </div>
      </div>
    );
  }

  const { data: profile } = await adminSupabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  
  if (profile?.role !== 'GUEST' || profile?.tenant_id !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">Cannot Accept Invite</h1>
          <p className="text-muted-foreground text-sm">
            This invite is only for new, unassigned guest users. Your account is already connected to a business or already has a staff/admin role. If your role needs to change, ask your business Admin to update it from Team Management.
          </p>
          <Link href="/dashboard"><Button className="w-full">Go to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  return <JoinForm token={token} email={user.email || ''} role={invite.role} />;
}
