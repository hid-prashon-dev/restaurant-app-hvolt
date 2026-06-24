'use client';

import { useActionState, useState, useEffect } from 'react';
import { revokeInvite } from '@/app/actions/team';
import { Button } from '@/components/ui/button';

export function RevokeInviteButton({ inviteId, email }: { inviteId: string, email: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        await revokeInvite(formData);
        return { success: true, error: null };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
    { success: false, error: null }
  );

  useEffect(() => {
    if (state.success) {
      setShowConfirm(false);
    }
  }, [state.success]);

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className="text-destructive hover:text-destructive/90 border-destructive/20 hover:bg-destructive/10"
        onClick={() => setShowConfirm(true)}
      >
        Revoke
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-lg border border-border space-y-6">
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground">Revoke Invitation</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to revoke the pending invitation for <strong>{email}</strong>? They will no longer be able to use the link.
              </p>
            </div>

            {state?.error && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">{state.error}</div>
            )}

            <form action={formAction} className="flex justify-end gap-3 pt-2">
              <input type="hidden" name="id" value={inviteId} />
              <Button 
                type="button" 
                variant="outline" 
                disabled={isPending}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending} 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isPending ? 'Revoking...' : 'Revoke Invite'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
