/**
 * Ladiace konštanty timeline.
 * Toto je jediné miesto, kde sa upravuje hustota a limity zoomu.
 */

/**
 * Koľko pixelov zodpovedá jednému dňu pri zoome = 1.
 * 1.2 px/deň ≈ týždeň 8 px, mesiac 36 px, rok 438 px.
 * Zvýš pre redšiu (roztiahnutejšiu) os, zníž pre hustejšiu.
 */
export const BASE_PX_PER_DAY = 16

/** Minimálny rozostup dvoch susedných eventov v px (ochrana proti prekryvu). */
export const MIN_GAP_PX = 120

/** Vnútorné odsadenie osi zľava/sprava v px (aby prvý a posledný bod neboli pri hrane). */
export const TRACK_PAD_X = 120

/** Limity zoomu. */
export const ZOOM_MIN = 0.15
export const ZOOM_MAX = 8
export const ZOOM_DEFAULT = 1

/**
 * Predvolený zoom na mobile. Os je tam podstatne užšia, takže hustota vhodná
 * pre desktop by pôsobila príliš roztiahnuto — tu sa oddiali.
 */
export const ZOOM_DEFAULT_MOBILE = 0.5

/**
 * Breakpoint mobilného zobrazenia.
 * Musí sedieť s `@media (max-width: 899px)` v štýloch — inak by sa
 * správanie (zoom, fade) rozišlo s layoutom.
 */
export const MOBILE_QUERY = '(max-width: 899px)'

/** Násobiteľ na jedno kliknutie tlačidla +/-. */
export const ZOOM_STEP = 1.4

/** Citlivosť Ctrl/Cmd + koliesko myši. */
export const ZOOM_WHEEL_SENSITIVITY = 0.0025
