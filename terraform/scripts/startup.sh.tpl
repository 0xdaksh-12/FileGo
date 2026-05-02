#!/bin/bash
set -euo pipefail

# FileGo VM Startup Script
# Rendered by Terraform templatefile() — do not edit directly.
# Template variables: github_repo, aws_region, bucket_name,
#                     domain_name, certbot_email

# System dependencies
apt-get update
apt-get install -y \
  git curl gnupg lsb-release \
  apt-transport-https ca-certificates \
  nginx python3-certbot-nginx gettext-base

# Google Cloud SDK (for Secret Manager access)
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg \
  | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] \
  https://packages.cloud.google.com/apt cloud-sdk main" \
  | tee /etc/apt/sources.list.d/google-cloud-sdk.list
apt-get update && apt-get install -y google-cloud-sdk

# Docker Engine + Compose Plugin
curl -fsSL https://download.docker.com/linux/debian/gpg \
  | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$$(dpkg --print-architecture) \
  signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/debian $$(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Clone repository
if [ ! -d /opt/filego ]; then
  git clone https://github.com/${github_repo}.git /opt/filego
fi
cd /opt/filego

# Fetch secrets and generate server .env
get_secret() {
  gcloud secrets versions access latest --secret="$${1}"
}

export MONGO_URL=$$(get_secret "MONGO_URL")
export JWT_SECRET=$$(get_secret "JWT_SECRET")
export JWT_REFRESH_SECRET=$$(get_secret "JWT_REFRESH_SECRET")
export AWS_ACCESS_KEY_ID=$$(get_secret "AWS_ACCESS_KEY_ID")
export AWS_SECRET_ACCESS_KEY=$$(get_secret "AWS_SECRET_ACCESS_KEY")
export AWS_REGION="${aws_region}"
export AWS_BUCKET_NAME="${bucket_name}"
export CLIENT_URL="https://${domain_name}"
export GOOGLE_CLIENT_ID=$$(get_secret "GOOGLE_CLIENT_ID")
export GOOGLE_CLIENT_SECRET=$$(get_secret "GOOGLE_CLIENT_SECRET")
export BETTER_STACK_SOURCE_TOKEN=$$(get_secret "BETTER_STACK_TOKEN")

envsubst < terraform/scripts/env.template > server/.env

# Start application (root-level nginx handles routing)
docker compose up -d --build

# Configure host Nginx as a thin TLS-terminating reverse proxy.
# All routing logic lives inside the Docker nginx container.
cp terraform/scripts/host-nginx.conf /etc/nginx/sites-available/filego

sed -i "s/DOMAIN_PLACEHOLDER/${domain_name}/g" /etc/nginx/sites-available/filego

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/filego /etc/nginx/sites-enabled/filego
nginx -t && systemctl restart nginx

# Provision TLS certificate via Certbot
certbot --nginx \
  -d ${domain_name} \
  -m ${certbot_email} \
  --agree-tos \
  --non-interactive \
  || true
