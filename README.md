# Weather App

A modern, full-featured weather application built with Next.js and PostgreSQL. Search for any location worldwide, view detailed weather forecasts, save location records, and export your data.

## Features

### 🌍 Location Search
- **Smart Autocomplete**: Google Places integration with US bias (customize as needed)
- **Multiple Input Methods**:
  - City, neighborhood, ZIP code, or address search
  - Direct coordinate input (`37.7749,-122.4194`)
  - Current location detection via browser geolocation
- **Fallback Geocoding**: OpenStreetMap + Open-Meteo when Google Places isn't available

### 🌤️ Weather Information
- Real-time weather data for any location
- Current conditions display with key metrics
- 7-day weather forecast
- Temperature graphs and detailed forecasts

### 🗺️ Interactive Map
- Leaflet-based map view showing the searched location
- Zoom and pan controls
- Quick location visualization

### 📺 YouTube Integration
- Popular YouTube videos related to the searched location
- Video thumbnails and channel information
- Direct links to YouTube

### 💾 Location Records (CRUD)
Save and manage location searches with:
- Date ranges (start and end dates)
- Optional notes for each record
- Create, read, update, and delete functionality
- PostgreSQL backend for persistent storage

### 📊 Data Export
Export all saved records in multiple formats:
- **JSON** - For programmatic use
- **CSV** - For spreadsheet analysis
- **XML** - For system integration
- **Markdown** - For documentation

## Tech Stack

- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **Styling**: Tailwind CSS 4, PostCSS
- **Database**: PostgreSQL with Prisma ORM 6.17.1
- **Maps**: Leaflet + React-Leaflet 5
- **API Integration**: Google Places API, Open-Meteo
- **Utilities**: date-fns, zod (validation), lucide-react icons
- **Export**: pdfkit, xmlbuilder2, papaparse

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Places API key (optional, for enhanced location search)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd weatherapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/weatherapp"
# Add Google Places API key if available:
# NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
```

4. **Set up the database**
```bash
npm run prisma:migrate
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (includes database migrations)
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── export/    # Data export endpoints (JSON, CSV, XML, Markdown)
│   │   ├── geocode/   # Geocoding API (fallback search)
│   │   ├── places/    # Google Places integration
│   │   ├── records/   # CRUD endpoints for saved locations
│   │   ├── videos/    # YouTube video search
│   │   └── weather/   # Weather data fetching
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Main application page
│   └── globals.css    # Global styles
├── components/        # React components
│   ├── SearchBar.tsx      # Location search with autocomplete
│   ├── WeatherCard.tsx    # Current weather display
│   ├── Forecast.tsx       # Weather forecast view
│   ├── MapView.tsx        # Leaflet map component
│   ├── MapViewInner.tsx   # Map functionality
│   ├── Records.tsx        # CRUD interface for saved locations
│   ├── InfoButton.tsx     # Information modal
│   └── ...
└── lib/               # Utility functions
    ├── db.ts          # Database utilities
    ├── weather.ts     # Weather API helpers
    └── validation.ts  # Data validation with zod
```

## Database Schema

The application uses a single primary model for location records:

```prisma
model LocationRequest {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  query      String
  name       String
  latitude   Float
  longitude  Float

  startDate  DateTime?
  endDate    DateTime?
  dailyTemps Json?

  notes      String?
}
```

## API Endpoints

### Weather & Location
- `GET /api/weather?lat=<latitude>&lon=<longitude>` - Get weather data
- `POST /api/places/autocomplete` - Search locations with autocomplete
- `GET /api/places/details?placeId=<id>` - Get place coordinates
- `GET /api/geocode?q=<query>` - Fallback geocoding
- `GET /api/videos?q=<query>` - Get YouTube videos

### Records (CRUD)
- `GET /api/records` - List all saved records
- `POST /api/records` - Create new record
- `GET /api/records/[id]` - Get specific record
- `PUT /api/records/[id]` - Update record
- `DELETE /api/records/[id]` - Delete record

### Export
- `GET /api/export?format=json|csv|xml|md` - Export records in specified format

## Configuration Notes

### Google Places API
The app uses Google Places for enhanced location search. To enable:
1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add it to `.env.local` as `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
3. The search is biased toward US locations—modify the `includedRegionCodes` in `SearchBar.tsx` for different regions

### Styling
The app uses Tailwind CSS with a "glass" aesthetic design. The main styles are in:
- `src/app/globals.css` - Global styles and glass effect classes
- Component-level Tailwind classes for responsive design

## Development Notes

- The app uses React 19's latest features and Next.js App Router
- Client components are marked with `"use client"` for interactive features
- All API routes use Next.js App Router conventions
- Type safety enforced with TypeScript throughout
- Form validation handled by Zod schemas

## Deployment

Build the project:
```bash
npm run build
```

Start production server:
```bash
npm start
```

The build process automatically:
1. Generates Prisma client
2. Runs pending database migrations
3. Builds the Next.js application

For cloud deployment (Vercel, AWS, etc.), ensure:
- PostgreSQL database is accessible
- Environment variables are configured
- API keys are securely stored

## Future Enhancements

Potential features for future development:
- Historical weather data visualization
- Weather alerts and notifications
- Favorites/bookmarks for frequently searched locations
- Advanced forecast analytics
- Multi-location comparison
- Weather trends analysis
- Mobile app version

## License

MIT
