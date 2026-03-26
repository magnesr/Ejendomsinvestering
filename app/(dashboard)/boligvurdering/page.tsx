import { createClient } from '@/lib/supabase/server'
import { FreemiumGate } from '@/components/shared/FreemiumGate'
import { BoligvurderingFormular } from '@/components/boligvurdering/BoligvurderingFormular'
import { Card } from '@/components/ui/Card'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Badge } from '@/components/ui/Badge'
import { formaterKroner, formaterProcent, formaterKortDato } from '@/lib/utils/formattering'
import Link from 'next/link'

export default async function BoligvurderingSide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profilSvar, tidligereVurderingerSvar] = await Promise.all([
    supabase.from('profiles')
      .select('abonnement_type, abonnement_status, gratis_analyser_brugt')
      .eq('id', user!.id)
      .single(),
    supabase.from('boligvurderinger')
      .select('id, adresse, by, postnummer, investerings_score, beregnet_vaerdi, lejeafkast_pct, oprettet_den')
      .eq('bruger_id', user!.id)
      .order('oprettet_den', { ascending: false })
      .limit(5),
  ])

  const profil = profilSvar.data
  const tidligereVurderinger = tidligereVurderingerSvar.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boligvurdering</h1>
        <p className="mt-1 text-gray-600">
          Indtast en adresse eller URL fra Boligsiden/Ejendomstorvet og få en komplet analyse.
        </p>
      </div>

      <FreemiumGate
        abonnementType={profil?.abonnement_type ?? 'freemium'}
        abonnementStatus={profil?.abonnement_status ?? 'aktiv'}
        analyserBrugt={profil?.gratis_analyser_brugt ?? 0}
      >
        <BoligvurderingFormular />
      </FreemiumGate>

      {/* Tidligere vurderinger */}
      {tidligereVurderinger.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Dine seneste vurderinger</h2>
          <div className="space-y-3">
            {tidligereVurderinger.map((v) => (
              <Card key={v.id} padding="sm">
                <div className="flex items-center gap-4">
                  {v.investerings_score && (
                    <ScoreRing score={v.investerings_score} size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{v.adresse}</p>
                    <p className="text-sm text-gray-500">{v.postnummer} {v.by}</p>
                  </div>
                  <div className="text-right">
                    {v.beregnet_vaerdi && (
                      <p className="font-semibold text-gray-900">{formaterKroner(v.beregnet_vaerdi)}</p>
                    )}
                    {v.lejeafkast_pct && (
                      <Badge variant="groen">{formaterProcent(v.lejeafkast_pct)} afkast</Badge>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formaterKortDato(v.oprettet_den)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
