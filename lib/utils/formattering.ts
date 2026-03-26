export function formaterKroner(beloeb: number, visDecimaler = false): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: visDecimaler ? 2 : 0,
    maximumFractionDigits: visDecimaler ? 2 : 0,
  }).format(beloeb)
}

export function formaterProcent(vaerdi: number, decimaler = 1): string {
  return `${vaerdi.toFixed(decimaler).replace('.', ',')} %`
}

export function formaterDato(dato: string | Date): string {
  return new Intl.DateTimeFormat('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dato))
}

export function formaterKortDato(dato: string | Date): string {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dato))
}

export function formaterTal(tal: number): string {
  return new Intl.NumberFormat('da-DK').format(tal)
}

export function formaterKvmPris(pris: number): string {
  return `${formaterTal(Math.round(pris))} kr/m²`
}
