# --- AWS S3 ---
resource "aws_s3_bucket" "filego_uploads" {
  bucket = "filego-uploads-${random_id.bucket_suffix.hex}"
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

resource "random_id" "bucket_suffix" {
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


resource "google_project_service" "secretmanager" {
  service            = "secretmanager.googleapis.com"
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
  
  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "filego_secrets_version" {
  for_each    = local.secrets
  secret      = google_secret_manager_secret.filego_secrets[each.key].id
  secret_data = each.value
}

resource "google_service_account" "server_sa" {
  account_id   = "filego-server-sa"
  display_name = "FileGo Server Service Account"
}

resource "google_project_iam_member" "secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.server_sa.email}"
}

resource "google_compute_network" "vpc_network" {
  name                    = "filego-network"
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "default" {
  name    = "filego-firewall"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "3000"]
  }

  source_ranges = ["0.0.0.0/0"]
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
    access_config {}
  }

  service_account {
    email  = google_service_account.server_sa.email
    scopes = ["cloud-platform"]
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    apt-get update
    apt-get install -y git curl docker.io docker-compose
    systemctl start docker
    systemctl enable docker

    git clone https://github.com/${var.github_repo}.git /opt/filego
    cd /opt/filego
    
    get_secret() {
      gcloud secrets versions access latest --secret="$1"
    }

    cat <<EOF > server/.env
PORT=3000
NODE_ENV=production
MONGO_URL=$(get_secret "MONGO_URL")
JWT_SECRET=$(get_secret "JWT_SECRET")
JWT_REFRESH_SECRET=$(get_secret "JWT_REFRESH_SECRET")
AWS_ACCESS_KEY_ID=$(get_secret "AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY=$(get_secret "AWS_SECRET_ACCESS_KEY")
AWS_REGION=${var.aws_region}
AWS_BUCKET_NAME=${aws_s3_bucket.filego_uploads.bucket}
CLIENT_URL=https://file-go-ten.vercel.app
GOOGLE_CLIENT_ID=$(get_secret "GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=$(get_secret "GOOGLE_CLIENT_SECRET")
BETTER_STACK_SOURCE_TOKEN=$(get_secret "BETTER_STACK_TOKEN")
EOF
    docker-compose up -d server
  EOT

  depends_on = [google_secret_manager_secret_version.filego_secrets_version]
}
