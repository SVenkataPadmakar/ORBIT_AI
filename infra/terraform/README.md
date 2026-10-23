# Infrastructure (Terraform)

Bootstrap only at this stage — provider/backend wiring and per-environment
variable scaffolding. The actual AWS resources (VPC, ECS services, RDS,
ElastiCache, S3, CloudFront, IAM) described in the deployment architecture
doc are implemented in the DevOps phase, as modules under `modules/` and
wired per-environment under `environments/<env>/`.

## Layout

```
infra/terraform/
├── versions.tf              # provider + Terraform version constraints
├── modules/                  # reusable resource modules (vpc, ecs-service, rds, ...) — added in the DevOps phase
└── environments/
    ├── staging/               # staging-specific backend config + module wiring
    └── production/            # production-specific backend config + module wiring
```

## State Backend

Each environment configures its own S3 + DynamoDB remote state backend
(added alongside its `main.tf` in the DevOps phase) — never a local backend
for anything beyond a first local `terraform plan` dry run.
