# 🎨 Vertex AI Setup dla Dream Post Forge

## 📋 Czego potrzebujesz:

### 1. Google Cloud Project ID
- Wejdź na: https://console.cloud.google.com
- Skopiuj PROJECT ID (nie nazwę!)
- Przykład: `my-project-123456`

### 2. Włącz Vertex AI API
```bash
# Opcja 1: Przez UI
1. https://console.cloud.google.com/apis/library
2. Wyszukaj: "Vertex AI API"
3. Kliknij "ENABLE"

# Opcja 2: Przez CLI
gcloud services enable aiplatform.googleapis.com
```

### 3. Utwórz Service Account
1. https://console.cloud.google.com/iam-admin/serviceaccounts
2. CREATE SERVICE ACCOUNT
3. Nazwa: `vertex-ai-service`
4. Role: `Vertex AI User`
5. CREATE KEY → JSON
6. Pobierz plik JSON

---

## 🔧 Konfiguracja w Make.com

### Scenariusz: Image Generation

#### Moduł 1: Webhook (Trigger)
- URL: `https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl`
- Otrzymuje: `image_prompt`, `image_instructions`, `user_id`, `record_id`

#### Moduł 2: HTTP Request (Vertex AI)
**URL:**
```
https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/imagegeneration@006:predict
```

**Method:** POST

**Headers:**
```json
{
  "Authorization": "Bearer {{ACCESS_TOKEN}}",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "instances": [
    {
      "prompt": "{{image_prompt}}. {{image_instructions}}"
    }
  ],
  "parameters": {
    "sampleCount": 1,
    "aspectRatio": "1:1",
    "negativePrompt": "blurry, low quality, distorted",
    "guidanceScale": 7.5,
    "safetySetting": "block_some"
  }
}
```

#### Moduł 3: Parse JSON
- Parse response z Vertex AI

#### Moduł 4: Base64 Decode
- Dekoduj `predictions[0].bytesBase64Encoded`

#### Moduł 5: Supabase - Upload File
- **Bucket:** `post-images`
- **Filename:** `{{timestamp}}-{{record_id}}.png`
- **File:** Zdekodowany obraz

#### Moduł 6: Supabase - Update Row
- **Table:** `posts`
- **Row ID:** `{{record_id}}`
- **Fields:**
  - `image_url`: Public URL z Supabase Storage

#### Moduł 7: Webhook Response
```json
{
  "success": true,
  "image_url": "{{public_url}}"
}
```

---

## 🔑 Jak zdobyć Access Token

### Opcja 1: Service Account (Zalecane)

1. **Zainstaluj Google Cloud SDK:**
```bash
brew install google-cloud-sdk
```

2. **Uwierzytelnij się:**
```bash
gcloud auth activate-service-account --key-file=/path/to/your-key.json
```

3. **Pobierz token:**
```bash
gcloud auth print-access-token
```

4. **Użyj w Make.com:**
- Skopiuj token
- Wklej w header Authorization
- Token ważny przez 1 godzinę

### Opcja 2: OAuth 2.0 w Make.com

1. W Make.com dodaj Google Cloud Connection
2. Użyj OAuth 2.0
3. Scope: `https://www.googleapis.com/auth/cloud-platform`

---

## 🎨 Dostępne Modele Imagen

| Model | Endpoint | Jakość | Cena |
|-------|----------|--------|------|
| Imagen 2 | `imagegeneration@002` | Dobra | $0.02 |
| Imagen 2.1 | `imagegeneration@005` | Lepsza | $0.02 |
| Imagen 3 | `imagegeneration@006` | Najlepsza | $0.04 |
| Imagen 3 Fast | `imagegeneration-fast@001` | Szybka | $0.02 |

**Rekomendacja:** Imagen 3 (`imagegeneration@006`)

---

## 📊 Parametry Vertex AI

### Prompt Guidelines:
```
Dobry prompt:
"A professional photograph of a modern office space, bright natural lighting, 
minimalist design, 4K quality, architectural photography style"

Zły prompt:
"office"
```

### Parametry:
- **aspectRatio:** `"1:1"`, `"4:3"`, `"16:9"`, `"9:16"`
- **guidanceScale:** `7-10` (wyższe = bardziej zgodne z promptem)
- **sampleCount:** `1-8`
- **negativePrompt:** Co unikać (np. "blurry, low quality")

---

## 🧪 Test

### Test w Make.com:
1. Uruchom scenariusz ręcznie
2. Podaj testowy prompt: "A beautiful sunset over mountains"
3. Sprawdź logi każdego modułu
4. Sprawdź czy obraz został zapisany w Supabase

### Test z aplikacji:
1. Zaloguj się na https://dream-post-forge.netlify.app
2. Otwórz post
3. Kliknij "Regenerate Image"
4. Wpisz instrukcje: "Make it more colorful"
5. Sprawdź czy obraz się zmienia

---

## 💰 Koszty

### Vertex AI Imagen:
- ~$0.04 za obraz (1024x1024) - Imagen 3
- ~$0.02 za obraz (1024x1024) - Imagen 2/3 Fast

### Limity:
- 60 żądań/minutę
- Max resolution: 1536x1536

### Quota:
- Sprawdź: https://console.cloud.google.com/iam-admin/quotas

---

## 🐛 Troubleshooting

### "Permission denied"
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### "API not enabled"
```bash
gcloud services enable aiplatform.googleapis.com
```

### "Invalid authentication credentials"
- Sprawdź czy access token nie wygasł (ważny 1h)
- Wygeneruj nowy: `gcloud auth print-access-token`

---

## ✅ Checklist

- [ ] Google Cloud Project utworzony
- [ ] Vertex AI API włączone
- [ ] Service Account utworzony z kluczem JSON
- [ ] Make.com scenariusz skonfigurowany
- [ ] HTTP moduł z Vertex AI dodany
- [ ] Supabase upload skonfigurowany
- [ ] Test zakończony sukcesem

---

## 🚀 Gotowe!

Gdy wszystko jest skonfigurowane, aplikacja będzie automatycznie generować obrazy przez Vertex AI!

**Link do aplikacji:** https://dream-post-forge.netlify.app

