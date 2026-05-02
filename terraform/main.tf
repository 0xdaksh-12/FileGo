# --- AWS S3 ---
resource "aws_s3_bucket" "filego_uploads" {
  bucket = "filego-uploads-${random_id.suffix.hex}"
}

resource "aws_s3_bucket_lifecycle_configuration" "filego_lifecycle" {
  bucket = aws_s3_bucket.filego_uploads.id

  rule {
    id     = "auto-delete-old-files"
    status = "Enabled"

    filter {}

    expiration {
      days = 30
    }
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_cors_configuration" "filego_cors" {
  bucket = aws_s3_bucket.filego_uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# --- Google Cloud ---

resource "google_project_service" "apis" {
  for_each = toset([
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}

locals {
  secrets = {
    "MONGO_URL"             = var.mongo_url
    "JWT_SECRET"            = var.jwt_secret
    "JWT_REFRESH_SECRET"    = var.jwt_refresh_secret
    "GOOGLE_CLIENT_ID"      = var.google_client_id
    "GOOGLE_CLIENT_SECRET"  = var.google_client_secret
    "AWS_ACCESS_KEY_ID"     = var.aws_access_key
    "AWS_SECRET_ACCESS_KEY" = var.aws_secret_key
    "BETTER_STACK_TOKEN"    = var.better_stack_token
  }
}

resource "google_secret_manager_secret" "filego_secrets" {
  for_each  = local.secrets
  secret_id = each.key

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "filego_secrets_version" {
  for_each    = local.secrets
  secret      = google_secret_manager_secret.filego_secrets[each.key].id
  secret_data = each.value
}

resource "google_service_account" "server_sa" {
  account_id   = "filego-server-sa"
  display_name = "FileGo Server Service Account"
  depends_on   = [google_project_service.apis]
}

resource "google_project_iam_member" "secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.server_sa.email}"
}

resource "google_compute_network" "vpc_network" {
  name                    = "filego-network"
  auto_create_subnetworks = true
  depends_on              = [google_project_service.apis]
}

resource "google_compute_firewall" "default" {
  name    = "filego-firewall"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443", "3000"]
  }

  source_ranges = ["0.0.0.0/0"]
}
resource "google_compute_address" "server_ip" {
  name   = "filego-server-ip"
  region = var.gcp_region
}

resource "google_compute_instance" "server_vm" {
  name         = "filego-server-vm"
  machine_type = "e2-micro"
  zone         = "${var.gcp_region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      nat_ip = google_compute_address.server_ip.address
    }
  }

  service_account {
    email  = google_service_account.server_sa.email
    scopes = ["cloud-platform"]
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    set -e

    # Install dependencies
    apt-get update
    apt-get install -y git curl apt-transport-https ca-certificates gnupg lsb-release nginx python3-certbot-nginx

    # Install Google Cloud SDK (for gcloud secrets)
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
    apt-get update && apt-get install -y google-cloud-sdk

    # Install Docker and Docker Compose Plugin
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Clone code
    git clone https://github.com/${var.github_repo}.git /opt/filego
    cd /opt/filego
    
    # Helper to fetch secrets
    get_secret() {
      gcloud secrets versions access latest --secret="\$1"
    }

    # Generate server .env
    cat <<EOF > server/.env
PORT=3000
NODE_ENV=production
MONGO_URL=\$(get_secret "MONGO_URL")
JWT_SECRET=\$(get_secret "JWT_SECRET")
JWT_REFRESH_SECRET=\$(get_secret "JWT_REFRESH_SECRET")
AWS_ACCESS_KEY_ID=\$(get_secret "AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY=\$(get_secret "AWS_SECRET_ACCESS_KEY")
AWS_REGION=${var.aws_region}
AWS_BUCKET_NAME=${aws_s3_bucket.filego_uploads.bucket}
CLIENT_URL=https://${var.domain_name}
GOOGLE_CLIENT_ID=\$(get_secret "GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=\$(get_secret "GOOGLE_CLIENT_SECRET")
BETTER_STACK_SOURCE_TOKEN=\$(get_secret "BETTER_STACK_TOKEN")
EOF

    # Generate client .env
    cat <<EOF > client/.env
VITE_API_URL=/api
EOF

    # Start the application
    export VITE_API_URL=/api
    docker compose up -d --build

    # Configure Host Nginx
    cat <<'EOF_NGINX' > /etc/nginx/sites-available/filego
server {
    listen 80;
    server_name DOMAIN_NAME_PLACEHOLDER;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF_NGINX
    
    sed -i "s/DOMAIN_NAME_PLACEHOLDER/${var.domain_name}/g" /etc/nginx/sites-available/filego
    
    rm -f /etc/nginx/sites-enabled/default
    ln -s /etc/nginx/sites-available/filego /etc/nginx/sites-enabled/
    systemctl restart nginx

    # Run Certbot
    certbot --nginx -d ${var.domain_name} -m ${var.certbot_email} --agree-tos --non-interactive || true
  EOT

  depends_on = [
    google_secret_manager_secret_version.filego_secrets_version,
    google_project_service.apis
  ]
}

