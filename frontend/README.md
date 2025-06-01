# My Swimrun Friendship Battle 2025 Frontend

Dit is de frontend voor de My Swimrun Friendship Battle 2025 competitie. Het toont team rankings en nation samenvattingen in een moderne React applicatie.

## Technische Stack

- React 18
- TypeScript
- Vite
- Modern CSS

## Ontwikkeling

### Vereisten

- Node.js (v16 of hoger)
- npm (v7 of hoger)

### Installatie

1. Installeer dependencies:
```bash
npm install
```

2. Maak een `.env` bestand aan in de frontend directory:
```bash
VITE_API_URL=http://localhost:3000
```

### Development Server Starten

```bash
npm run dev
```

Dit start de development server op `http://localhost:5173`.

### Productie Build Maken

```bash
npm run build
```

Dit maakt een productie build in de `dist` directory.

### Productie Build Preview

```bash
npm run preview
```

Dit toont een preview van de productie build lokaal.

## Project Structuur

- `src/components/` - React componenten
- `src/services/` - API services
- `src/types/` - TypeScript type definities
- `src/App.css` - Hoofd styles

## Functionaliteiten

- Team rankings met podium highlighting
- Nation samenvatting
- Favoriete team selectie
- Gefilterde weergave van teams rond je favoriete team
- Responsive design

## Backend Integratie

De frontend verwacht een backend server op de URL gespecificeerd in `VITE_API_URL` (standaard: `http://localhost:3000`).

## Licentie

MIT
