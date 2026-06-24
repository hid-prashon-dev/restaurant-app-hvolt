export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-24">
        <h1 className="text-5xl font-heading font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8">
          <div className="border-l-4 border-warning pl-4 py-1">
            <h2 className="text-lg font-bold text-foreground">Status: Platform Preview</h2>
            <p className="text-muted-foreground mt-1">
              Himavolt is currently in a preview state. This is an informational placeholder.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-semibold text-foreground border-b border-border pb-2">Planned Data Categories</h3>
            <p className="text-muted-foreground leading-relaxed">
              When Himavolt moves to production, the platform is designed to handle specific operational data to support our hospitality partners:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li><strong>Operator Accounts:</strong> Staff credentials and RBAC assignments.</li>
              <li><strong>Operational Data:</strong> Orders, menu items, table statuses, and POS configurations.</li>
              <li><strong>Guest Interactions:</strong> Anonymized or secure guest folio data necessary for hotel and restaurant billing integration.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-semibold text-foreground border-b border-border pb-2">Finalization Notice</h3>
            <p className="text-muted-foreground leading-relaxed">
              Formal privacy controls, data retention policies, and regulatory compliance documents will be finalized and published on this page prior to our production launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
