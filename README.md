# Swimrun Competition Frontend

Frontend single page application voor de Swimrun Competition resultaten. Deze applicatie toont de uitslagen in een overzichtelijk formaat, met focus op de top 3 en de positie van het favoriete team.

## Vereisten

- Een draaiende backend server (zie [backend README](backend/README.md))
- Een moderne webbrowser
- [Node.js](https://nodejs.org/) (voor http-server)

## Hoe te draaien

1. Zorg dat de backend server draait op http://localhost:3000

2. Start de frontend development server:
   ```bash
   npx http-server .
   ```

De frontend is nu beschikbaar op http://localhost:8080

## Features

- Toont altijd de top 3 teams
- Toont teams rond het favoriete team (max 3 voor en 3 na)
- Gebruikt "..." om weggelaten teams aan te duiden
- Laat gebruikers hun favoriete team kiezen
- Slaat voorkeuren op in local storage
- Link naar originele Google Sheet

## Development

De frontend is een pure HTML/CSS/JavaScript applicatie zonder build step. Wijzigingen in de bestanden zijn direct zichtbaar na een page refresh.

## Bronnen

- Node.js. (z.d.). *Installation Guide*. Geraadpleegd mei 2025 van [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)
