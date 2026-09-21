import { onBeforeUnmount, onMounted, type Ref } from 'vue'

/**
 * Podiel cesty k "prvý event je v strede obrazovky", po ktorom je landing
 * už úplne neviditeľný. Hodnota < 1 znamená rezervu — landing zmizne skôr,
 * než prvý event dosiahne stred, presne ako vyžaduje zadanie.
 */
const FADE_RATIO_DESKTOP = 0.75
const FADE_RATIO_MOBILE = 0.62

const MOBILE_QUERY = '(max-width: 899px)'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Postupné miznutie landing sekcie naviazané na scroll pozíciu.
 *
 * Priebeh sa počíta z reálnej pozície prvého eventu v DOM (nie z natvrdo
 * zadaných výšok), takže ostane správny aj po zmene výšok alebo obsahu.
 *
 * Výkon: `scroll` listener je pasívny a iba naplánuje prepočet cez
 * `requestAnimationFrame` (teda najviac raz za snímku). Výsledok sa zapisuje
 * priamo do CSS premennej — Vue sa vôbec neprekresľuje a animujú sa len
 * `opacity` a `transform`.
 *
 * @param landingEl  obal landing sekcie, na ktorý sa aplikuje efekt
 * @param getTarget  vráti element, ktorého stred je cieľom scrollu (os timeline)
 */
export function useLandingFade(
  landingEl: Ref<HTMLElement | null>,
  getTarget: () => HTMLElement | null,
) {
  /** Scroll pozícia, pri ktorej je cieľový element vertikálne v strede viewportu. */
  let targetScroll = 0
  let fadeDistance = 0
  let frame = 0
  let lastProgress = -1

  function ratio(): number {
    return window.matchMedia(MOBILE_QUERY).matches ? FADE_RATIO_MOBILE : FADE_RATIO_DESKTOP
  }

  /** Prepočíta cieľovú scroll pozíciu. Volať po načítaní dát a pri zmene rozmerov. */
  function measure() {
    const target = getTarget()
    if (!target) {
      targetScroll = 0
      fadeDistance = 0
      return
    }

    const rect = target.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2 + window.scrollY
    targetScroll = Math.max(0, centerY - window.innerHeight / 2)
    fadeDistance = targetScroll * ratio()

    apply()
  }

  function apply() {
    const el = landingEl.value
    if (!el) return

    // Ak nie je kam scrollovať, landing nemá prečo miznúť.
    const progress = fadeDistance <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / fadeDistance))

    // Zaokrúhlenie potlačí zbytočné zápisy do DOM pri mikro-posunoch.
    const rounded = Math.round(progress * 1000) / 1000
    if (rounded === lastProgress) return
    lastProgress = rounded

    el.style.setProperty('--landing-fade', String(rounded))
    // Po dokončení sekcia prestane zachytávať kliky aj čítačky obrazovky.
    el.classList.toggle('is-faded-out', rounded >= 1)
  }

  function onScroll() {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      apply()
    })
  }

  function onResize() {
    measure()
  }

  /** Plynulý scroll na pozíciu, kde je prvý event v strede obrazovky. */
  function scrollToTimeline() {
    measure()
    window.scrollTo({
      top: targetScroll,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  onMounted(() => {
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
  })

  onBeforeUnmount(() => {
    if (frame) cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
  })

  return { measure, scrollToTimeline }
}
