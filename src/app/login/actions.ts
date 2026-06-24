'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const nextParam = formData.get('next') as string;
    const appendNext = nextParam ? `&next=${encodeURIComponent(nextParam)}` : '';
    redirect(`/login?error=${encodeURIComponent(error.message)}${appendNext}`)
  }

  revalidatePath('/', 'layout')
  
  const nextPath = formData.get('next') as string;
  if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    redirect(nextPath);
  } else {
    redirect('/dashboard')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
