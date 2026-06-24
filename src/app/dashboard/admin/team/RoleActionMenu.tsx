'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateTeamMemberRole, removeTeamMember } from '@/app/actions/team';

export function RoleActionMenu({ memberId, currentRole, email, isSelf }: { memberId: string, currentRole: string, email: string, isSelf: boolean }) {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const allowedRoles = ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN_STAFF', 'FRONT_DESK', 'HOUSEKEEPING', 'INVENTORY_MANAGER'];
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const canManage = !isSelf && allowedRoles.includes(currentRole);

  const handleRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('id', memberId);
        formData.append('role', selectedRole);
        const result = await updateTeamMemberRole(formData);
        if (result?.error) throw new Error(result.error);
        setIsRoleModalOpen(false);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const handleRemove = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('id', memberId);
        const result = await removeTeamMember(formData);
        if (result?.error) throw new Error(result.error);
        setIsRemoveModalOpen(false);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  if (!canManage) {
    return <span className="text-xs text-muted-foreground italic px-2">Unmanaged</span>;
  }

  return (
    <div className="relative inline-block text-left">
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => setIsRoleModalOpen(true)}>Change Role</Button>
        <Button variant="destructive" size="sm" onClick={() => setIsRemoveModalOpen(true)}>Remove</Button>
      </div>

      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-xl shadow-lg max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold font-heading text-foreground">Change Role</h3>
            <p className="text-sm text-muted-foreground">Select a new role for <strong>{email}</strong>.</p>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            
            <form onSubmit={handleRoleChange} className="space-y-4">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {allowedRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending || selectedRole === currentRole}>
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRemoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-xl shadow-lg max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold font-heading text-destructive">Remove from Business</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove <strong>{email}</strong>? They will lose access to this business immediately. Their account will not be deleted.
            </p>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            
            <form onSubmit={handleRemove} className="space-y-4 pt-2">
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsRemoveModalOpen(false)} disabled={isPending}>Cancel</Button>
                <Button type="submit" variant="destructive" disabled={isPending}>
                  {isPending ? 'Removing...' : 'Remove Staff'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
