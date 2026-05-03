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
