# FileGo Production Deployment Guide

This document outlines the professional deployment strategy for FileGo, leveraging Google Cloud Platform (GCP) for core infrastructure and AWS for scalable object storage.

## Infrastructure Overview

FileGo uses a modern, multi-cloud production architecture provisioned entirely via **Infrastructure as Code (Terraform)**.

### Production Components:

- **Compute**: GCP Compute Engine (n2-standard-1) running Dockerized services.
- **Reverse Proxy**: Nginx with automated SSL/TLS via Certbot (Let's Encrypt).
- **Configuration**: GCP Secret Manager for secure, centralized environment variable management.
- **Networking**: Custom GCP VPC with hardened firewall rules (only 80/443 and restricted 22 open).
- **Storage**: AWS S3 with Lifecycle Rules (automated cleanup of expired files).
- **Database**: MongoDB Atlas (Production Cluster).
- **Monitoring**: Better Stack (Uptime & Log Management).

---

## 1. Automated Provisioning (Terraform)

The entire environment can be spun up or down using Terraform, ensuring environment consistency.

### Required GCP APIs

Enable these services to allow Terraform to manage resources:

```bash
gcloud services enable \
  serviceusage.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  compute.googleapis.com \
  secretmanager.googleapis.com
```

### Applying Infrastructure

1. Navigate to the `terraform/` directory.
2. Define your variables in `terraform.tfvars`.
3. Run the provisioning commands:
   ```bash
   terraform init
   terraform apply -auto-approve
   ```

---

## 2. CI/CD Pipeline (GitHub Actions)

FileGo implements a robust CI/CD workflow to ensure only tested code reaches production.

- **Continuous Integration**: On every PR/Push to `main`, the workflow runs the full test suite (39+ tests) including backend unit tests and frontend Vitest suites.
- **Continuous Deployment**: Successful merges to the `deploy` branch trigger an automated deployment to the GCP production VM.

### Deployment Workflow Steps:

1. **Build & Test**: Validates the application state.
2. **Sync Secrets**: Updates GCP Secret Manager with any new credentials.
3. **Remote Update**: Connects to the GCP VM via SSH and pulls the latest changes.
4. **Zero-Downtime Restart**: Restarts Docker containers with the new build.

---

## 3. Security Hardening

- **GCP Secret Manager**: No `.env` files are stored on the server. The application fetches secrets directly from GCP's secure vault at runtime or during build.
- **Nginx Reverse Proxy**: Handles SSL termination and protects the Node.js backend from direct internet exposure.
- **Firewall Rules**: The VPC is configured to block all traffic except for standard web ports (80, 443) and SSH (restricted to specific IPs).

---

## 4. Monitoring & Observability

- **Better Stack Logs**: Professional-grade log aggregation for the Node.js backend.

- **Health Checks**: The server exposes a `/health` endpoint used by GCP to monitor instance status.

---

## Troubleshooting

- **VPC Deletion**: GCP requires all resources (VMs, Firewalls) to be removed before the VPC can be destroyed.
- **SSH Access**: Ensure the `GCP_SA_KEY` in GitHub Secrets has sufficient permissions to manage Compute Engine instances.
- **Domain Propagation**: DNS changes for your domain (e.g., DuckDNS) may take a few minutes to propagate after the IP is assigned by GCP.
