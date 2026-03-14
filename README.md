<<<<<<< HEAD
# ServiceApp
=======
# ServiceApp – React + Vite + TypeScript

Responsives Mockup mit vollständiger TypeScript-Typisierung,
vorbereitet für die Anbindung an ein **Spring Boot Backend**.

## 🚀 Setup

```bash
npm install
npm run dev       # → http://localhost:5173
```

## 📁 Projektstruktur

```
src/
├── main.tsx              # Einstiegspunkt
├── App.tsx               # Mobile / Desktop Weiche (Breakpoint: 768px)
├── config.ts             # Kategorien, Status, Nav, Breakpoint
│
├── types/index.ts        # Alle Interfaces – spiegeln Spring Boot DTOs wider
│
├── api/
│   ├── client.ts         # HTTP-Client (fetch, Auth-Header, Error-Handling)
│   ├── offers.ts         # offersApi
│   ├── bookings.ts       # bookingsApi + favoritesApi
│   └── mock.ts           # Typed Mock-Daten (VITE_USE_MOCK=true)
│
├── hooks/index.ts        # useOffers, useBookings, useFavorites, ...
│
├── components/
│   ├── Shared.tsx        # ServiceImage, Stars, Badge, Tag, DetailContent
│   └── OfferCard.tsx     # Angebotskarte
│
└── layouts/
    ├── MobileLayout.tsx  # Phone-Frame, Bottom-Nav, Bottom-Sheets
    └── DesktopLayout.tsx # Sidebar, Topbar, Right-Panel
```

## 🔌 Spring Boot anbinden

**1. `.env.local` anpassen:**
```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api
```

**2. CORS im Backend aktivieren:**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

**3. Erwartete Endpoints:**

| Method | Endpoint            | Beschreibung          |
|--------|---------------------|-----------------------|
| GET    | /api/offers         | Angebote (?category=) |
| GET    | /api/offers/{id}    | Einzelnes Angebot     |
| GET    | /api/bookings       | Meine Buchungen       |
| POST   | /api/bookings       | Buchen {offerId}      |
| DELETE | /api/bookings/{id}  | Stornieren            |
| GET    | /api/favorites      | Favoriten-IDs         |
| POST   | /api/favorites/{id} | Hinzufügen            |
| DELETE | /api/favorites/{id} | Entfernen             |

**4. Typen automatisch generieren (optional):**
```bash
npx openapi-generator-cli generate \
  -i http://localhost:8080/v3/api-docs \
  -g typescript-fetch \
  -o src/api/generated
```

## 🛠 Befehle

```bash
npm run dev        # Dev-Server
npm run typecheck  # TypeScript prüfen
npm run build      # Produktions-Build → dist/
```
>>>>>>> 764ab13 (initial commit)
