# 🚀 Instrukcja Konfiguracji Wskaźnika Ładowania

## 📋 Wymagania
- Tabela `jobs` w Supabase (już masz!)
- Webhook Make.com
- Dane konfiguracyjne Supabase

## 🔧 Krok 1: Konfiguracja Supabase

### Pobierz dane z Supabase:
1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Przejdź do **Settings** → **API**
4. Skopiuj:
   - **Project URL** (np. `https://xyz.supabase.co`)
   - **anon public** key (zaczyna się od `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 🔧 Krok 2: Konfiguracja Make.com

### Utwórz webhook:
1. Przejdź do [Make.com](https://make.com)
2. Utwórz nowy scenario
3. Dodaj moduł **Webhooks** → **Custom webhook**
4. Skopiuj URL webhooka (np. `https://hook.eu1.make.com/abc123...`)

### Konfiguracja webhooka Make.com:
```json
{
  "trigger": "Custom webhook",
  "actions": [
    {
      "module": "Supabase",
      "action": "Insert a row",
      "table": "jobs",
      "data": {
        "status": "processing",
        "content_type": "{{body.user_input}}",
        "content_data": "{{body}}"
      }
    }
  ],
  "response": {
    "job_id": "{{id}}",
    "message": "Job created successfully"
  }
}
```

## 🔧 Krok 3: Testowanie

### 1. Otwórz plik `loading-indicator.html` w przeglądarce

### 2. Wprowadź konfigurację:
- **Supabase URL**: Twój Project URL
- **Supabase Anon Key**: Twój anon key
- **Make.com Webhook URL**: Twój webhook URL

### 3. Kliknij "Zapisz Konfigurację"

### 4. Przetestuj połączenia:
- **Test Połączenia Supabase** - sprawdza czy łączysz się z bazą
- **Sprawdź Tabelę Jobs** - pokazuje aktualne dane
- **Symuluj Zadanie** - tworzy testowe zadanie bez webhooka

## 🧪 Krok 4: Test Kompletny

### 1. Wprowadź dane w formularzu
### 2. Kliknij "Wyślij"
### 3. System powinien:
   - Wysłać dane do Make.com
   - Utworzyć rekord w tabeli `jobs` ze statusem `processing`
   - Rozpocząć polling co 3 sekundy
   - Pokazać loader z Job ID
   - Po zmianie statusu na `completed` - pokazać sukces

## 🔍 Debugowanie

### Sprawdź konsolę przeglądarki (F12):
```javascript
// Sprawdź połączenie Supabase
const { data, error } = await supabase.from('jobs').select('*');

// Sprawdź status konkretnego zadania
const { data, error } = await supabase
  .from('jobs')
  .select('status')
  .eq('id', 'your-job-id')
  .single();
```

### Sprawdź Make.com:
- Czy webhook otrzymuje dane?
- Czy tworzy rekord w Supabase?
- Czy zwraca prawidłowy `job_id`?

## 📊 Struktura tabeli `jobs`

Twoja tabela ma już prawidłową strukturę:
```sql
-- Sprawdź strukturę
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'jobs';
```

## 🎯 Oczekiwane wartości statusu:
- `processing` - zadanie w trakcie
- `completed` - zadanie ukończone
- `failed` - błąd zadania

## 🚨 Rozwiązywanie problemów

### Problem: "Błąd połączenia z Supabase"
- Sprawdź URL i klucz API
- Sprawdź czy tabela `jobs` istnieje
- Sprawdź uprawnienia RLS (Row Level Security)

### Problem: "Nie otrzymano job_id z webhooka"
- Sprawdź czy Make.com zwraca JSON z `job_id`
- Sprawdź URL webhooka
- Sprawdź czy Make.com tworzy rekord w Supabase

### Problem: "Błąd podczas sprawdzania statusu"
- Sprawdź czy rekord został utworzony w tabeli `jobs`
- Sprawdź czy `id` w odpowiedzi webhooka pasuje do `id` w tabeli

## 📝 Przykład konfiguracji Make.com

### Webhook Trigger:
```
URL: https://hook.eu1.make.com/abc123...
Method: POST
Content-Type: application/json
```

### Supabase Action:
```
Table: jobs
Data:
{
  "status": "processing",
  "content_type": "{{body.user_input}}",
  "content_data": "{{body}}"
}
```

### Response:
```json
{
  "job_id": "{{id}}",
  "message": "Job created successfully"
}
```

## ✅ Checklist gotowości:
- [ ] Supabase URL skonfigurowany
- [ ] Supabase Anon Key skonfigurowany  
- [ ] Make.com Webhook URL skonfigurowany
- [ ] Test połączenia Supabase przechodzi
- [ ] Webhook Make.com zwraca `job_id`
- [ ] Rekord tworzy się w tabeli `jobs`
- [ ] Polling działa i wykrywa zmiany statusu
- [ ] UI pokazuje odpowiednie komunikaty

## 🎉 Gotowe!
Po skonfigurowaniu wszystkich elementów, system powinien działać płynnie:
1. Formularz wysyła dane → Make.com
2. Make.com tworzy zadanie → Supabase
3. Frontend polluje status → Supabase
4. UI aktualizuje się automatycznie


