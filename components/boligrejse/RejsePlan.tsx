import { Card } from '@/components/ui/Card'
import { formaterKroner, formaterProcent } from '@/lib/utils/formattering'
import type { BoligrejsePlan } from '@/lib/engines/boligrejse'

interface RejsePlanProps {
  plan: BoligrejsePlan
}

export function RejsePlan({ plan }: RejsePlanProps) {
  return (
    <div className="space-y-4">
      {/* Opsum */}
      <Card className="border-l-4 border-l-green-500">
        <p className="text-sm text-gray-700">{plan.opsum}</p>
      </Card>

      {/* Nøgletal */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card padding="sm">
          <p className="text-xs text-gray-500 mb-1">Maks. køb nu</p>
          <p className="text-lg font-bold text-gray-900">{formaterKroner(plan.maks_koebspris_nu)}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-gray-500 mb-1">Anbefalet pris nu</p>
          <p className="text-lg font-bold text-blue-700">{formaterKroner(plan.anbefalet_koebspris)}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-gray-500 mb-1">Månedlig ydelse</p>
          <p className="text-lg font-bold text-gray-900">{formaterKroner(plan.maanedlig_ydelse)}/md</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-gray-500 mb-1">Drømmebolig</p>
          <p className="text-lg font-bold text-gray-900">{formaterKroner(plan.droemme_pris_midtpunkt)}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-gray-500 mb-1">Forventet år</p>
          <p className="text-lg font-bold text-purple-700">{plan.forventet_droemme_aar}</p>
        </Card>
        {plan.nuvaerende_frivaerdi > 0 && (
          <Card padding="sm">
            <p className="text-xs text-gray-500 mb-1">Din friværdi</p>
            <p className="text-lg font-bold text-green-700">{formaterKroner(plan.nuvaerende_frivaerdi)}</p>
          </Card>
        )}
      </div>

      {/* Trinplan */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Din plan trin for trin</h3>
        <div className="relative">
          {/* Linje */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {plan.trin.map((trin) => (
              <div key={trin.trin} className="flex gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold z-10 relative">
                    {trin.trin}
                  </div>
                </div>
                <Card padding="sm" className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-900">{trin.titel}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{trin.beskrivelse}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        {trin.tidspunkt}
                      </span>
                      {trin.beloeb && (
                        <p className="text-sm font-semibold text-gray-900 mt-1">{formaterKroner(trin.beloeb)}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Beregningerne er estimater og tager udgangspunkt i historisk prisudvikling og standardantagelser. Dette er ikke finansiel rådgivning.
      </p>
    </div>
  )
}
