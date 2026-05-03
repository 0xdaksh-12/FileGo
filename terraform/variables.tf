variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Project ID"
}

variable "gcp_region" {
  type    = string
  default = "asia-south1"
}

variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "github_repo" {
  type        = string
  description = "GitHub repository for backend deployment"
  default     = "0xdaksh-12/FileGo"
}

variable "mongo_url" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "jwt_refresh_secret" {
  type      = string
  sensitive = true
}

variable "google_client_id" {
  type = string
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

variable "aws_access_key" {
  type      = string
  sensitive = true
}

variable "aws_secret_key" {
  type      = string
  sensitive = true
}

variable "better_stack_token" {
  type      = string
  sensitive = true
}

variable "domain_name" {
  type        = string
  description = "The domain name for the application"
  default     = "filego.duckdns.org"
}

variable "certbot_email" {
  type        = string
  description = "The email address for Let's Encrypt registration"
  default     = "0xdaksh.12@gmail.com"
}
