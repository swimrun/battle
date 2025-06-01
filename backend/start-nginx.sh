#!/bin/sh

# Create certbot directory if it doesn't exist
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot

# Start Nginx
echo "Starting Nginx..."
nginx

# Only run certbot in production
if [ "$NODE_ENV" = "production" ]; then
    # Function to obtain certificate
    obtain_certificate() {
        certbot certonly --webroot \
            --non-interactive \
            --agree-tos \
            --email bartvanderwal@gmail.com \
            --domain $DOMAIN \
            --webroot-path /var/www/certbot \
            --preferred-challenges http
    }

    # Check if SSL certificates exist
    if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
        echo "No SSL certificates found. Obtaining new certificates..."
        if obtain_certificate; then
            echo "Certificates obtained successfully."
            # Create symbolic links to the certificates
            mkdir -p /etc/ssl/certs /etc/ssl/private
            ln -sf /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/ssl/certs/$DOMAIN.crt
            ln -sf /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/ssl/private/$DOMAIN.key
            # Reload Nginx to apply the new configuration
            nginx -s reload
        else
            echo "Failed to obtain certificates. Check the logs for details."
        fi
    else
        echo "SSL certificates found. Checking for renewal..."
        certbot renew --quiet
    fi
else
    echo "Development mode: Skipping SSL certificate generation"
fi

# Keep Nginx running
nginx -g 'daemon off;' 