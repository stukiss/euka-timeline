# Naše spomienky — časová os

Statická Vue 3 stránka s horizontálnou, scrollovateľnou a zoomovateľnou časovou
osou spoločných zážitkov. Beží bez backendu, hostovaná na GitHub Pages.

## Rýchly štart

```sh
npm install
npm run dev
```

Build a lokálny náhľad produkčnej verzie:

```sh
npm run build
npm run preview
```

## Pridanie spomienky

Uprav [`public/data/events.json`](public/data/events.json), fotky ulož do
`public/images/`. Formát je popísaný v [DATA.md](DATA.md).

## Nasadenie na GitHub Pages

V repozitári je workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
ktorý po každom pushi do `master` zbuildí projekt a nasadí `dist/` na GitHub Pages.

Jednorazové nastavenie: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Stránka potom beží na `https://<user>.github.io/euka-timeline/`. Ak premenuješ
repozitár, zmeň `REPO_NAME` v [`vite.config.ts`](vite.config.ts).

## Ovládanie osi

| Akcia | Desktop | Mobil |
| --- | --- | --- |
| Posun po osi | koliesko myši / vodorovný scroll | swipe do strán |
| Zoom | `Ctrl` / `⌘` + koliesko, alebo tlačidlá `+` / `−` | pinch dvoma prstami, alebo tlačidlá |
| Reset zoomu | klik na percentá | klik na percentá |
| Fotky eventu | hover nad krúžkom | ťuknutie na krúžok (otvorí lightbox) |
