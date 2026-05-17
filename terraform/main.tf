# TERRAFORM SETTINGS & PROVIDER CONTEXT

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# NETWORKING CONTEXT (VPC & SUBNETS)
# Using default VPC and subnets to optimize cost and simplicity for demo purposes

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# CONTAINER REGISTRY (AMAZON ECR)

resource "aws_ecr_repository" "kataops_registry" {
  name                 = "kataops-engine"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# FIREWALLS & NETWORKING SECURITY (SECURITY GROUPS)

# Application Firewall (Allows incoming public traffic to FastAPI)

resource "aws_security_group" "app_sg" {
  name        = "kataops-app-security-group"
  description = "Allow inbound HTTP public traffic to port 8000"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Public API Access"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Database Firewall (Enforces Zero-Trust isolation)
resource "aws_security_group" "db_sg" {
  name        = "kataops-db-security-group"
  description = "Isolate PostgreSQL traffic. Allow only container access"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "PostgreSQL access from Application Container only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id] # Only traffic from our app SG
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# MANAGED PERSISTENCE (AMAZON RDS POSTGRESQL)

resource "aws_db_instance" "postgres" {
  identifier             = "kataops-postgres-instance"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t4g.micro" # Cost-efficient burstable performance instance
  allocated_storage      = 20
  max_allocated_storage  = 100
  db_name                = "kataops_db"
  username               = "db_admin_user"
  password               = var.db_password # Injected safely via variables
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  publicly_accessible    = false # Keeps database off the public internet
}

# ORCHESTRATION LAYER (AMAZON ECS & FARGATE)

resource "aws_ecs_cluster" "kataops_cluster" {
  name = "kataops-cluster"
}

resource "aws_ecs_task_definition" "kataops_task" {
  family                   = "kataops-task-definition"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256" # 0.25 vCPU
  memory                   = "512" # 0.5 GB RAM

  execution_role_arn = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "kataops-container"
      image     = "${aws_ecr_repository.kataops_registry.repository_url}:v1"
      essential = true
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
        }
      ]
      environment = [
        {
          name  = "DATABASE_URL"
          value = "postgresql://${aws_db_instance.postgres.username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "kataops_service" {
  name            = "kataops-service"
  cluster         = aws_ecs_cluster.kataops_cluster.id
  task_definition = aws_ecs_task_definition.kataops_task.arn
  desired_count   = 1 # Managed scaling capability
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.app_sg.id]
    assign_public_ip = true
  }
}

# VARIABLES & CONTEXT isolation

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "db_password" {
  type      = string
  sensitive = true
}


# TECHNICAL OUTPUTS

output "ecr_repository_url" {
  value       = aws_ecr_repository.kataops_registry.repository_url
  description = "The URL to push the Docker image to"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "The connection endpoint for the database instance"
}

# IAM ROLES FOR DE ECS

resource "aws_iam_role" "ecs_execution_role" {
  name = "kataops-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}