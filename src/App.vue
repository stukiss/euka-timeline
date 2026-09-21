<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useEvents } from '@/composables/useEvents'
import { useLandingFade } from '@/composables/useLandingFade'
import LandingPanel from '@/components/LandingPanel.vue'
import TimelinePanel from '@/components/TimelinePanel.vue'

const { events, loading, error } = useEvents()

const landingEl = ref<HTMLElement | null>(null)
const timelineEl = ref<HTMLElement | null>(null)
const timelinePanel = ref<InstanceType<typeof TimelinePanel> | null>(null)

/* Cieľom scrollu je os timeline (tá je vertikálne v strede svojej sekcie, teda
   aj v strede prvého eventu). Kým sa dáta nenačítajú, os neexistuje — vtedy
   poslúži ako náhrada celá sekcia. */
function fadeTarget(): HTMLElement | null {
  return timelinePanel.value?.axisEl ?? timelineEl.value
}

const { measure, scrollToTimeline } = useLandingFade(landingEl, fadeTarget)

// Po načítaní eventov sa objaví os — cieľ scrollu treba premerať.
watch(
  () => events.value.length,
  async () => {
    await nextTick()
    measure()
  },
)
</script>

<template>
  <div class="page">
    <div ref="landingEl" class="page__landing">
      <LandingPanel :event-count="events.length" @scroll-to-timeline="scrollToTimeline" />
    </div>

    <div ref="timelineEl" class="page__timeline">
      <TimelinePanel ref="timelinePanel" :events="events" :loading="loading" :error="error" />
    </div>
  </div>
</template>

<style scoped>
/*
 * Landing sekcia (hero) je nad timeline, stránka sa scrolluje zvisle.
 * Timeline sekcia je vysoká presne jeden viewport, takže po odscrollovaní
 * landing sekcie vypĺňa obrazovku a os je vertikálne v strede.
 */
.page__landing {
  display: flex;
  align-items: center;
  min-height: 82svh;

  /* Priebeh fade-outu zapisuje composable priamo sem ako CSS premennú,
     takže Vue sa pri scrolle neprekresľuje. */
  opacity: calc(1 - var(--landing-fade, 0));
  transform: translateY(calc(var(--landing-fade, 0) * -40px))
    scale(calc(1 - var(--landing-fade, 0) * 0.04));
  transform-origin: 50% 30%;
  will-change: opacity, transform;
}

/* Po dokončení fade-outu sekcia už nesmie zachytávať kliky ani fokus. */
.page__landing.is-faded-out {
  visibility: hidden;
  pointer-events: none;
}

.page__timeline {
  height: 100svh;
  border-top: 1px solid var(--c-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent 40%);
}

@media (max-width: 899px) {
  .page__landing {
    /* Nižší podiel než na desktope — text sa tu zalamuje do viac riadkov
       a tlačidlo musí ostať nad foldom. Stále nad požadovanou 2/3 hranicou. */
    min-height: 72svh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page__landing {
    transform: none;
  }
}
</style>
