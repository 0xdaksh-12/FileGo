# FileGo Production Architecture

FileGo is a production-grade, high-performance file sharing application. The infrastructure is designed for high availability, security, and cost-effectiveness, leveraging a multi-cloud approach pr[...]

## High-Level System Architecture

```mermaid
flowchart TD
    User([User]) --> |HTTPS/SSL| Nginx[Nginx Reverse Proxy]
    Nginx --> |Proxies| NodeApp[Node.js Express API]

    subgraph GCP["Google Cloud Platform (VPC)"]
        NodeApp --> |Fetches Secrets| SecretManager[GCP Secret Manager]
        NodeApp --> |Runs in Docker| Compute[Compute Engine VM]
    end

    User --> |Uploads/Downloads| S3[(AWS S3 Bucket)]

    subgraph DataLayer["Data Layer"]
        NodeApp --> |CRUD Metadata| MongoDB[(MongoDB Atlas)]
    end

    subgraph AWS_Storage["Object Storage (AWS)"]
        S3 --> |Lifecycle Rules| Expiry[Auto-Cleanup]
    end

    NodeApp --> |Generates Presigned URLs| S3
```

## Security & Configuration Layer

Unlike standard applications that rely on local `.env` files, FileGo uses a **centralized configuration management** system:

1. **GCP Secret Manager**: Acts as the single source of truth for all production credentials (JWT secrets, API keys, DB URIs).
2. **Infrastructure as Code (IaC)**: Terraform manages the secret versions and access policies, ensuring that only the application VM has the necessary permissions to read them.
3. **SSL Termination**: Nginx handles Let's Encrypt certificates, ensuring all client-to-server communication is encrypted via TLS 1.3.

## Data Flow: File Upload via Presigned URL

To maximize throughput and minimize server overhead, FileGo utilizes the **Direct-to-Cloud** upload pattern.

```mermaid
sequenceDiagram
    participant Client as User Browser
    participant API as Backend (GCP VM)
    participant S3 as AWS S3
    participant DB as MongoDB Atlas

    Client->>API: 1. Request Upload URL (metadata)
    API->>S3: 2. Request Presigned PUT URL
    S3-->>API: 3. Return Presigned URL
    API->>DB: 4. Initialize File record (Pending)
    API-->>Client: 5. Return Presigned URL

    Client->>S3: 6. PUT file data directly
    S3-->>Client: 7. 200 OK

    Note over Client,S3: Backend is never choked by heavy file traffic!
```

## DevOps & Deployment Flow

1. **Development**: Code is written and tested locally.
2. **CI (GitHub Actions)**: Every push triggers 39+ automated tests.
3. **CD (GitHub Actions)**: Successful builds on `deploy` branch are pushed to the GCP VM, secrets are synced, and containers are restarted using a rolling update strategy.
