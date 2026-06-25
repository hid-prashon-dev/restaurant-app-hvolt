'use client';

import { useActionState, useState } from 'react';
import { createInvite } from '@/app/actions/team';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function InviteForm() {
  const [copied, setCopied] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await createInvite(prevState, formData);
        return result;
      } catch (e: any) {
        return { token: null, success: false, error: e.message };
      }
    },
    { token: null, success: false, error: null }
  );

  const handleCopy = () => {
    if (state.token) {
      const url = `${window.location.origin}/join?token=${state.token}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (state.success && state.token) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6 text-center max-w-lg mx-auto mt-8">
        <div className="mx-auto w-12 h-12 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Invitation Generated!</h2>
        <p className="text-sm text-muted-foreground">
          Copy the secure link below and send it to your staff member.
        </p>
        
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-md text-sm text-warning-foreground text-left">
          <strong>Important:</strong> We do not send emails automatically yet. You must manually share this link. This is the only time the link will be shown.
        </div>
        
        {state.isNewUser && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-md text-sm text-primary text-left font-medium">
            Note: This email does not have a Himavolt account yet. This invite link will securely allow them to create a new password and join your team.
          </div>
        )}

        <div className="flex items-center gap-2">
          <input 
            type="text" 
            readOnly 
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join?token=${state.token}`}
            className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-muted-foreground outline-none"
          />
          <Button type="button" onClick={handleCopy} variant="outline" className="focus-visible:ring-2">
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        <div className="pt-4">
          <Link href="/dashboard/admin/team">
            <Button variant="ghost" className="w-full">Return to Team</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 max-w-lg mx-auto mt-8">
      <div>
        <h2 className="font-heading font-bold text-xl text-foreground">Invite Staff</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate an invite link for an existing user to join your business workspace.
        </p>
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-md mt-4 text-xs text-primary font-medium">
          Note: You can invite both existing users and new users. New users will be prompted to set a password to create their account.
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Staff Email</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="staff@example.com"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-shadow" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Role</label>
          <select 
            name="role" 
            required
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <option value="MANAGER">Manager</option>
            <option value="CASHIER">Cashier</option>
            <option value="WAITER">Waiter</option>
            <option value="KITCHEN_STAFF">Kitchen Staff</option>
            <option value="FRONT_DESK">Front Desk</option>
            <option value="HOUSEKEEPING">Housekeeping</option>
            <option value="INVENTORY_MANAGER">Inventory Manager</option>
          </select>
        </div>

        {state?.error && (
          <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
            {state.error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Link href="/dashboard/admin/team" className="flex-1">
            <Button type="button" variant="outline" className="w-full border-border hover:bg-muted focus-visible:ring-2">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2">
            {isPending ? 'Generating...' : 'Generate Link'}
          </Button>
        </div>
      </form>
    </div>
  );
}
