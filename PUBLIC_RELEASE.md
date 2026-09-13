# Publieke release naar een nieuwe GitHub-repository

Deze repository is zo ingericht dat dezelfde `main` zonder hardcoded repositorynaam op GitHub Pages kan draaien. De Pages-build leest de nieuwe repositorynaam automatisch uit `GITHUB_REPOSITORY`.

## Aanbevolen: publiceer een schone snapshot

Als de bronrepository privé is, is het meestal beter om alleen de actuele bestanden te publiceren en niet automatisch de volledige private Git-geschiedenis mee te nemen.

1. Zorg dat je lokale kopie op de definitieve `main` staat en up-to-date is.
2. Maak een aparte map voor de publieke snapshot.
3. Kopieer de inhoud van `main` naar die map, maar neem de bestaande `.git`-map niet mee.
4. Initialiseer daar een nieuwe repository met `main` als standaardbranch.
5. Commit de snapshot als eerste publieke commit.
6. Maak op GitHub een lege **public** repository aan, bij voorkeur zonder automatisch toegevoegde README, `.gitignore` of license.
7. Zodra **Settings → Pages** beschikbaar is, kies je bij **Source** voor **GitHub Actions**.
8. Voeg de nieuwe repository toe als `origin` en push `main`.
9. De workflow `.github/workflows/pages.yml` bouwt en publiceert de app daarna automatisch.

Een mogelijke commandoreeks is:

```sh
# in een verse kopie/map met alleen de bestanden uit de definitieve main
rm -rf .git
git init -b main
git add .
git commit -m "Initial public release"
git remote add origin https://github.com/<gebruikersnaam>/<nieuwe-repository>.git
git push -u origin main
```

Op Windows kun je de bestaande `.git`-map ook gewoon via Verkenner verwijderen voordat je `git init -b main` uitvoert.

### Als Pages pas na de eerste push geactiveerd kan worden

Dat is geen probleem. De eerste `Deploy GitHub Pages`-run kan dan eenmalig stoppen bij de Pages-configuratie. Kies daarna **Settings → Pages → Source → GitHub Actions** en start via **Actions → Deploy GitHub Pages → Run workflow** de deployment opnieuw. De workflow ondersteunt dit expliciet via `workflow_dispatch`.

De Pages-workflow draait alleen wanneer de repository publiek is. Daardoor blijft de private bronrepository bruikbaar zonder mislukte Pages-deployments bij iedere push.

## Als de volledige geschiedenis wél openbaar mag worden

Dan kun je in plaats daarvan de bestaande repository clonen, de remote vervangen door de nieuwe publieke repository en `main` pushen. Houd er rekening mee dat daarmee ook eerdere commits, auteursmetadata en bestanden die alleen in oudere commits voorkwamen openbaar kunnen worden.

## Wat automatisch meeverhuist

De volgende onderdelen zitten in de repository zelf en hoeven in de nieuwe repository niet opnieuw handmatig te worden opgebouwd:

- TanStack Start SPA-configuratie voor statische hosting
- dynamische GitHub Pages-basepath op basis van de repositorynaam
- router-basepath voor project-Pages
- PWA-manifest met relatieve paden
- service worker die binnen het Pages-subpad blijft
- GitHub Actions Pages-workflow
- CI-workflow
- `.gitignore` voor lokale environment- en secretbestanden

## Enige repository-instelling na het kopiëren

GitHub Pages zelf is een repository-instelling en reist niet mee met Git. De enige instelling die je in de nieuwe publieke repository eenmalig moet controleren is:

**Settings → Pages → Source → GitHub Actions**

Daarna wordt iedere push naar `main` automatisch opnieuw gepubliceerd.
