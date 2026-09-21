const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Striktný parser `YYYY-MM-DD`.
 * Zámerne nepoužíva `new Date(string)` — ten ticho prijme aj nezmysly
 * ako "2024-13-45" alebo "minulý utorok" a vráti posunutý/Invalid dátum.
 * Vracia `null`, ak vstup nie je platný kalendárny dátum.
 */
export function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null

  const match = ISO_DATE.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(Date.UTC(year, month - 1, day))

  // Kontrola pretečenia: 2024-02-31 by sa inak "opravilo" na marec.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

/** Počet dní medzi dvoma dátumami (môže byť aj desatinný pri rôznych časoch, tu vždy celé dni). */
export function daysBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MS_PER_DAY
}

const MONTHS_SK = [
  'januára',
  'februára',
  'marca',
  'apríla',
  'mája',
  'júna',
  'júla',
  'augusta',
  'septembra',
  'októbra',
  'novembra',
  'decembra',
]

/** Formátovanie dátumu do slovenského tvaru, napr. "14. mája 2023". */
export function formatDateSk(date: Date): string {
  return `${date.getUTCDate()}. ${MONTHS_SK[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

/** Krátky tvar pre popisky na osi, napr. "05 / 2023". */
export function formatShortSk(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${month} / ${date.getUTCFullYear()}`
}
