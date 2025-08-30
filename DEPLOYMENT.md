# Wdrożenie na Netlify - Dream Post Forge

## Opis projektu
Dream Post Forge to aplikacja React z Vite do tworzenia postów z wykorzystaniem AI. Aplikacja używa Supabase jako backend i jest zbudowana z shadcn/ui komponentami.

## Wdrożenie na Netlify

### Opcja 1: Przez Netlify UI (Zalecane)

1. **Przygotuj repozytorium**
   - Upewnij się, że wszystkie zmiany są commitowane i wypchnięte na GitHub
   - Projekt powinien mieć plik `netlify.toml` w głównym katalogu

2. **Zaloguj się na Netlify**
   - Wejdź na [netlify.com](https://netlify.com)
   - Zaloguj się lub utwórz konto

3. **Wdróż projekt**
   - Kliknij "New site from Git"
   - Wybierz GitHub jako provider
   - Wybierz repozytorium `dream-post-forge-84-main`
   - Ustaw branch na `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Kliknij "Deploy site"

### Opcja 2: Przez Netlify CLI

1. **Zainstaluj Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Zaloguj się**
   ```bash
   netlify login
   ```

3. **Wdróż projekt**
   ```bash
   netlify deploy --prod
   ```

## Konfiguracja środowiska

### Zmienne środowiskowe
Jeśli aplikacja używa zmiennych środowiskowych (np. klucze API), dodaj je w:
- Netlify Dashboard → Site settings → Environment variables

### Domena
- Po wdrożeniu otrzymasz URL w formacie: `https://random-name.netlify.app`
- Możesz zmienić nazwę w Site settings → Site information → Site name
- Możesz dodać własną domenę w Domain management

## Rozwiązywanie problemów

### Błąd budowania
- Sprawdź czy `npm run build` działa lokalnie
- Sprawdź logi budowania w Netlify Dashboard
- Upewnij się, że wszystkie zależności są w `package.json`

### Problemy z routingiem
- Aplikacja ma skonfigurowane przekierowania w `netlify.toml` i `public/_redirects`
- Jeśli strony nie ładują się po odświeżeniu, sprawdź te pliki

### Problemy z zależnościami
- Użyj `--legacy-peer-deps` jeśli występują konflikty zależności
- Sprawdź czy Node.js wersja jest kompatybilna (projekt używa Node 18)

## Struktura plików wdrożenia

```
dream-post-forge-84-main/
├── dist/                    # Katalog budowania (generowany)
├── public/                  # Pliki statyczne
│   └── _redirects          # Przekierowania Netlify
├── src/                     # Kod źródłowy
├── netlify.toml            # Konfiguracja Netlify
├── package.json            # Zależności
└── vite.config.ts          # Konfiguracja Vite
```

## Linki
- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router with Netlify](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)
