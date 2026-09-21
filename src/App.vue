<script setup lang="ts">
import { useEvents } from '@/composables/useEvents'
import LandingPanel from '@/components/LandingPanel.vue'
import TimelinePanel from '@/components/TimelinePanel.vue'

const { events, loading, error } = useEvents()
</script>

<template>
  <div class="page">
    <div class="page__landing">
      <LandingPanel :event-count="events.length" />
    </div>

    <div class="page__timeline">
      <TimelinePanel :events="events" :loading="loading" :error="error" />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
}

.page__landing {
  display: flex;
  align-items: center;
}

/* --- Desktop: dva stĺpce vedľa seba, stránka sama nescrolluje --- */
@media (min-width: 900px) {
  .page {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    height: 100dvh;
    overflow: hidden;
  }

  .page__landing {
    height: 100%;
    overflow-y: auto;
  }

  .page__timeline {
    min-width: 0;
    height: 100%;
    border-left: 1px solid var(--c-border);
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.35));
  }
}

/* --- Mobil: landing hore, os pod ním na plnú šírku --- */
@media (max-width: 899px) {
  .page__landing {
    min-height: 72svh;
  }

  .page__timeline {
    padding-bottom: 2rem;
    border-top: 1px solid var(--c-border);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.45), transparent);
  }
}
</style>
