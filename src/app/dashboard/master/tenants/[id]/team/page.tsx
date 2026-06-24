import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getTenantTeam } from '@/app/actions/team';
import Link from 'next/link';

export default async function MasterTenantTeamPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'MASTER_ADMIN') redirect('/access-denied');

  const { data: tenant } = await supabase.from('tenants').select('public_name').eq('id', id).single();
  if (!tenant) notFound();

  const team = await getTenantTeam(id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/master/tenants" className="hover:text-foreground transition-colors">Tenants</Link>
        <span>/</span>
        <Link href={`/dashboard/master/tenants/${id}`} className="hover:text-foreground transition-colors">{tenant.public_name}</Link>
        <span>/</span>
        <span className="text-foreground">Team</span>
      </div>

      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Tenant Team</h1>
        <p className="text-muted-foreground mt-1">Platform support visibility for {tenant.public_name}</p>
      </div>

      {team.length === 0 ? (
        <div className="bg-card border border-border p-8 rounded-xl text-center shadow-sm">
          <p className="text-muted-foreground">This tenant does not have any active staff members yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-6">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Internal ID</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {team.map((member: any) => (
                <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{member.id}</td>
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
  );
}
