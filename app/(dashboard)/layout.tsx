import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: profil } = await supabase
    .from('profiles')
    .select('abonnement_type, abonnement_status, fuldt_navn, email')
    .eq('id', user.id)
    .single()

  // Opret profil hvis trigger ikke nåede at køre (fx ved email-bekræftelse)
  if (!profil) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email ?? '',
      fuldt_navn: user.user_metadata?.fuldt_navn ?? null,
    })
    const { data: nyProfil } = await supabase
      .from('profiles')
      .select('abonnement_type, abonnement_status, fuldt_navn, email')
      .eq('id', user.id)
      .single()
    profil = nyProfil
  }

  if (!profil) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar abonnementType={profil.abonnement_type} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar email={profil.email} fuldt_navn={profil.fuldt_navn} abonnementType={profil.abonnement_type} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
