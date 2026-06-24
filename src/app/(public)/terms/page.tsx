export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-24">
        <h1 className="text-5xl font-heading font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8">
          <div className="border-l-4 border-warning pl-4 py-1">
            <h2 className="text-lg font-bold text-foreground">Status: Platform Preview</h2>
            <p className="text-muted-foreground mt-1">
              Himavolt is currently in an early preview state. This document serves as a placeholder.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-semibold text-foreground border-b border-border pb-2">Invitation-Only Access</h3>
            <p className="text-muted-foreground leading-relaxed">
              Access to the Himavolt platform is currently strictly invitation-only. Accounts created during this preview phase are for operational testing, demonstration, and staging purposes. 
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Public registration is disabled, and unauthorized access attempts are logged and monitored by our server-side auth foundation.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-semibold text-foreground border-b border-border pb-2">Pending Service Terms</h3>
            <p className="text-muted-foreground leading-relaxed">
              Formal service terms, acceptable use policies, and platform agreements are currently being drafted. They will be published on this page and require acceptance from all tenant operators prior to our official public launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
