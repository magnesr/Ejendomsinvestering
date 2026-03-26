import { SammenligningsGrid } from '@/components/sammenligning/SammenligningsGrid'

export default function SammenligningsSide() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sammenligningsværktøj</h1>
        <p className="mt-1 text-gray-600">Tilføj 2-3 boliger og sammenlign dem side om side.</p>
      </div>
      <SammenligningsGrid />
    </div>
  )
}
