variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Project ID"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
}

variable "vercel_api_token" {
  type        = string
  sensitive   = true
}

variable "github_repo" {
  type        = string
  description = "GitHub repository for Vercel deployment (e.g., 0xflame-7/FileGo)"
  default     = "0xflame-7/FileGo"
}
