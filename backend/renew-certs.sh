#!/bin/bash

# Stop the nginx container
docker-compose stop nginx

# Renew the certificates
docker-compose run --rm certbot renew

# Start the nginx container again
docker-compose start nginx 