output "server_ip" {
  value       = google_compute_instance.server_vm.network_interface.0.access_config.0.nat_ip
  description = "The public IP of the Google Cloud VM running the server"
}

output "server_url" {
  value       = "http://${google_compute_instance.server_vm.network_interface.0.access_config.0.nat_ip}:3000"
  description = "The full API URL of the server"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.filego_uploads.bucket
  description = "The AWS S3 bucket name created for file uploads"
}

output "vercel_project_url" {
  value       = vercel_project.filego_client.url
  description = "The URL of the deployed Vercel client"
}
