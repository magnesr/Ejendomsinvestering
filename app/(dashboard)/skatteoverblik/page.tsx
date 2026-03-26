import { OmkostningsBeregner } from '@/components/skatteoverblik/OmkostningsBeregner'

export default function SkatteoverblikSide() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skatte- og omkostningsoverblik</h1>
        <p className="mt-1 text-gray-600">
          Beregn hvad en bolig reelt koster per måned — ikke bare ydelsen.
        </p>
      </div>
      <OmkostningsBeregner />
    </div>
  )
}
