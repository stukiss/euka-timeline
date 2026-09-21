# Dátový súbor — `public/data/events.json`

Toto je jediný súbor, ktorý treba upravovať pri pridávaní spomienok.
Leží v `public/`, takže sa kopíruje do buildu tak, ako je — po commitnutí zmeny
sa nasadí nová verzia bez akéhokoľvek zásahu do kódu.

## Formát

```json
{
  "events": [
    {
      "date": "2023-05-14",
      "title": "Prvé rande v kaviarni",
      "images": ["images/kaviaren-1.jpg", "images/kaviaren-2.jpg"]
    }
  ]
}
```

| Pole | Povinné | Typ | Popis |
| --- | --- | --- | --- |
| `date` | áno | string | Dátum vo formáte `YYYY-MM-DD` (napr. `2024-07-18`). Parsuje sa striktne — `2024-13-01` alebo `2024-02-31` sa odmietne. |
| `title` | áno | string | Názov eventu zobrazený na osi. |
| `images` | nie | string[] | Cesty k obrázkom **relatívne k priečinku `public/`**, bez úvodnej lomky. Vynechaj pole (alebo daj `[]`), ak event nemá fotky. |

### Poradie záznamov

Nezáleží na ňom — aplikácia si eventy vždy zoradí podľa dátumu vzostupne
(najstarší vľavo, najnovší vpravo).

### Obrázky

Fotky ulož do `public/images/`. V JSON-e na ne potom odkazuješ ako
`"images/nazov-suboru.jpg"`. Aplikácia si sama predradí správnu základnú cestu,
takže to funguje aj na GitHub Pages v podadresári.

Ukážkové `.svg` súbory v `public/images/` sú len placeholdery — pokojne ich zmaž
a nahraď vlastnými `.jpg` / `.png` / `.webp`.

Z každého eventu sa v náhľade po hoveri zobrazia najviac 3 fotky, zvyšok sa
skryje za `+N`; po kliknutí sa otvorí lightbox so všetkými.

### Čo sa stane pri chybe

Aplikácia nikdy nespadne kvôli zlému záznamu:

- neplatný alebo chýbajúci `date` → záznam sa preskočí, dôvod sa vypíše do konzoly prehliadača,
- chýbajúci `title` → to isté,
- prázdne pole `events` → zobrazí sa pokojná prázdna obrazovka,
- nedostupný alebo pokazený súbor → v paneli osi sa ukáže chybová hláška.

## Ladenie hustoty osi

Konštanty sú v [`src/config/timeline.ts`](src/config/timeline.ts):

| Konštanta | Význam |
| --- | --- |
| `BASE_PX_PER_DAY` | Koľko pixelov je jeden deň pri zoome 100 %. Väčšie číslo = redšia os. |
| `MIN_GAP_PX` | Minimálny rozostup dvoch susedných bodov, aby sa popisky neprekrývali. |
| `ZOOM_MIN` / `ZOOM_MAX` | Limity zoomu. |
| `ZOOM_STEP` | Násobiteľ na jedno kliknutie `+` / `−`. |
