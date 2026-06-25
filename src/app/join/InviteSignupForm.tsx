'use client';

import { useActionState } from 'react';
import { signupFromInvite } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatRoleLabel } from '@/utils/roles';

export function InviteSignupForm({ token, email, role, tenantName }: { token: string, email: string, role: string, tenantName?: string }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await signupFromInvite(prevState, formData);
        return result;
      } catch (e: any) {
        return { success: false, error: 'Something went wrong. Please try again.' };
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
          <h1 className="text-2xl font-bold font-heading text-foreground">Account Created!</h1>
          <p className="text-sm text-muted-foreground">
            You have successfully joined the team as <strong className="text-primary">{formatRoleLabel(role)}</strong>.
          </p>
          {state.requireManualLogin ? (
            <Link href="/login">
              <Button className="w-full">Log In</Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="bg-card p-8 rounded-xl shadow-sm border border-border max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-foreground">Join the Team</h1>
          <p className="text-sm text-muted-foreground mt-2">
            You've been invited{tenantName ? ` to join ${tenantName}` : ''} as <strong className="text-primary">{formatRoleLabel(role)}</strong>. Set a password to create your account.
          </p>
        </div>

        {state?.error && (
          <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md text-left">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input 
              type="email" 
              name="email" 
              value={email}
              readOnly
              className="w-full flex h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input 
              type="password" 
              name="password" 
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 mt-4">
            {isPending ? 'Creating Account...' : 'Create Account & Join'}
          </Button>
        </form>
      </div>
    </div>
  );
}
