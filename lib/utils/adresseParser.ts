// Parser adresser fra Boligsiden og Ejendomstorvet URLs

export function parseBoligURL(url: string): string | null {
  // Boligsiden: /bolig/12345-vejnavn-vejnummer-by-postnummer/
  const boligsidenMatch = url.match(
    /boligsiden\.dk\/bolig\/\d+-([a-z0-9-]+)-(\d{4})/i
  )
  if (boligsidenMatch) {
    // Returner rå slug til videre opslag via DAWA
    return boligsidenMatch[1].replace(/-/g, ' ')
  }

  // Ejendomstorvet: /ejendom/vejnavn-by/id/
  const ejendomstorvetMatch = url.match(
    /ejendomstorvet\.dk\/ejendom\/([a-z0-9-]+)\/\d+/i
  )
  if (ejendomstorvetMatch) {
    return ejendomstorvetMatch[1].replace(/-/g, ' ')
  }

  return null
}

export function erBoligURL(tekst: string): boolean {
  return (
    tekst.startsWith('http') &&
    (tekst.includes('boligsiden.dk') || tekst.includes('ejendomstorvet.dk'))
  )
}
