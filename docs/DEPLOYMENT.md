# FileGo Deployment Guide

This guide covers the infrastructure setup and deployment process for FileGo on Google Cloud Platform (GCP) and AWS.

## Prerequisites

- **Google Cloud SDK (gcloud)** installed and authenticated.
- **Terraform** installed.
- **AWS CLI** installed and authenticated (for S3 setup).
- A domain name (e.g., via DuckDNS or similar).

## 1. GCP Setup

### Enable Required APIs

Run the following command to enable the necessary services in your GCP project:

```bash
gcloud services enable \
  serviceusage.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  compute.googleapis.com \
  secretmanager.googleapis.com
```

### IAM Permissions

Ensure your deployment identity (User or Service Account) has the following roles:

- `Secret Manager Admin`
- `Project IAM Admin`
- `Compute Admin`

### Secret Manager

Terraform will automatically create and manage secrets for the following:

- `MONGO_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `BETTER_STACK_TOKEN`

## 2. AWS Setup

### S3 Bucket Permissions

Ensure your AWS IAM user has permissions to create and manage S3 buckets. The following policy is recommended:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:PutBucketCors",
        "s3:PutLifecycleConfiguration",
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": "*"
    }
  ]
}
```

## 3. Infrastructure Deployment (Terraform)

### Configuration

Create a `terraform.tfvars` file (or provide variables via environment variables) with the following values:

```hcl
gcp_project_id      = "your-gcp-project-id"
gcp_region          = "asia-south1"
mongo_url           = "your-mongodb-atlas-url"
jwt_secret          = "your-secure-jwt-secret"
jwt_refresh_secret  = "your-secure-jwt-refresh-secret"
google_client_id    = "your-google-oauth-client-id"
google_client_secret = "your-google-oauth-client-secret"
aws_access_key      = "your-aws-access-key"
aws_secret_key      = "your-aws-secret-key"
aws_region          = "ap-south-1"
better_stack_token  = "your-better-stack-token"
github_repo         = "https://github.com/yourusername/FileGo"
domain_name         = "filego.yourdomain.org"
certbot_email       = "your-email@example.com"
```

### Apply Infrastructure

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

## 4. CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow that automates the deployment.

### Required Secrets in GitHub

Set the following secrets in your GitHub repository settings:

- `GCP_PROJECT_ID`
- `GCP_SA_KEY` (JSON key for the `terraform-deployer` service account)
- `MONGO_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `BETTER_STACK_TOKEN`

## Troubleshooting

- **VPC Deletion Failure**: Ensure the VM instance is deleted before attempting to delete the network.
- **Permission Denied**: Verify that the `terraform-deployer` service account has `roles/resourcemanager.projectIamAdmin` and `roles/secretmanager.admin`.
- **API Not Enabled**: Ensure `cloudresourcemanager.googleapis.com` is enabled manually if Terraform fails to bootstrap it.
