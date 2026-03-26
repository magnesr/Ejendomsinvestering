'use client'

import { useState, useEffect } from 'react'
import { PostnummerOpsaetning } from '@/components/markedsradar/PostnummerOpsaetning'
import { MarkedsStatus } from '@/components/markedsradar/MarkedsStatus'

export default function MarkedsradarSide() {
  const [opsaetninger, setOpsaetninger] = useState<unknown[]>([])
  const [indlaeser, setIndlaeser] = useState(true)

  useEffect(() => {
    fetch('/api/markedsradar')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOpsaetninger(data)
        setIndlaeser(false)
      })
      .catch(() => setIndlaeser(false))
  }, [])

  async function tilfoejOpsaetning(postnummer: string, boligtype: string, notifikationEmail: boolean) {
    const svar = await fetch('/api/markedsradar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postnummer, boligtype, notifikation_email: notifikationEmail }),
    })
    if (svar.ok) {
      const ny = await svar.json()
      setOpsaetninger(prev => [ny, ...prev])
    }
  }

  async function sletOpsaetning(id: string) {
    await fetch(`/api/markedsradar?id=${id}`, { method: 'DELETE' })
    setOpsaetninger(prev => prev.filter((o: unknown) => (o as { id: string }).id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Markedsradar</h1>
        <p className="mt-1 text-gray-600">
          Opsæt overvågning på postnumre og modtag automatiske notifikationer ved prisændringer.
        </p>
      </div>

      <PostnummerOpsaetning onTilfoej={tilfoejOpsaetning} />

      {indlaeser ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <MarkedsStatus opsaetninger={opsaetninger as any} onSlet={sletOpsaetning} />
      )}
    </div>
  )
}
