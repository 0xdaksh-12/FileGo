# FileGo

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=339933)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=47A248)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazonaws&logoColor=FF9900)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-Infrastructure-4285F4?logo=googlecloud&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google-OAuth-4285F4?logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=2496ED)
![Testing](https://img.shields.io/badge/Tests-39_Passed-success?logo=vitest)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI/CD-Automated-2088FF?logo=githubactions&logoColor=white)

FileGo is a production-grade, high-performance file sharing application built with a focus on security, scalability, and automated infrastructure. This project demonstrates a full-stack deployment on **Google Cloud Platform (GCP)** using **Terraform (IaC)** and **GitHub Actions (CI/CD)**.

## Production Highlights

- **Multi-Cloud Architecture**: Leverages GCP for compute, AWS S3 for storage, and MongoDB Atlas for data.
- **Infrastructure as Code**: Entire GCP environment (VMs, Networks, Secrets) provisioned via Terraform.
- **Fully Automated CI/CD**: Seamless deployments to production on every push to the `deploy` branch.
- **Hardened Security**: SSL/TLS via Certbot, Nginx reverse proxy, and GCP Secret Manager for sensitive credentials.

## Key Features

- **Direct S3 Uploads**: Files bypass the server, uploaded directly to S3 via presigned URLs for maximum efficiency.
- **Secure Sharing**: Optional password protection and secure download links.
- **Auto-Expiry**: Automated background cleanup of expired files based on configurable TTL.
- **Real-time Stats**: Comprehensive dashboard with storage usage and download analytics.
- **Robust Auth**: Hybrid JWT session management with HTTP-only cookies and Google OAuth integration.

## Tech Stack

- **Frontend:** React 19, Vite, TanStack Query, Zustand, Tailwind CSS 4, Radix UI.
- **Backend:** Node.js 22, Express, Mongoose, Zod, Winston (Professional Logging).
- **Database:** MongoDB 7.0 (Replica Set).
- **Storage:** AWS S3 (v3 SDK).
- **Infrastructure:** Google Cloud Platform (Compute Engine, Secret Manager, VPC).
- **DevOps:** Terraform, GitHub Actions, Docker Compose, Nginx.

## Production Deployment

This project is designed to be deployed in a professional production environment.

### Infrastructure as Code (IaC)

The infrastructure is fully automated using Terraform. It provisions:

- A secure VPC network and firewall rules.
- A GCP Compute Engine instance running Docker.
- GCP Secret Manager for centralized configuration.
- AWS S3 bucket with automated lifecycle rules.

### CI/CD Pipeline

Every push to the `main` branch runs automated tests, while pushes to the `deploy` branch trigger a full production deployment via GitHub Actions.

Refer to the [Deployment Guide](docs/DEPLOYMENT.md) for step-by-step instructions.

## Quick Start (Development)

### 1. Prerequisites

- Node.js (v22+)
- Docker & Docker Compose
- AWS S3 Bucket

### 2. Setup

```bash
make install
cp server/.env.example server/.env
# Configure your secrets in server/.env
```

### 3. Running Locally

```bash
make dev
```

- **Client**: [http://localhost:5173](http://localhost:5173)
- **API Docs**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Architecture

Detailed architectural diagrams and data flows can be found in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Testing

The project is backed by a comprehensive suite of 39 automated tests (Unit, Integration, and E2E).

```bash
make test
```

## License

Licensed under the [Apache License 2.0](LICENSE).
