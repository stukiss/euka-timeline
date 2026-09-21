<script setup lang="ts">
defineProps<{
  /** Počet platných eventov — zobrazí sa ako jemný podtitul. */
  eventCount: number
}>()
</script>

<template>
  <header class="landing">
    <p class="landing__eyebrow">Naše spomienky</p>

    <h1 class="landing__title">
      Lorem ipsum dolor sit amet,
      <em>consectetur</em>
      adipiscing elit
    </h1>

    <p class="landing__lead">
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
      quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>

    <p class="landing__note">
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur.
    </p>

    <p v-if="eventCount > 0" class="landing__meta">
      {{ eventCount }}
      {{ eventCount === 1 ? 'spomienka' : eventCount < 5 ? 'spomienky' : 'spomienok' }}
      <span class="landing__meta-sep">·</span>
      posúvaj os doprava
    </p>
  </header>
</template>

<style scoped>
.landing {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: clamp(2rem, 5vw, 4.5rem);
  max-width: 34rem;
}

.landing__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-accent-deep);
  font-weight: 500;
}

.landing__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2.4rem, 5.2vw, 4.2rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.landing__title em {
  font-style: italic;
  color: var(--c-accent-deep);
}

.landing__lead {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--c-text-dim);
  max-width: 30rem;
}

.landing__note {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--c-text-faint);
  max-width: 28rem;
}

.landing__meta {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-text-faint);
}

.landing__meta-sep {
  margin: 0 0.4rem;
}
</style>
