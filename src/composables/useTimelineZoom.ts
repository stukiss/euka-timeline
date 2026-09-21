import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import {
  TRACK_PAD_X,
  ZOOM_DEFAULT,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  ZOOM_WHEEL_SENSITIVITY,
} from '@/config/timeline'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Zoom horizontálnej timeline.
 *
 * Zoom mení iba efektívnu hodnotu "pixelov na deň" (teda rozostupy bodov),
 * nie mierku textu — preto sa neškáluje transformom, ale prepočtom pozícií.
 *
 * Pri každej zmene sa dopočíta `scrollLeft` tak, aby bod pod kurzorom
 * (resp. pod stredom pinchu / v strede viewportu pri tlačidlách) zostal na mieste.
 *
 * @param scroller  element s `overflow-x: auto`, v ktorom os žije
 * @param wheelScrollsHorizontally  či má obyčajné koliesko myši posúvať os do strán
 */
export function useTimelineZoom(
  scroller: Ref<HTMLElement | null>,
  wheelScrollsHorizontally: Ref<boolean>,
) {
  const zoom = ref(ZOOM_DEFAULT)
  const zoomPercent = computed(() => Math.round(zoom.value * 100))
  const canZoomIn = computed(() => zoom.value < ZOOM_MAX - 1e-6)
  const canZoomOut = computed(() => zoom.value > ZOOM_MIN + 1e-6)

  /**
   * Nastaví zoom a zachová kotviaci bod.
   * @param next        požadovaná úroveň (orežie sa na [ZOOM_MIN, ZOOM_MAX])
   * @param anchorClientX  x-ová súradnica kotvy vo viewporte; ak chýba, použije sa stred osi
   */
  function setZoom(next: number, anchorClientX?: number) {
    const previous = zoom.value
    const target = clamp(next, ZOOM_MIN, ZOOM_MAX)
    if (target === previous) return

    const el = scroller.value
    if (!el) {
      zoom.value = target
      return
    }

    const rect = el.getBoundingClientRect()
    const anchorOffset =
      anchorClientX === undefined ? rect.width / 2 : clamp(anchorClientX - rect.left, 0, rect.width)

    // Súradnica kotvy v rámci obsahu, prepočítaná na "dátovú" os (bez ľavého paddingu).
    const dataX = el.scrollLeft + anchorOffset - TRACK_PAD_X
    const ratio = target / previous

    zoom.value = target

    // Šírka trate sa prepočíta až po prekreslení, preto až potom nastavíme scroll.
    requestAnimationFrame(() => {
      const current = scroller.value
      if (!current) return
      current.scrollLeft = TRACK_PAD_X + dataX * ratio - anchorOffset
    })
  }

  function zoomIn(anchorClientX?: number) {
    setZoom(zoom.value * ZOOM_STEP, anchorClientX)
  }

  function zoomOut(anchorClientX?: number) {
    setZoom(zoom.value / ZOOM_STEP, anchorClientX)
  }

  function resetZoom() {
    setZoom(ZOOM_DEFAULT)
  }

  function onWheel(event: WheelEvent) {
    const el = scroller.value
    if (!el) return

    // Ctrl/Cmd + koliesko = zoom (a zároveň potlačíme natívny zoom prehliadača).
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      setZoom(zoom.value * Math.exp(-event.deltaY * ZOOM_WHEEL_SENSITIVITY), event.clientX)
      return
    }

    // Obyčajné koliesko myši (vertikálne) prekladáme na posun osi do strán.
    // Len na širokých obrazovkách — na mobile má prednosť zvislý scroll stránky.
    if (!wheelScrollsHorizontally.value) return
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

    event.preventDefault()
    el.scrollLeft += event.deltaY
  }

  // --- pinch-to-zoom na dotykových zariadeniach ---
  let pinchStartDistance = 0
  let pinchStartZoom = 1

  /** Vzdialenosť a stred medzi dvoma prstami; `null`, ak prsty nie sú práve dva. */
  function pinchMetrics(event: TouchEvent): { distance: number; midX: number } | null {
    const a = event.touches[0]
    const b = event.touches[1]
    if (!a || !b) return null

    return {
      distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
      midX: (a.clientX + b.clientX) / 2,
    }
  }

  function onTouchStart(event: TouchEvent) {
    const metrics = pinchMetrics(event)
    if (!metrics) return
    pinchStartDistance = metrics.distance
    pinchStartZoom = zoom.value
  }

  function onTouchMove(event: TouchEvent) {
    if (pinchStartDistance === 0) return
    const metrics = pinchMetrics(event)
    if (!metrics) return

    event.preventDefault()
    setZoom(pinchStartZoom * (metrics.distance / pinchStartDistance), metrics.midX)
  }

  function onTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) pinchStartDistance = 0
  }

  // Listenery sa pripájajú ručne, lebo `preventDefault` vyžaduje `passive: false`,
  // čo sa cez `@wheel` v šablóne nastaviť nedá.
  function attach(el: HTMLElement) {
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })
  }

  function detach(el: HTMLElement) {
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
    el.removeEventListener('touchcancel', onTouchEnd)
  }

  watch(
    scroller,
    (el, previous) => {
      if (previous) detach(previous)
      if (el) attach(el)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (scroller.value) detach(scroller.value)
  })

  return { zoom, zoomPercent, canZoomIn, canZoomOut, setZoom, zoomIn, zoomOut, resetZoom }
}
