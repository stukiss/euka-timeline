import { ref, onMounted } from 'vue'
import type { EventsFile, RawTimelineEvent, TimelineEvent } from '@/types/event'
import { parseIsoDate } from '@/utils/date'

/** Cesta k dátovému súboru. BASE_URL zabezpečí, že to funguje aj v podadresári GitHub Pages. */
const DATA_URL = `${import.meta.env.BASE_URL}data/events.json`

/**
 * Prevedie surový záznam na validovaný.
 * Nevalidný záznam nevyhodí chybu — vráti `null` a nahlási dôvod do konzoly,
 * aby jeden preklep v JSON nezhodil celú stránku.
 */
function normalize(raw: unknown, index: number): TimelineEvent | null {
  if (typeof raw !== 'object' || raw === null) {
    console.warn(`[timeline] Záznam #${index} sa preskakuje: nie je to objekt.`, raw)
    return null
  }

  const candidate = raw as Partial<RawTimelineEvent>
  const dateObj = parseIsoDate(candidate.date)

  if (!dateObj) {
    console.warn(
      `[timeline] Záznam #${index} sa preskakuje: chýbajúci alebo neplatný dátum ` +
        `(očakáva sa formát YYYY-MM-DD).`,
      candidate.date,
    )
    return null
  }

  const title = typeof candidate.title === 'string' ? candidate.title.trim() : ''
  if (!title) {
    console.warn(`[timeline] Záznam #${index} sa preskakuje: chýbajúci názov eventu.`, candidate)
    return null
  }

  // Obrázky sú voliteľné; nevalidné položky v poli sa ticho odfiltrujú.
  const images = Array.isArray(candidate.images)
    ? candidate.images
        .filter((src): src is string => typeof src === 'string' && src.trim().length > 0)
        .map((src) => `${import.meta.env.BASE_URL}${src.trim().replace(/^\/+/, '')}`)
    : []

  return {
    id: `${candidate.date}-${index}`,
    date: candidate.date as string,
    dateObj,
    title,
    images,
  }
}

/**
 * Načíta a zvaliduje eventy z JSON súboru pri mountnutí komponentu.
 * Výsledok je zoradený chronologicky vzostupne (najstarší prvý).
 */
export function useEvents() {
  const events = ref<TimelineEvent[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(DATA_URL)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const payload = (await response.json()) as EventsFile | RawTimelineEvent[]
      // Akceptujeme aj holé pole, keby sa obal niekedy vynechal.
      const list = Array.isArray(payload) ? payload : payload?.events

      if (!Array.isArray(list)) {
        throw new Error('Súbor events.json neobsahuje pole "events".')
      }

      events.value = list
        .map(normalize)
        .filter((event): event is TimelineEvent => event !== null)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    } catch (cause) {
      console.error('[timeline] Nepodarilo sa načítať dáta.', cause)
      error.value = 'Spomienky sa nepodarilo načítať.'
      events.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { events, loading, error, reload: load }
}
