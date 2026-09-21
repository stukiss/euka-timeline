/** Jeden záznam tak, ako je zapísaný v `public/data/events.json`. */
export interface RawTimelineEvent {
  date: string
  title: string
  images?: string[]
}

/** Tvar celého súboru `events.json`. */
export interface EventsFile {
  events: RawTimelineEvent[]
}

/** Záznam po validácii — dátum je už naparsovaný a cesty k obrázkom sú vyriešené. */
export interface TimelineEvent {
  /** Stabilný kľúč pre `v-for`. */
  id: string
  /** Pôvodný string `YYYY-MM-DD`. */
  date: string
  /** Naparsovaný dátum (polnoc UTC). */
  dateObj: Date
  title: string
  /** Plné cesty k obrázkom vrátane BASE_URL. Prázdne pole = event bez obrázkov. */
  images: string[]
}
