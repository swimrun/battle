# Build stage for Node.js application
FROM node:22-alpine AS nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Set environment based on build arg
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Create .env file from example if production doesn't exist
RUN if [ ! -f .env.production ]; then \
    cp .env.example .env; \
    else \
    cp .env.production .env; \
    fi

# Final stage with Nginx
FROM nginx:alpine

# Install Certbot and its Nginx plugin
RUN apk add --no-cache certbot certbot-nginx

# Create directories for SSL certificates
RUN mkdir -p /var/www/certbot && \
    mkdir -p /etc/letsencrypt

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy Node.js application from the build stage
COPY --from=nodejs /app /app

# Install Node.js in the final image
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Expose ports for HTTP and HTTPS
EXPOSE 80 443

# Start both Nginx and Node.js
COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"] 