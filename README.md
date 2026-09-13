# La Dolce Scoperta 🇮🇹

**Dove andiamo oggi?** is een mobile-first webapp waarmee je op een speelse, visuele manier Italiaanse steden ontdekt.

De app combineert grote fotografie, korte Nederlandstalige verhalen en een lichte Italiaanse interface met persoonlijke voortgang die volledig lokaal in de browser wordt bewaard.

## Wat kun je doen?

- willekeurig een Italiaanse stad ontdekken
- meerdere verhalen en weetjes per stad bekijken
- steden terugvinden op een interactieve kaart van Italië
- je ontdekte steden en regio's verzamelen in **La mia Italia** en het **Passaporto**
- steden op een verlanglijst zetten
- een dagelijkse Italiaanse reis maken
- **Non ci credo!** spelen
- een quiz doen over eerder ontdekte weetjes
- voortgang, streaks en awards verzamelen
- de app als PWA installeren en opnieuw openen zonder account

## Privacy en architectuur

La Dolce Scoperta is bewust eenvoudig opgebouwd.

- React + TypeScript
- TanStack Router / TanStack Start
- lokale projectdata
- browser `localStorage` voor voortgang
- geen accounts of authenticatie
- geen database
- geen externe AI-API's
- geen betaalde API's of API keys nodig

Persoonlijke voortgang blijft op het apparaat van de gebruiker.

## Ontwikkelen

Vereisten:

- Node.js volgens `.nvmrc`
- npm

```sh
npm ci
npm run dev
```

Handige scripts:

```sh
npm run dev
npm run build
npm run lint
npm run format
```

## GitHub Pages

De publieke variant is voorbereid als statische SPA voor GitHub Pages. De workflow in `.github/workflows/pages.yml`:

1. installeert de dependencies met `npm ci`
2. bouwt de TanStack Start-app in SPA-modus
3. maakt een GitHub Pages-compatible `index.html` en `404.html`
4. publiceert de statische build met de officiële GitHub Pages Actions

De repositorynaam wordt tijdens de Pages-build automatisch gebruikt als base path, zodat assets, routes, het webmanifest en de service worker ook werken op een project-URL zoals:

```text
https://<gebruikersnaam>.github.io/<repositorynaam>/
```

Om Pages te activeren: open in GitHub **Settings → Pages** en kies bij **Source** voor **GitHub Actions**.

## PWA

De app bevat een webmanifest en service worker. De PWA-paden zijn relatief aan de locatie waarop de app wordt gepubliceerd, zodat dezelfde code zowel op een eigen domein als onder een GitHub Pages-subpad kan werken.

## Projectstructuur

Belangrijke onderdelen:

```text
src/data/                 lokale stads- en verhaaldata
src/components/           kaart en herbruikbare UI
src/lib/                  voortgangs- en gamelogica
src/hooks/                browser/localStorage-hooks
src/routes/               app-routes en schermen
public/                   PWA-assets en service worker
.github/workflows/        CI en GitHub Pages deployment
```

## Ontwerp

De visuele richting is warm, elegant en licht speels: meer Italiaans reismagazine dan traditioneel spel. Fotografie en typografie krijgen voorrang, met terracotta, olijf, goud en warme papierkleuren als accenten.

---

_Buon viaggio — en elke klik kan een nieuwe Italiaanse ontdekking zijn._
