# AWS S3 Bucket for File Uploads
resource "aws_s3_bucket" "filego_uploads" {
  bucket = "filego-uploads-${random_id.bucket_suffix.hex}"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_cors_configuration" "filego_cors" {
  bucket = aws_s3_bucket.filego_uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD", "DELETE"]
    allowed_origins = ["*"] # In production, restrict to Vercel domain
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# GCP Compute Engine VM for Backend
resource "google_compute_network" "vpc_network" {
  name                    = "filego-network"
  auto_create_subnetworks = true
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

resource "google_compute_instance" "server_vm" {
  name         = "filego-server-vm"
  machine_type = "e2-micro" # Free tier eligible
  zone         = "${var.gcp_region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      # Ephemeral public IP
    }
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common git
    curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Clone repo and run
    git clone https://github.com/${var.github_repo}.git /opt/filego
    cd /opt/filego
    
    # Note: In a real production scenario, securely inject the .env file here 
    # using Google Secret Manager or similar.
    docker compose up -d
  EOT
}

# Vercel Frontend Deployment
resource "vercel_project" "filego_client" {
  name      = "filego-client"
  framework = "vite"

  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  root_directory = "client"

  # Environment variables needed for client
  environment = [
    {
      key    = "VITE_API_URL"
      value  = "http://${google_compute_instance.server_vm.network_interface.0.access_config.0.nat_ip}:3000"
      target = ["production", "preview", "development"]
    }
  ]
}
