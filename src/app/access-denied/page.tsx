import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/login/actions'

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </div>
      <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Access Denied</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
        You do not have permission to access this page. If you believe this is an error, please contact your administrator.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/dashboard">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            Return to Dashboard
          </Button>
        </Link>
        <form action={logout}>
          <Button type="submit" variant="outline" className="border-border text-foreground hover:bg-muted">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  )
}
