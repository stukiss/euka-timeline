<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  images: string[]
  title: string
  startIndex: number
}>()

const emit = defineEmits<{ close: [] }>()

const index = ref(props.startIndex)

watch(
  () => props.startIndex,
  (value) => {
    index.value = value
  },
)

function step(delta: number) {
  const count = props.images.length
  index.value = (index.value + delta + count) % count
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
  else if (event.key === 'ArrowRight') step(1)
  else if (event.key === 'ArrowLeft') step(-1)
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      class="lightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @click.self="emit('close')"
    >
      <button class="lightbox__close" type="button" aria-label="Zavrieť" @click="emit('close')">
        ×
      </button>

      <button
        v-if="images.length > 1"
        class="lightbox__nav lightbox__nav--prev"
        type="button"
        aria-label="Predchádzajúca fotka"
        @click="step(-1)"
      >
        ‹
      </button>

      <figure class="lightbox__figure">
        <img :src="images[index]" :alt="`${title} — fotka ${index + 1}`" />
        <figcaption class="lightbox__caption">
          {{ title }}
          <span v-if="images.length > 1" class="lightbox__counter">
            {{ index + 1 }} / {{ images.length }}
          </span>
        </figcaption>
      </figure>

      <button
        v-if="images.length > 1"
        class="lightbox__nav lightbox__nav--next"
        type="button"
        aria-label="Ďalšia fotka"
        @click="step(1)"
      >
        ›
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: clamp(1rem, 4vw, 3rem);
  background: rgba(61, 47, 52, 0.55);
  backdrop-filter: blur(10px);
  animation: fade 200ms var(--ease);
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

.lightbox__figure {
  grid-column: 2;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.lightbox__figure img {
  max-width: 100%;
  max-height: 78vh;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  object-fit: contain;
}

.lightbox__caption {
  font-family: var(--font-display);
  font-size: 1.125rem;
  color: var(--c-surface-solid);
  text-align: center;
}

.lightbox__counter {
  display: block;
  margin-top: 0.35rem;
  font-family: var(--font-body);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.72);
}

.lightbox__close,
.lightbox__nav {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  line-height: 1;
  transition: background-color 160ms var(--ease);
}

.lightbox__close:hover,
.lightbox__nav:hover {
  background: rgba(255, 255, 255, 0.28);
}

.lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
}

.lightbox__nav {
  font-size: 1.75rem;
}

.lightbox__nav--prev {
  grid-column: 1;
}

.lightbox__nav--next {
  grid-column: 3;
}

@media (max-width: 640px) {
  .lightbox {
    grid-template-columns: 1fr;
  }

  .lightbox__figure {
    grid-column: 1;
  }

  .lightbox__nav--prev,
  .lightbox__nav--next {
    position: absolute;
    bottom: 1.25rem;
    grid-column: 1;
  }

  .lightbox__nav--prev {
    left: 25%;
  }

  .lightbox__nav--next {
    right: 25%;
  }
}
</style>
