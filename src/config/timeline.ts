/**
 * Ladiace konštanty timeline.
 * Toto je jediné miesto, kde sa upravuje hustota a limity zoomu.
 */

/**
 * Koľko pixelov zodpovedá jednému dňu pri zoome = 1.
 * 1.2 px/deň ≈ týždeň 8 px, mesiac 36 px, rok 438 px.
 * Zvýš pre redšiu (roztiahnutejšiu) os, zníž pre hustejšiu.
 */
export const BASE_PX_PER_DAY = 1.2

/** Minimálny rozostup dvoch susedných eventov v px (ochrana proti prekryvu). */
export const MIN_GAP_PX = 120

/** Vnútorné odsadenie osi zľava/sprava v px (aby prvý a posledný bod neboli pri hrane). */
export const TRACK_PAD_X = 120

/** Limity zoomu. */
export const ZOOM_MIN = 0.15
export const ZOOM_MAX = 8
export const ZOOM_DEFAULT = 1

/** Násobiteľ na jedno kliknutie tlačidla +/-. */
export const ZOOM_STEP = 1.4

/** Citlivosť Ctrl/Cmd + koliesko myši. */
export const ZOOM_WHEEL_SENSITIVITY = 0.0025
