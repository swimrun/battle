#!/bin/sh

# Create certbot directory if it doesn't exist
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot

# Start Node.js application in the background
echo "Starting Node.js..."
cd /app
npm start &
NODE_PID=$!

# Start Nginx
echo "Starting Nginx..."
nginx

# Function to obtain certificate
obtain_certificate() {
    certbot certonly --webroot \
        --non-interactive \
        --agree-tos \
        --email bartvanderwal@gmail.com \
        --domain api.battle.swimrun.group \
        --webroot-path /var/www/certbot \
        --preferred-challenges http
}

# Check if SSL certificates exist
if [ ! -f /etc/letsencrypt/live/api.battle.swimrun.group/fullchain.pem ]; then
    echo "No SSL certificates found. Obtaining new certificates..."
    if obtain_certificate; then
        echo "Certificates obtained successfully."
        # Create symbolic links to the certificates
        mkdir -p /etc/ssl/certs /etc/ssl/private
        ln -sf /etc/letsencrypt/live/api.battle.swimrun.group/fullchain.pem /etc/ssl/certs/api.battle.swimrun.group.crt
        ln -sf /etc/letsencrypt/live/api.battle.swimrun.group/privkey.pem /etc/ssl/private/api.battle.swimrun.group.key
        # Reload Nginx to apply the new configuration
        nginx -s reload
    else
        echo "Failed to obtain certificates. Check the logs for details."
    fi
else
    echo "SSL certificates found. Checking for renewal..."
    certbot renew --quiet
fi

# Keep the container running and monitor Node.js
wait $NODE_PID 