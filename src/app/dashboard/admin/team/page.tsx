import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTenantTeam } from '@/app/actions/team';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RevokeInviteButton } from './RevokeInviteButton';

export default async function AdminTeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN' || !profile.tenant_id) redirect('/access-denied');

  const team = await getTenantTeam(profile.tenant_id);

  const { data: invites } = await supabase
    .from('tenant_invitations')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage your staff and pending invitations.</p>
        </div>
        <Link href="/dashboard/admin/team/invite">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Invite Staff
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground border-b border-border pb-2">Active Staff</h2>
        {team.length === 0 ? (
          <div className="bg-card border border-border p-8 rounded-xl text-center shadow-sm">
            <p className="text-muted-foreground">You don't have any active staff members yet.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {team.map((member: any) => (
                  <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full text-xs font-medium">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground border-b border-border pb-2">Invitations</h2>
        {!invites || invites.length === 0 ? (
          <div className="bg-card border border-border p-8 rounded-xl text-center shadow-sm">
            <p className="text-muted-foreground">No pending or recent invitations.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invites.map((invite: any) => {
                  const isExpired = new Date(invite.expires_at) < new Date();
                  const isAccepted = !!invite.accepted_at;
                  const isRevoked = !!invite.revoked_at;
                  const isPending = !isAccepted && !isRevoked && !isExpired;

                  let statusText = 'Pending';
                  let statusClass = 'bg-warning/10 text-warning border-warning/20';

                  if (isAccepted) {
                    statusText = 'Accepted';
                    statusClass = 'bg-success/10 text-success border-success/20';
                  } else if (isRevoked) {
                    statusText = 'Revoked';
                    statusClass = 'bg-destructive/10 text-destructive border-destructive/20';
                  } else if (isExpired) {
                    statusText = 'Expired';
                    statusClass = 'bg-muted text-muted-foreground border-border';
                  }

                  return (
                    <tr key={invite.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-foreground">{invite.email}</td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full text-xs font-medium">
                          {invite.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending && (
                          <RevokeInviteButton inviteId={invite.id} email={invite.email} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
