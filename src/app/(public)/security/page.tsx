export default function SecurityPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-24">
        <h1 className="text-5xl font-heading font-bold text-foreground mb-8">Security Overview</h1>
        
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8">
          <div className="border-l-4 border-primary pl-4 py-1">
            <h2 className="text-lg font-bold text-foreground">Security by Design</h2>
            <p className="text-muted-foreground mt-1">
              Himavolt is built on a structured architecture that prioritizes role isolation and tenant security.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-semibold text-foreground border-b border-border pb-2">Current Implemented Foundation</h3>
            <ul className="list-disc pl-5 text-muted-foreground space-y-3">
              <li><strong>Authentication:</strong> Powered by Supabase Auth with secure, HTTP-only server-side sessions.</li>
              <li><strong>Route Protection:</strong> Server-side role verification prevents unauthorized dashboard access.</li>
              <li><strong>Role-Based Access Control (RBAC):</strong> Strict dashboard route guards enforce role boundaries (e.g., Cashier vs. Front Desk).</li>
              <li><strong>Row-Level Security (RLS):</strong> The profile database table enforces an own-row read policy, ensuring users can only read their own profile data.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-semibold text-foreground border-b border-border pb-2">Planned Security Implementations</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As Himavolt prepares for production, the following security measures will be implemented across the platform:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-4 rounded-lg bg-muted/30">
                <strong className="text-foreground block mb-1">Tenant Isolation</strong>
                <span className="text-sm text-muted-foreground">Database-level strict data isolation ensuring businesses never cross-pollinate data.</span>
              </div>
              <div className="border border-border p-4 rounded-lg bg-muted/30">
                <strong className="text-foreground block mb-1">Audit Logs</strong>
                <span className="text-sm text-muted-foreground">Comprehensive tracking of sensitive actions performed by staff and admins.</span>
              </div>
              <div className="border border-border p-4 rounded-lg bg-muted/30">
                <strong className="text-foreground block mb-1">Rate Limiting</strong>
                <span className="text-sm text-muted-foreground">Protection against abuse on public endpoints like QR scanning and booking.</span>
              </div>
              <div className="border border-border p-4 rounded-lg bg-muted/30">
                <strong className="text-foreground block mb-1">Secure Channels</strong>
                <span className="text-sm text-muted-foreground">Authenticated real-time channels for live order updates and KDS routing.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
