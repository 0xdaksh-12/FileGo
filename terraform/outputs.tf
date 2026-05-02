output "server_ip" {
  value       = google_compute_instance.server_vm.network_interface.0.access_config.0.nat_ip
  description = "The public IP of the Google Cloud VM running the server"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.filego_uploads.bucket
  description = "The AWS S3 bucket name created for file uploads"
}

output "server_url" {
  value       = "https://${var.domain_name}"
  description = "The final application URL"
}
