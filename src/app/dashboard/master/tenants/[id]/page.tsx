import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AdminAssignmentForm } from './AdminAssignmentForm';

export default async function TenantDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'MASTER_ADMIN') redirect('/access-denied');

  const { data: tenant } = await supabase.from('tenants').select('*').eq('id', id).single();
  if (!tenant) notFound();

  // After strict auth check, we can securely use the service role to read admin profiles
  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();
  const { data: existingAdmin } = await adminSupabase
    .from('profiles')
    .select('id, email, role')
    .eq('tenant_id', id)
    .eq('role', 'ADMIN')
    .maybeSingle();

  // Basic update action (status only for Phase 4A)
  const updateStatus = async (formData: FormData) => {
    'use server';
    const supabase = await createClient();
    const status = formData.get('status') as string;
    await supabase.from('tenants').update({ status }).eq('id', id);
    revalidatePath(`/dashboard/master/tenants/${id}`);
    revalidatePath(`/dashboard/master/tenants`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/master/tenants" className="hover:text-foreground transition-colors">Tenants</Link>
        <span>/</span>
        <span className="text-foreground">{tenant.public_name}</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">{tenant.public_name}</h1>
          <p className="text-muted-foreground mt-1">/{tenant.slug}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${tenant.status === 'ACTIVE' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
          {tenant.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 h-fit">
          <h2 className="font-heading font-bold text-lg border-b border-border pb-2">Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="font-medium">{tenant.business_type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Legal Name:</span> <span className="font-medium">{tenant.legal_name || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Domain:</span> <span className="font-medium">{tenant.custom_domain || 'N/A'}</span></div>
            <div className="flex justify-between flex-col gap-1 mt-2">
              <span className="text-muted-foreground">Internal ID:</span> 
              <span className="font-mono text-xs text-muted-foreground break-all bg-muted/50 p-2 rounded">{tenant.id}</span>
            </div>
          </div>
        </div>

        <form action={updateStatus} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-lg border-b border-border pb-2">Status Control</h2>
          <p className="text-sm text-muted-foreground">Change the operational state of this tenant.</p>
          
          <div className="space-y-4 pt-2">
            <select name="status" defaultValue={tenant.status} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="SETUP_PENDING">Setup Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <Button type="submit" className="w-full">Update Status</Button>
          </div>
        </form>
      </div>
      
      <AdminAssignmentForm tenantId={id} tenantName={tenant.public_name} existingAdmin={existingAdmin} />
    </div>
  );
}
