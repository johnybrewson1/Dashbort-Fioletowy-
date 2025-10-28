# Wdrożenie na Netlify - Dream Post Forge

## Przygotowanie

### 1. Zmienne środowiskowe wymagane w Netlify:
Dodaj następujące zmienne w Netlify Dashboard → Site settings → Environment variables:

```
VITE_BACKEND_URL=https://ricky-endotrophic-therese.ngrok-free.dev
```

### 2. Supabase URL (opcjonalnie):
Jeśli chcesz zmienić Supabase URL lub key, dodaj w Netlify:
- `VITE_SUPABASE_URL` = `https://spimwaixjxkjauikpurc.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (twój klucz anon)

**Uwaga:** Aplikacja ma domyślne wartości dla Supabase, więc te zmienne nie są wymagane jeśli używasz domyślnej konfiguracji.

## Metoda 1: Wdrożenie przez Netlify UI (Zalecane)

### Kroki:

1. **Zaloguj się na Netlify**
   - Wejdź na https://app.netlify.com
   - Zaloguj się lub utwórz konto

2. **Nowy projekt z Git**
   - Kliknij "Add new site" → "Import an existing project"
   - Wybierz GitHub jako provider
   - Autoryzuj dostęp do GitHub (jeśli potrzebne)
   - Znajdź i wybierz repozytorium `dream-post-forge-84-main`

3. **Konfiguracja build**
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `18` (lub wyższy)

4. **Zmienne środowiskowe**
   - Przed kliknięciem "Deploy site", rozwiń "Show advanced"
   - Kliknij "New variable"
   - Dodaj `VITE_BACKEND_URL` = `https://ricky-endotrophic-therese.ngrok-free.dev`
   - Dodaj inne zmienne z `.env` (Supabase URL, klucze, etc.)

5. **Wdróż**
   - Kliknij "Deploy site"
   - Poczekaj na zakończenie builda

## Metoda 2: Wdrożenie przez Netlify CLI

### Kroki:

1. **Zainstaluj Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Zaloguj się**
   ```bash
   netlify login
   ```

3. **Połącz z istniejącym projektem lub utwórz nowy**
   ```bash
   netlify init
   ```
   - Wybierz "Create & configure a new site" lub "Link this directory to an existing site"

4. **Ustaw zmienne środowiskowe**
   ```bash
   netlify env:set VITE_BACKEND_URL "https://ricky-endotrophic-therese.ngrok-free.dev"
   ```

5. **Wdróż na produkcję**
   ```bash
   netlify deploy --prod
   ```

## Weryfikacja wdrożenia

Po wdrożeniu:

1. **Sprawdź URL**
   - Aplikacja będzie dostępna pod adresem: `https://your-site-name.netlify.app`
   - URL będzie widoczny w Netlify Dashboard

2. **Przetestuj aplikację**
   - Otwórz URL w przeglądarce
   - Zaloguj się
   - Przetestuj funkcjonalność tworzenia postów

## Aktualizacje

Każdy push do brancha `main` automatycznie wdraża nową wersję:

```bash
git add .
git commit -m "Opis zmian"
git push origin main
```

Netlify automatycznie uruchomi build i wdroży nową wersję.

## Rozwiązywanie problemów

### Błąd budowania
- Sprawdź logi w Netlify Dashboard → Deploys → wybierz deploy → Build log
- Upewnij się, że wszystkie zmienne środowiskowe są ustawione
- Sprawdź czy `npm run build` działa lokalnie

### Błędy runtime
- Sprawdź konsolę przeglądarki (F12)
- Sprawdź Netlify Function logs
- Upewnij się, że wszystkie URL-e API są dostępne

### Problemy z routingiem
- Aplikacja ma przekierowania w `netlify.toml` i `public/_redirects`
- Jeśli strony 404, sprawdź te pliki

## Ustawienia domeny

1. **Zmień nazwę strony**
   - Netlify Dashboard → Site settings → Site information
   - Kliknij "Change site name"
   - Wprowadź nową nazwę

2. **Dodaj własną domenę**
   - Netlify Dashboard → Domain management
   - Kliknij "Add custom domain"
   - Wprowadź swoją domenę i postępuj zgodnie z instrukcjami

## Ciągłe wdrażanie

Netlify automatycznie:
- Wykrywa zmiany w branchu `main`
- Uruchamia build
- Wdraża nową wersję
- Powiadamia o statusie (opcjonalnie przez email)

Możesz skonfigurować:
- Branche preview (dla pull requestów)
- Notyfikacje
- Webhooks
