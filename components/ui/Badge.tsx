type BadgeVariant = 'groen' | 'gul' | 'roed' | 'blaa' | 'graa' | 'lilla'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantKlasser: Record<BadgeVariant, string> = {
  groen: 'bg-green-100 text-green-800',
  gul: 'bg-yellow-100 text-yellow-800',
  roed: 'bg-red-100 text-red-800',
  blaa: 'bg-blue-100 text-blue-800',
  graa: 'bg-gray-100 text-gray-700',
  lilla: 'bg-purple-100 text-purple-800',
}

export function Badge({ variant = 'graa', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantKlasser[variant]} ${className}`}>
      {children}
    </span>
  )
}
