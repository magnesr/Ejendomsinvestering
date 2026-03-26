import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { formaterKroner, formaterProcent, formaterTal } from '@/lib/utils/formattering'
import type { VurderingsResultat as VurderingsResultatType } from '@/types/api'

interface VurderingsResultatProps {
  resultat: VurderingsResultatType
}

export function VurderingsResultat({ resultat }: VurderingsResultatProps) {
  const {
    adresse, by, postnummer, bbr,
    beregnet_vaerdi, listepris, pris_afvigelse_pct,
    prognose_3_aar, prognose_5_aar,
    estimeret_husleje, lejeafkast_pct,
    investerings_score, anbefalings_tekst,
  } = resultat

  const vaerdistigning3 = prognose_3_aar - beregnet_vaerdi
  const vaerdistigning5 = prognose_5_aar - beregnet_vaerdi

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{adresse}</h2>
          <p className="text-gray-500">{postnummer} {by}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="graa">{bbr.boligtype}</Badge>
            <Badge variant="graa">{formaterTal(bbr.areal_kvm)} m²</Badge>
            <Badge variant="graa">Opført {bbr.byggeaar}</Badge>
          </div>
        </div>
        <ScoreRing score={investerings_score} size="lg" />
      </div>

      {/* Anbefaling */}
      <Card className="border-l-4 border-l-blue-500">
        <p className="text-sm text-gray-700">{anbefalings_tekst}</p>
      </Card>

      {/* Prisanalyse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimeret markedsværdi</p>
          <p className="text-2xl font-bold text-gray-900">{formaterKroner(beregnet_vaerdi)}</p>
          {listepris && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">Listepris: {formaterKroner(listepris)}</span>
              {pris_afvigelse_pct !== undefined && (
                <Badge variant={pris_afvigelse_pct > 5 ? 'roed' : pris_afvigelse_pct < -5 ? 'groen' : 'gul'}>
                  {pris_afvigelse_pct > 0 ? '+' : ''}{formaterProcent(pris_afvigelse_pct)}
                </Badge>
              )}
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lejeafkast</p>
          <p className="text-2xl font-bold text-gray-900">{formaterProcent(lejeafkast_pct)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Estimeret husleje: {formaterKroner(estimeret_husleje)}/md
          </p>
        </Card>
      </div>

      {/* Prisproqnose */}
      <Card>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Forventet prisudvikling</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400 mb-1">I dag</p>
            <p className="font-semibold text-gray-900">{formaterKroner(beregnet_vaerdi)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Om 3 år</p>
            <p className="font-semibold text-gray-900">{formaterKroner(prognose_3_aar)}</p>
            <p className="text-xs text-green-600">+{formaterKroner(vaerdistigning3)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Om 5 år</p>
            <p className="font-semibold text-gray-900">{formaterKroner(prognose_5_aar)}</p>
            <p className="text-xs text-green-600">+{formaterKroner(vaerdistigning5)}</p>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400">
        Alle beregninger er estimater baseret på offentligt tilgængelige markedsdata og udgør ikke finansiel rådgivning. Kontakt en godkendt rådgiver ved konkrete investeringsbeslutninger.
      </p>
    </div>
  )
}
