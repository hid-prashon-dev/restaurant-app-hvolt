import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { InviteForm } from './InviteForm';
import Link from 'next/link';

export default async function AdminInvitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN' || !profile.tenant_id) redirect('/access-denied');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/admin/team" className="hover:text-foreground transition-colors">Team</Link>
        <span>/</span>
        <span className="text-foreground">Invite</span>
      </div>
      <InviteForm />
    </div>
  );
}
