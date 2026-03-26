'use client'

import { Badge } from '@/components/ui/Badge'
import { formaterDato } from '@/lib/utils/formattering'

interface Haendelse {
  id: string
  haendelse_type: string
  beskrivelse: string
  vaerdi?: number
  created_at: string
}

interface Opsaetning {
  id: string
  postnummer: string
  boligtype: string
  seneste_pris_index: number
  notifikation_email: boolean
  created_at: string
  markedsradar_haendelser?: Haendelse[]
}

interface Props {
  opsaetninger: Opsaetning[]
  onSlet: (id: string) => void
}

const BOLIGTYPE_LABELS: Record<string, string> = {
  alle: 'Alle typer',
  villa: 'Villa / Hus',
  ejerlejlighed: 'Ejerlejlighed',
  raekkehus: 'Rækkehus',
}

export function MarkedsStatus({ opsaetninger, onSlet }: Props) {
  if (opsaetninger.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500">Ingen postnumre overvåges endnu</p>
        <p className="text-sm text-gray-400 mt-1">Tilføj et postnummer ovenfor for at starte</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {opsaetninger.map(ops => {
        const haendelser = ops.markedsradar_haendelser ?? []
        const sidsteHaendelse = haendelser.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        return (
          <div key={ops.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">{ops.postnummer}</span>
                  <Badge variant="graa">{BOLIGTYPE_LABELS[ops.boligtype] ?? ops.boligtype}</Badge>
                  {ops.notifikation_email && (
                    <Badge variant="blaa">Email på</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Overvåget siden {formaterDato(ops.created_at)} · Prisindeks: {ops.seneste_pris_index.toFixed(1)}
                </p>
              </div>
              <button
                onClick={() => onSlet(ops.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Stop overvågning"
              >
                ✕ Stop
              </button>
            </div>

            {haendelser.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Seneste hændelser</p>
                {haendelser.slice(0, 3).map(h => (
                  <div key={h.id} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      h.haendelse_type === 'stigning' ? 'bg-green-500' :
                      h.haendelse_type === 'fald' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-gray-700">{h.beskrivelse}</span>
                    <span className="text-gray-400 ml-auto flex-shrink-0">{formaterDato(h.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">Ingen hændelser endnu — vi overvåger og sender besked ved prisændringer over 2%</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
