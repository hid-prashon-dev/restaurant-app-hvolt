import { login } from './actions'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card border border-border rounded-xl shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading mb-4">
            H
          </div>
          <h2 className="text-3xl font-bold font-heading text-foreground">Welcome Back</h2>
          <p className="mt-2 text-muted-foreground">Sign in to your Himavolt dashboard.</p>
        </div>
        <form className="space-y-6" action={login}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              id="email"
              name="email"
              type="email"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            Sign In
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-4">
          Access is currently invite-only for Himavolt operators and hospitality teams.
        </p>
      </div>
    </div>
  )
}
