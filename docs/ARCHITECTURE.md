# FileGo Architecture

FileGo is a modern, high-performance file sharing application. The infrastructure is designed to be highly scalable and cost-effective, leveraging a multi-cloud approach via Terraform.

## High-Level System Architecture

```mermaid
flowchart TD
    User([User]) --> |Visits Website| Vercel[Frontend: Vercel CDN]
    User --> |Uploads/Downloads| S3[(AWS S3 Bucket)]
    User --> |API Requests| GCP_LB[GCP Compute Engine VM]
    
    Vercel --> |API Requests| GCP_LB
    
    subgraph Google Cloud Platform
        GCP_LB --> |Runs Docker Compose| NodeApp[Node.js Express API]
    end
    
    subgraph AWS
        S3
    end
    
    subgraph Data Layer
        NodeApp --> |CRUD Metadata| MongoDB[(MongoDB Atlas)]
    end
    
    NodeApp --> |Generates Presigned URLs| S3
```

## Data Flow: File Upload via Presigned URL

To avoid routing heavy file uploads through the Node.js backend, FileGo uses AWS S3 Presigned URLs.

```mermaid
sequenceDiagram
    participant Client
    participant API as Backend (Node.js)
    participant S3 as AWS S3
    participant DB as MongoDB

    Client->>API: 1. Request Upload URL (filename, type, size)
    API->>S3: 2. Generate Presigned PUT URL
    S3-->>API: 3. Return URL
    API->>DB: 4. Save File Metadata (Status: Pending)
    API-->>Client: 5. Return Presigned URL & File ID
    
    Client->>S3: 6. Upload File directly via PUT
    S3-->>Client: 7. 200 OK
    
    Note over Client,DB: File is now available for sharing!
```
