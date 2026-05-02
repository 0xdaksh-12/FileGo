# FileGo

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=339933)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=47A248)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazonaws&logoColor=FF9900)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-Infrastructure-4285F4?logo=googlecloud&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google-OAuth-4285F4?logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=2496ED)
![Testing](https://img.shields.io/badge/Tests-39_Passed-success?logo=vitest)

FileGo is a modern, high-performance file sharing application built with a focus on security, scalability, and seamless user experience. It leverages AWS S3 presigned URLs for direct browser-to-cloud uploads, minimizing server load and maximizing throughput.

## Key Features

- **Direct S3 Uploads**: Files bypass the server, uploaded directly to S3 via presigned URLs.
- **Secure Sharing**: Optional password protection for shared files.
- **Auto-Expiry**: Set TTL for files (1h, 1d, 7d, etc.) with automatic background cleanup.
- **Real-time Stats**: Dashboard with storage usage tracking and download analytics.
- **Auth System**: Hybrid JWT session management with HTTP-only refresh tokens and Google OAuth support.
- **Hardened Architecture**: Rate-limited endpoints, CSRF-resistant cookies, and compound cursor pagination.

## Tech Stack

- **Frontend:** React 19, Vite, TanStack Query, Zustand, Tailwind CSS 4, Radix UI.
- **Backend:** Node.js 20, Express, Mongoose, Zod (Validation), Winston (Logging).
- **Database:** MongoDB 7.0 (Replica Set supported for Transactions).
- **Storage:** AWS S3 (v3 SDK).
- **Tooling:** Docker Compose, Volta, Husky, Prettier, Jest (Backend), Vitest (Frontend).

## Quick Start

The project includes a `Makefile` to simplify all common operations.

### 1. Prerequisites

- Node.js (v22+) or [Volta](https://volta.sh/)
- Docker & Docker Compose
- AWS S3 Bucket & IAM Credentials

### 2. Setup

```bash
# Clone the repo
git clone https://github.com/0xflame-7/FileGo.git
cd FileGo

# Install all dependencies (Root, Client, Server)
make install

# Setup environment variables
cp server/.env.example server/.env
# Fill in your AWS, MongoDB, and JWT secrets in server/.env
```

### 3. Observability & Auth

- **Better Stack Logs**: Get a source token from [Better Stack](https://betterstack.com/) and add `BETTER_STACK_SOURCE_TOKEN` to `server/.env`.
- **Better Stack Uptime**: Add `BETTER_STACK_UPTIME_URL` (heartbeat) to `server/.env` to enable real-time health monitoring.
- **Google OAuth**: Create a project in the [Google Cloud Console](https://console.cloud.google.com/), obtain a **Client ID** and **Client Secret**.
  - Add both to `server/.env`.
  - Add only the **Client ID** to `client/.env`.

### 4. Running Locally

```bash
# Run client and server concurrently
make dev
```

- **Client**: [http://localhost:5173](http://localhost:5173)
- **Server**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Deployment

### Docker (Self-Hosted / VPS)

The easiest way to deploy FileGo is via Docker Compose.

1. SSH into your server.
2. Clone the repo and set up `.env`.
3. Run `make docker-up`.

### Managed Infrastructure (Terraform)

We provide Terraform scripts for a multi-cloud production setup:

- **GCP**: Backend VM (Compute Engine).
- **Vercel**: Frontend hosting.
- **AWS**: S3 storage with lifecycle rules.

See [terraform/README.md](terraform/README.md) for the full guide.

## Testing

The project is backed by a comprehensive suite of 39 automated tests.

```bash
# Run all tests
make test

# Run specific suites
make test-server
make test-client
```

## API Documentation

Once the server is running, visit `/api-docs` to explore the full Swagger documentation. Key endpoints include:

- `POST /api/auth/register` | `login` | `refresh`
- `POST /api/files/upload-url` (Generate presigned URL)
- `GET /api/files` (Paginated user files)
- `POST /api/files/:id/download` (Password-protected download)

## Infrastructure

Terraform configurations for GCP, AWS, and Vercel are located in the `terraform/` directory. See [terraform/README.md](terraform/README.md) for deployment instructions.

## License

Licensed under the [ISC License](LICENSE).
