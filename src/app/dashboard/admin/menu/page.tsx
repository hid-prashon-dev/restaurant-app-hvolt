import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { MenuManager } from './MenuManager';

export default async function AdminMenuPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { data: settings } = await supabase
    .from('tenant_settings')
    .select('modules_enabled, currency')
    .eq('tenant_id', profile.tenant_id)
    .single();

  const isRestaurantEnabled = settings?.modules_enabled?.restaurant === true;

  if (!isRestaurantEnabled) {
    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
        <main className="flex-1 p-4 md:p-6 max-w-5xl">
          <div className="bg-card border border-border shadow-sm rounded-xl p-8 text-center max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground mb-3">Restaurant Module Required</h1>
            <p className="text-muted-foreground mb-8">
              To setup your menu catalog, you first need to enable the Restaurant operational module for your business.
            </p>
            <Link href="/dashboard/admin/modules" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Go to Modules <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (process.env.NODE_ENV === 'development') console.time('[menu:fetch] all_data');
  const [
    { data: categories },
    { data: subcategories },
    { data: items },
    { data: variants },
    { data: modifierGroups },
    { data: modifiers },
    { data: itemModifierGroups }
  ] = await Promise.all([
    supabase.from('menu_categories').select('*').eq('tenant_id', profile.tenant_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('menu_subcategories').select('*').eq('tenant_id', profile.tenant_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('menu_items').select('*').eq('tenant_id', profile.tenant_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('menu_item_variants').select('*').eq('tenant_id', profile.tenant_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('menu_modifier_groups').select('*').eq('tenant_id', profile.tenant_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('menu_modifiers').select('*').eq('tenant_id', profile.tenant_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('menu_item_modifier_groups').select('*').eq('tenant_id', profile.tenant_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
  ]);
  if (process.env.NODE_ENV === 'development') console.timeEnd('[menu:fetch] all_data');

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <main className="flex-1 p-4 md:p-6 max-w-6xl">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Dishes</h1>
              <p className="text-muted-foreground mt-2">
                Manage your restaurant menu catalog before POS, QR ordering, and KDS are connected.
              </p>
              <div className="mt-2 text-xs font-medium text-warning bg-warning/10 border border-warning/20 px-2 py-1 rounded-md inline-block">
                POS, QR ordering, and kitchen routing are coming in later phases.
              </div>
            </div>
          </div>
          
          <MenuManager 
            categories={categories || []} 
            subcategories={subcategories || []}
            items={items || []} 
            variants={variants || []}
            modifierGroups={modifierGroups || []}
            modifiers={modifiers || []}
            itemModifierGroups={itemModifierGroups || []}
            currency={settings?.currency || 'NPR'} 
          />
        </div>
      </main>
    </div>
  );
}
