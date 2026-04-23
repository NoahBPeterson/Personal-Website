#!/bin/bash
# One-time setup script for Lightsail instance
# Run as: bash server-setup.sh

set -e

echo "=== Installing Bun ==="
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
fi
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

echo "=== Installing Node.js 20 ==="
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
  sudo apt-get install -y nodejs
fi

echo "=== Installing ucode-lsp ==="
if ! command -v ucode-lsp &> /dev/null; then
  sudo npm install -g ucode-lsp
fi

echo "=== Installing .NET 6.0 runtime ==="
if ! command -v dotnet &> /dev/null; then
  curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
  chmod +x /tmp/dotnet-install.sh
  /tmp/dotnet-install.sh --channel 6.0 --runtime dotnet --install-dir /usr/share/dotnet
  sudo ln -sf /usr/share/dotnet/dotnet /usr/bin/dotnet
fi

echo "=== Updating nginx config ==="
# Backup existing config
sudo cp /etc/nginx/sites-available/NoahPeterson /etc/nginx/sites-available/NoahPeterson.bak

# Write the updated config, preserving SSL managed by Certbot
sudo tee /etc/nginx/sites-available/NoahPeterson > /dev/null << 'NGINX'
server {
    server_name 54.158.29.196 noahpeterson.me www.noahpeterson.me;

    root /var/www/html;
    index index.html;

    # Frontend — SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Hashed build artifacts are immutable — cache aggressively.
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # HTML entry points change on every deploy. Let browsers revalidate.
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # API proxy
    location /loxOutput {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /loxExamples {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ucodeExamples {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket proxy for ucode-lsp bridge
    location /lsp {
        proxy_pass http://127.0.0.1:6005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    listen [::]:443 ssl http2 ipv6only=on; # managed by Certbot
    listen 443 ssl http2; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/noahpeterson.me-0001/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/noahpeterson.me-0001/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.noahpeterson.me) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = noahpeterson.me) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name 54.158.29.196 noahpeterson.me www.noahpeterson.me;
    return 404; # managed by Certbot
}
NGINX

# Make sure it's enabled
sudo ln -sf /etc/nginx/sites-available/NoahPeterson /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== Creating app directory ==="
mkdir -p ~/app/webserver/ucode-workspace

echo "=== Done! ==="
echo ""
echo "Now set up GitHub secrets in your repo settings:"
echo "  LIGHTSAIL_HOST: $(curl -s http://checkip.amazonaws.com)"
echo "  LIGHTSAIL_USER: $(whoami)"
echo "  LIGHTSAIL_SSH_KEY: paste your Lightsail .pem private key"
