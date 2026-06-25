'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { assignTenantAdmin } from '@/app/actions/tenant';
import { Button } from '@/components/ui/button';

export function AdminAssignmentForm({ tenantId, tenantName, existingAdmin }: { tenantId: string, tenantName: string, existingAdmin: any }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await assignTenantAdmin(formData);
        if (!result.success) {
          return { success: false, error: result.message };
        }
        return { success: true, error: null };
      } catch (e: any) {
        return { success: false, error: 'Something went wrong. Please try again.' };
      }
    },
    { success: false, error: null }
  );

  // Close dialog on success
  useEffect(() => {
    if (state.success) {
      setShowConfirm(false);
      setEmail('');
    }
  }, [state.success]);

  // Handle escape key to close modal securely
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirm && !isPending) {
        setShowConfirm(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfirm, isPending]);

  const handleReviewClick = () => {
    if (formRef.current && formRef.current.checkValidity()) {
      setShowConfirm(true);
    } else {
      formRef.current?.reportValidity();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 relative">
      <h2 className="font-heading font-bold text-lg border-b border-border pb-2">Admin Assignment</h2>
      
      {existingAdmin ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Current Assigned Admin:</p>
          <div className="bg-muted border border-border p-3 rounded-md flex justify-between items-center">
            <span className="font-medium text-sm text-foreground">{existingAdmin.email}</span>
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium tracking-wide">{existingAdmin.role}</span>
          </div>
          <p className="text-sm text-warning font-medium">Admin reassignment is deferred to a later phase.</p>
        </div>
      ) : (
        <>
          <form action={formAction} ref={formRef} className="space-y-4">
            <input type="hidden" name="tenantId" value={tenantId} />
            <p className="text-sm text-muted-foreground">Assign an existing unassigned user as the administrator for this tenant.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">User Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-shadow" 
              />
            </div>

            <div className="bg-warning/10 border border-warning/20 p-4 rounded-md text-sm text-warning-foreground">
              <strong>Warning:</strong> Assigning an admin will permanently elevate their dashboard access to this business and remove them from any previous unassigned state.
            </div>

            {state?.error && !showConfirm && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">{state.error}</div>
            )}
            {state?.success && (
              <div className="text-sm text-success font-medium bg-success/10 border border-success/20 p-3 rounded-md">Admin successfully assigned!</div>
            )}

            <Button 
              type="button" 
              disabled={isPending} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleReviewClick}
            >
              Review Assignment
            </Button>

            {showConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                <div 
                  className="bg-card w-full max-w-md rounded-xl p-6 shadow-lg border border-border space-y-6"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="confirm-dialog-title"
                >
                  <div>
                    <h3 id="confirm-dialog-title" className="text-xl font-heading font-bold text-foreground">Confirm Admin Assignment</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      This will give the selected user Admin access to this tenant. Only assign users you trust to manage this business workspace.
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-sm bg-muted/50 p-4 rounded-md border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenant:</span>
                      <span className="font-medium">{tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target Email:</span>
                      <span className="font-medium">{email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Role:</span>
                      <span className="font-medium text-primary bg-primary/10 px-2 rounded-full border border-primary/20">ADMIN</span>
                    </div>
                  </div>

                  {state?.error && (
                    <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">{state.error}</div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={isPending}
                      onClick={() => setShowConfirm(false)}
                      className="border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isPending} 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {isPending ? 'Assigning...' : 'Confirm Assignment'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
