'use client';

import { useActionState } from 'react';
import { acceptInvite } from '@/app/actions/team';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatRoleLabel } from '@/utils/roles';

export function JoinForm({ token, email, role }: { token: string, email: string, role?: string }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await acceptInvite(formData);
        // Ensure we properly bubble up the result or error if any exists inside the return object
        if (result?.error) throw new Error(result.error);
        return { success: true, error: null };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
    { success: false, error: null }
  );

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Invitation Accepted!</h1>
          <p className="text-sm text-muted-foreground">
            You have successfully joined the team as <strong className="text-primary">{role ? formatRoleLabel(role) : 'Staff'}</strong>.
          </p>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="bg-card p-8 rounded-xl shadow-sm border border-border max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold font-heading text-foreground">Accept Invitation</h1>
        <p className="text-sm text-muted-foreground">
          You are currently logged in as <strong>{email}</strong>.
        </p>
        {role && (
          <div className="p-4 bg-muted border border-border rounded-lg text-sm text-foreground font-medium">
            You are invited to join as: <span className="text-primary ml-1">{formatRoleLabel(role)}</span>
          </div>
        )}
        
        {state?.error && (
          <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md text-left">
            {state.error}
          </div>
        )}

        <form action={formAction}>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/50">
            {isPending ? 'Accepting...' : 'Accept Invitation'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          If this is not your account, please sign out and log in with the correct email.
        </p>
      </div>
    </div>
  );
}
