variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "staging"
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}
