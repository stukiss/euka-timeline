<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineEvent } from '@/types/event'
import { formatDateSk } from '@/utils/date'

const props = defineProps<{
  event: TimelineEvent
  /** Pozícia stredu krúžku na osi v px (od ľavého okraja trate). */
  x: number
  /** Na ktorú stranu osi ide popisok — striedanie znižuje riziko prekryvu textov. */
  side: 'top' | 'bottom'
}>()

const emit = defineEmits<{ open: [event: TimelineEvent, index: number] }>()

/** V náhľade po hoveri ukazujeme najviac 3 obrázky, zvyšok sa schová za "+N". */
const MAX_THUMBS = 3

const hasImages = computed(() => props.event.images.length > 0)
const thumbs = computed(() => props.event.images.slice(0, MAX_THUMBS))
const extraCount = computed(() => Math.max(0, props.event.images.length - MAX_THUMBS))
const formattedDate = computed(() => formatDateSk(props.event.dateObj))

/** Skloňovanie pre čítačky obrazovky: 1 fotka / 2–4 fotky / 5+ fotiek. */
const imageCountLabel = computed(() => {
  const count = props.event.images.length
  if (count === 1) return '1 fotka'
  if (count < 5) return `${count} fotky`
  return `${count} fotiek`
})
</script>

<template>
  <div class="node" :class="`node--${side}`" :style="{ left: `${x}px` }">
    <button
      class="node__dot"
      :class="{ 'node__dot--has-images': hasImages }"
      type="button"
      :aria-label="`${formattedDate} — ${event.title}${hasImages ? `, ${imageCountLabel}` : ''}`"
      @click="hasImages && emit('open', event, 0)"
    >
      <span class="node__dot-core" />
    </button>

    <div class="node__stack">
      <div class="node__label">
        <p class="node__date">{{ formattedDate }}</p>
        <p class="node__title">{{ event.title }}</p>
      </div>

      <!-- Náhľad obrázkov sa renderuje iba pri eventoch, ktoré nejaké majú,
           a je absolútne pozicovaný — event bez fotiek tak nemá žiadne prázdne miesto. -->
      <div v-if="hasImages" class="node__preview">
        <button
          v-for="(src, index) in thumbs"
          :key="src"
          class="node__thumb"
          type="button"
          @click="emit('open', event, index)"
        >
          <img :src="src" :alt="`${event.title} — fotka ${index + 1}`" loading="lazy" />
        </button>

        <button
          v-if="extraCount > 0"
          class="node__more"
          type="button"
          @click="emit('open', event, MAX_THUMBS)"
        >
          +{{ extraCount }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.node {
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
}

.node:hover,
.node:focus-within {
  z-index: 30;
}

/* Spojnica od krúžku k popisku. */
.node::before {
  content: '';
  position: absolute;
  left: 50%;
  width: 1px;
  height: 26px;
  background: linear-gradient(var(--c-border-strong), transparent);
  transform: translateX(-50%);
}

.node--top::before {
  bottom: 18px;
  background: linear-gradient(transparent, var(--c-border-strong));
}

.node--bottom::before {
  top: 18px;
}

/* --- krúžok na osi --- */
.node__dot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 34px;
  height: 34px;
  padding: 0;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: transparent;
}

.node__dot-core {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--c-surface-solid);
  border: 3px solid var(--c-accent);
  box-shadow: var(--shadow-sm);
  transition:
    width 200ms var(--ease),
    height 200ms var(--ease),
    background-color 200ms var(--ease),
    box-shadow 200ms var(--ease);
}

/* Event s fotkami má plný stred — signál, že sa oplatí naň prejsť myšou. */
.node__dot--has-images .node__dot-core {
  background: var(--c-accent);
}

.node:hover .node__dot-core,
.node:focus-within .node__dot-core {
  width: 26px;
  height: 26px;
  background: var(--c-accent-deep);
  border-color: var(--c-surface-solid);
  box-shadow: 0 0 0 6px var(--c-accent-soft);
}

/* --- popisok --- */
.node__stack {
  position: absolute;
  left: 50%;
  width: 190px;
  transform: translateX(-50%);
  text-align: center;
}

.node--top .node__stack {
  bottom: 44px;
}

.node--bottom .node__stack {
  top: 44px;
}

.node__date {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-accent-deep);
  margin-bottom: 0.3rem;
}

.node__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.25;
  color: var(--c-text);
}

/* --- náhľad fotiek (iba po hoveri / fokuse) --- */
.node__preview {
  position: absolute;
  left: 50%;
  display: flex;
  gap: 6px;
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--c-surface-hover);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(8px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 180ms var(--ease),
    transform 180ms var(--ease),
    visibility 180ms;
}

.node--top .node__preview {
  bottom: calc(100% + 12px);
  transform: translate(-50%, 6px);
}

.node--bottom .node__preview {
  top: calc(100% + 12px);
  transform: translate(-50%, -6px);
}

.node:hover .node__preview,
.node:focus-within .node__preview {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate(-50%, 0);
}

.node__thumb,
.node__more {
  flex: none;
  width: 72px;
  height: 72px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--c-accent-soft);
}

.node__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 220ms var(--ease);
}

.node__thumb:hover img {
  transform: scale(1.06);
}

.node__more {
  display: grid;
  place-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-accent-deep);
}
</style>
