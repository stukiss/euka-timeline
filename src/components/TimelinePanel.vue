<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TimelineEvent } from '@/types/event'
import { BASE_PX_PER_DAY, MIN_GAP_PX, TRACK_PAD_X } from '@/config/timeline'
import { daysBetween } from '@/utils/date'
import { useTimelineZoom } from '@/composables/useTimelineZoom'
import TimelineEventNode from './TimelineEventNode.vue'
import ImageLightbox from './ImageLightbox.vue'

const props = defineProps<{
  events: TimelineEvent[]
  loading: boolean
  error: string | null
}>()

const scroller = ref<HTMLElement | null>(null)

/* Os je vertikálne v strede trate, takže jej stred = zvislý stred prvého eventu.
   Landing sekcia podľa nej počíta cieľ scrollu aj priebeh fade-outu. */
const axisEl = ref<HTMLElement | null>(null)
defineExpose({ axisEl })

/* Na širokých obrazovkách má os vlastný scroll a koliesko myši ju posúva do strán.
   Na mobile scrolluje stránka zvisle, takže koliesko nepreberáme. */
const isWide = ref(true)
let mediaQuery: MediaQueryList | null = null

function syncWidth(event: MediaQueryList | MediaQueryListEvent) {
  isWide.value = event.matches
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 900px)')
  syncWidth(mediaQuery)
  mediaQuery.addEventListener('change', syncWidth)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', syncWidth)
})

const { zoom, zoomPercent, canZoomIn, canZoomOut, zoomIn, zoomOut, resetZoom } = useTimelineZoom(
  scroller,
  isWide,
)

/** Efektívna hustota osi — jediné, čo zoom v skutočnosti mení. */
const pxPerDay = computed(() => BASE_PX_PER_DAY * zoom.value)

/**
 * Pozície bodov.
 *
 * `raw` je čisto proporčná pozícia (dni × px/deň), `x` je výsledná pozícia po
 * odtlačení susedov tak, aby sa karty neprekrývali (MIN_GAP_PX).
 * Proporčnosť tým ostáva zachovaná všade, kde je dosť miesta.
 */
const nodes = computed(() => {
  const firstEvent = props.events[0]
  if (!firstEvent) return []

  const first = firstEvent.dateObj
  let previous = Number.NEGATIVE_INFINITY

  return props.events.map((event, index) => {
    const raw = daysBetween(first, event.dateObj) * pxPerDay.value
    const x = Math.max(raw, previous + MIN_GAP_PX)
    previous = x

    return {
      event,
      raw,
      x,
      side: index % 2 === 0 ? ('top' as const) : ('bottom' as const),
    }
  })
})

const trackWidth = computed(() => {
  const last = nodes.value.at(-1)
  return (last ? last.x : 0) + TRACK_PAD_X * 2
})

/**
 * Prepočet čisto proporčnej súradnice na výslednú (po odtlačení bodov).
 * Používa sa pre značky rokov/mesiacov, aby ostali zarovnané s bodmi.
 */
function mapRawToLayout(raw: number): number {
  const list = nodes.value
  const first = list[0]
  const last = list.at(-1)
  if (!first || !last) return raw

  if (raw <= first.raw) return raw + (first.x - first.raw)

  for (let i = 0; i < list.length - 1; i += 1) {
    const a = list[i]
    const b = list[i + 1]
    if (!a || !b) break

    if (raw <= b.raw) {
      const span = b.raw - a.raw
      const t = span === 0 ? 0 : (raw - a.raw) / span
      const shift = a.x - a.raw + t * (b.x - b.raw - (a.x - a.raw))
      return raw + shift
    }
  }

  return raw + (last.x - last.raw)
}

/** Značky na osi: pri dlhom rozsahu roky, pri krátkom mesiace. */
const ticks = computed(() => {
  const firstEvent = props.events[0]
  const lastEvent = props.events.at(-1)
  if (!firstEvent || !lastEvent || firstEvent === lastEvent) return []

  const first = firstEvent.dateObj
  const last = lastEvent.dateObj
  const spanDays = daysBetween(first, last)
  const byYear = spanDays >= 550

  const result: { key: string; x: number; label: string }[] = []
  const cursor = new Date(Date.UTC(first.getUTCFullYear(), byYear ? 0 : first.getUTCMonth(), 1))

  while (cursor.getTime() <= last.getTime()) {
    const raw = daysBetween(first, cursor) * pxPerDay.value
    if (raw >= 0) {
      result.push({
        key: cursor.toISOString(),
        x: TRACK_PAD_X + mapRawToLayout(raw),
        label: byYear
          ? String(cursor.getUTCFullYear())
          : `${String(cursor.getUTCMonth() + 1).padStart(2, '0')}/${String(cursor.getUTCFullYear()).slice(2)}`,
      })
    }

    if (byYear) cursor.setUTCFullYear(cursor.getUTCFullYear() + 1)
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return result
})

/* --- lightbox --- */
const lightbox = ref<{ images: string[]; title: string; index: number } | null>(null)

function openLightbox(event: TimelineEvent, index: number) {
  lightbox.value = { images: event.images, title: event.title, index }
}
</script>

<template>
  <section class="timeline" aria-label="Časová os spomienok">
    <div class="timeline__bar">
      <p class="timeline__hint">Ctrl / ⌘ + koliesko alebo pinch pre zoom</p>

      <div class="timeline__zoom">
        <button type="button" aria-label="Oddialiť" :disabled="!canZoomOut" @click="zoomOut()">
          −
        </button>
        <button
          type="button"
          class="timeline__zoom-value"
          aria-label="Obnoviť predvolený zoom"
          @click="resetZoom()"
        >
          {{ zoomPercent }} %
        </button>
        <button type="button" aria-label="Priblížiť" :disabled="!canZoomIn" @click="zoomIn()">
          +
        </button>
      </div>
    </div>

    <div ref="scroller" class="timeline__scroller">
      <p v-if="loading" class="timeline__state">Načítavam spomienky…</p>

      <p v-else-if="error" class="timeline__state timeline__state--error">{{ error }}</p>

      <p v-else-if="events.length === 0" class="timeline__state">
        Tu zatiaľ nie je žiadna spomienka.<br />
        <span>Pridaj prvú do súboru <code>public/data/events.json</code>.</span>
      </p>

      <div v-else class="timeline__track" :style="{ width: `${trackWidth}px` }">
        <div ref="axisEl" class="timeline__axis" />

        <span
          v-for="tick in ticks"
          :key="tick.key"
          class="timeline__tick"
          :style="{ left: `${tick.x}px` }"
        >
          {{ tick.label }}
        </span>

        <TimelineEventNode
          v-for="node in nodes"
          :key="node.event.id"
          :event="node.event"
          :x="TRACK_PAD_X + node.x"
          :side="node.side"
          @open="openLightbox"
        />
      </div>
    </div>

    <ImageLightbox
      v-if="lightbox"
      :images="lightbox.images"
      :title="lightbox.title"
      :start-index="lightbox.index"
      @close="lightbox = null"
    />
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

/*
 * Lišta plává nad traťou, nie nad ňou v toku — vďaka tomu vypĺňa scroller
 * celú výšku sekcie a os je presne v jej vertikálnom strede. To je dôležité:
 * cieľ scrollu "prvý event v strede obrazovky" tak vyjde presne na koniec
 * scrollu landing sekcie.
 */
.timeline__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem clamp(1rem, 3vw, 2rem) 0;
  pointer-events: none;
}

.timeline__bar > * {
  pointer-events: auto;
}

.timeline__hint {
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-text-faint);
}

.timeline__zoom {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-pill);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
}

.timeline__zoom button {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--c-text-dim);
  font-size: 1rem;
  line-height: 1;
  transition: background-color 150ms var(--ease);
}

.timeline__zoom button:hover:not(:disabled) {
  background: var(--c-accent-soft);
  color: var(--c-accent-deep);
}

.timeline__zoom button:disabled {
  opacity: 0.35;
  cursor: default;
}

.timeline__zoom-value {
  font-size: 0.75rem !important;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.timeline__scroller {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--c-border-strong) transparent;
  /* `touch-action: pan-x` nechá prst posúvať os, ale pinch si spracujeme sami. */
  touch-action: pan-x pinch-zoom;
}

.timeline__track {
  position: relative;
  height: 100%;
  min-height: 420px;
}

.timeline__axis {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--c-border-strong) 6%,
    var(--c-border-strong) 94%,
    transparent
  );
}

.timeline__tick {
  position: absolute;
  top: calc(50% + 20px);
  transform: translateX(-50%);
  font-size: 0.625rem;
  letter-spacing: 0.14em;
  color: var(--c-text-faint);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.timeline__tick::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: 1px;
  height: 7px;
  background: var(--c-border-strong);
}

.timeline__state {
  display: grid;
  place-content: center;
  height: 100%;
  min-height: 320px;
  padding: 2rem;
  text-align: center;
  line-height: 1.7;
  color: var(--c-text-dim);
}

.timeline__state span {
  font-size: 0.875rem;
  color: var(--c-text-faint);
}

.timeline__state code {
  font-size: 0.8125rem;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-sm);
  background: var(--c-accent-soft);
}

.timeline__state--error {
  color: var(--c-accent-deep);
}

@media (max-width: 899px) {
  /* Na mobile je zoom dotykový (pinch) — textová nápoveda len zaberá miesto. */
  .timeline__hint {
    display: none;
  }

  .timeline__bar {
    justify-content: flex-end;
  }
}
</style>
