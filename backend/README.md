# Swimrun Competition Backend

Backend service voor de Swimrun Competition resultaten. Deze service haalt de ruwe competitie data op uit Google Sheets en serveert deze via een REST API endpoint. De data wordt gebruikt door de frontend single page application om een gefilterde weergave te tonen van de uitslagen, met focus op de top 3 en de positie van het favoriete team.

## Projectstructuur

```
battle/backend/
├── server.js        # Main application file
├── test-data.json   # Test data voor development
├── package.json     # Dependencies en scripts
└── README.md        # Deze documentatie
```

## Vereisten

- [Node.js](https://nodejs.org/) (versie 20 of hoger)
- [npm](https://www.npmjs.com/) (komt met Node.js)
- [Docker](https://www.docker.com/get-started) (optioneel, voor container deployment)

## Hoe te draaien

### Lokaal Development

1. Installeer dependencies:
   ```bash
   npm install
   ```

2. Maak een `.env` bestand aan met de benodigde variabelen:
   ```bash
   cp .env.example .env
   ```

3. Vul de volgende variabelen in in je `.env` bestand:
   ```
   GOOGLE_SHEET_ID=12x2eCsVncoIHADVXxEpDAzDU4ZlnG10HK2RmWx0wCBQ
   PORT=3000
   NODE_ENV=development
   ```

4. Start de server:
   ```bash
   # Productie mode
   npm start

   # Test mode (gebruikt test-data.json)
   npm run start:test
   ```

De server draait nu op `http://localhost:3000`

### Met Docker

#### Container starten

```bash
docker run -d \
  --name swimrun-backend \
  -p 3000:3000 \
  -e GOOGLE_SHEET_ID=12x2eCsVncoIHADVXxEpDAzDU4ZlnG10HK2RmWx0wCBQ \
  bartvanderwal/swimrun-backend:latest
```

#### Container updaten voor nieuwe applicatie

```bash
# Build nieuwe image
docker build -t bartvanderwal/swimrun-backend:latest .

# Push naar Docker Hub
docker push bartvanderwal/swimrun-backend:latest
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `GOOGLE_SHEET_ID`: ID van de Google Sheet
- `NODE_ENV`: 'test' voor test mode, anders productie mode

## API Endpoints

- `GET /api/competition-data`: Haalt de volledige competitie data op uit Google Sheets. De data bevat alle teams met hun posities, totale tijden en tijden per persoon. Deze data wordt door de frontend single page application gebruikt om een gefilterde weergave te maken die focust op de top 3 en de positie van het favoriete team.

## Development

### Tests uitvoeren

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Bijdragen

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## Bronnen

- Microsoft Azure DevOps. (z.d.). *Create a README for your project*. Geraadpleegd mei 2025 van [https://learn.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops](https://learn.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops)
- Node.js. (z.d.). *Installation Guide*. Geraadpleegd mei 2025 van [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)
- Docker. (z.d.). *Documentation*. Geraadpleegd mei 2025 van [https://docs.docker.com/](https://docs.docker.com/)
- Google. (z.d.). *Sheets API Documentation*. Geraadpleegd mei 2025 van [https://developers.google.com/sheets/api/guides/concepts](https://developers.google.com/sheets/api/guides/concepts)