<script setup lang="ts">
defineProps<{
  /** Počet platných eventov — zobrazí sa ako jemný podtitul. */
  eventCount: number
}>()

const emit = defineEmits<{ 'scroll-to-timeline': [] }>()
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

    <button class="landing__cta" type="button" @click="emit('scroll-to-timeline')">
      Pozrieť spomienky
      <svg class="landing__cta-arrow" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 3v10M3.5 8.5 8 13l4.5-4.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

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
  align-items: flex-start;
  gap: 1.25rem;
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 4.5rem);
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
  font-size: clamp(2.4rem, 5.6vw, 4.6rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  max-width: 20ch;
}

.landing__title em {
  font-style: italic;
  color: var(--c-accent-deep);
}

.landing__lead {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--c-text-dim);
  max-width: 44ch;
}

.landing__note {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--c-text-faint);
  max-width: 42ch;
}

/* --- tlačidlo --- */
.landing__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
  padding: 0.85rem 1.6rem;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--c-accent-deep);
  color: var(--c-surface-solid);
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  box-shadow: var(--shadow-md);
  transition:
    transform 180ms var(--ease),
    background-color 180ms var(--ease),
    box-shadow 180ms var(--ease);
}

.landing__cta:hover {
  transform: translateY(-1px);
  background: #b04f6d;
  box-shadow: var(--shadow-lg);
}

.landing__cta:active {
  transform: translateY(0);
}

.landing__cta-arrow {
  width: 16px;
  height: 16px;
  animation: nudge 2.4s var(--ease) infinite;
}

@keyframes nudge {
  0%,
  70%,
  100% {
    transform: translateY(0);
  }
  85% {
    transform: translateY(2px);
  }
}

.landing__meta {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-text-faint);
}

.landing__meta-sep {
  margin: 0 0.4rem;
}

/* --- mobil: dotykovo prívetivejšie tlačidlo --- */
@media (max-width: 899px) {
  .landing {
    gap: 1.1rem;
  }

  .landing__cta {
    width: 100%;
    max-width: 20rem;
    min-height: 52px;
    justify-content: center;
    font-size: 1rem;
  }
}
</style>
