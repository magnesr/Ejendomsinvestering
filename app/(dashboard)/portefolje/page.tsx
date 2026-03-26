import { PortefoljeOversigt } from '@/components/portefolje/PortefoljeOversigt'

export default function PortefoeljeSide() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portefølje</h1>
        <p className="mt-1 text-gray-600">
          Overblik over dine investeringsejendomme og deres samlede udvikling.
        </p>
      </div>
      <PortefoljeOversigt />
    </div>
  )
}
