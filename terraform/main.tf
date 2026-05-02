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
    "compute.googleapis.com",
    "cloudresourcemanager.googleapis.com"
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
    ports    = ["22", "80", "443"]
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

  metadata_startup_script = templatefile("${path.module}/scripts/startup.sh.tpl", {
    github_repo   = var.github_repo
    aws_region    = var.aws_region
    bucket_name   = aws_s3_bucket.filego_uploads.bucket
    domain_name   = var.domain_name
    certbot_email = var.certbot_email
  })

  depends_on = [
    google_secret_manager_secret_version.filego_secrets_version,
    google_project_service.apis
  ]
}


