# Swimrun Backend Service

Backend service for the Swimrun Competition results, providing API endpoints for team and nation rankings.

## Tech Stack

- Node.js 22
- Express.js
- Nginx (reverse proxy)
- Let's Encrypt SSL
- Google Sheets API
- Swagger/OpenAPI for documentation
- Jest for testing

## Prerequisites

- Node.js 22 or higher
- Docker (for containerized deployment)
- Google Sheets API credentials (for production)
- Domain name pointing to your server
- Port 80 and 443 open on your server

## Environment Setup

The application uses different environment files for different purposes:

1. `.env.example` - Template file showing required environment variables
2. `.env.development` - Local development settings
3. `.env.production` - Production deployment settings

To set up your environment:

1. For local development:
```bash
cp .env.example .env.development
# Edit .env.development with your local settings
```

2. For production:
```bash
cp .env.example .env.production
# Edit .env.production with your production settings
```

Required environment variables:
- `NODE_ENV`: Environment name (development, test, staging, production)
- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: URL of the frontend application (for CORS)
- `GOOGLE_SHEET_ID`: ID of the Google Sheet containing competition data

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Docker Deployment

### Local Development (ARM64/M1/M2)

For local development on ARM-based machines (M1/M2 Macs):

```bash
# Build the image
docker build -t swimrun-backend:local .

# Run the container
docker run -p 80:80 -p 443:443 swimrun-backend:local
```

### Production Deployment (AMD64)

For production deployment on x86/amd64 servers:

```bash
# Check if builder exists
docker buildx ls

# If builder doesn't exist, create it
docker buildx create --name mybuilder --use

# If builder exists, use it
docker buildx use mybuilder

# Build and push for AMD64 platform
docker buildx build --platform linux/amd64 \
  -t bartvanderwal/swimrun-backend:latest \
  --push .

# Run the container in detached mode
docker run -d --name swimrun-backend \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  bartvanderwal/swimrun-backend:latest

# View logs
docker logs -f swimrun-backend

# Stop the container
docker stop swimrun-backend

# Remove the container
docker rm swimrun-backend
```

### SSL Certificate Setup

The container automatically handles SSL certificate setup and renewal using Let's Encrypt. To set up SSL:

1. Make sure your domain (api.battle.swimrun.group) points to your server's IP address
2. Ensure ports 80 and 443 are open on your server
3. Run the container with the volume mounts for SSL certificates
4. The container will automatically obtain and configure SSL certificates

To manually renew certificates:
```bash
docker exec swimrun-backend certbot renew
```

### Updating the Container

When a new version is pushed to Docker Hub, you can update the container with:

```bash
# Pull the latest image (force pull)
docker pull bartvanderwal/swimrun-backend:latest

# Stop and remove the old container
docker stop swimrun-backend
docker rm swimrun-backend

# Start a new container with the latest image
docker run -d --name swimrun-backend \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  bartvanderwal/swimrun-backend:latest
```

## API Endpoints

### GET /api/competition-data

Returns team rankings data including positions and times.

### GET /api/nation-summary

Returns nation summary data with total participants and rankings.

## API Documentation

Swagger documentation is available at `/api-docs` when the server is running.

## License

ISC
