<p align="center">
  <img width="1121" height="217" alt="KataOps Engine banner" src="https://github.com/user-attachments/assets/098457d4-1967-4ad7-99ce-c90b7f5009cc">
</p>

<h1 align="center">KataOps Engine</h1>

<p align="center">
  <strong>A production-grade, cloud-native demonstration of full-stack engineering, IaC, and automated CI/CD on AWS.</strong>
</p>

<p align="center">
  <a href="http://98.93.55.14:8000/"><img src="https://img.shields.io/badge/live%20demo-online-brightgreen?style=for-the-badge" alt="Live demo"></a>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2671E5?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI/CD">
  <img src="https://img.shields.io/badge/auth-OIDC-185FA5?style=for-the-badge&logo=openid&logoColor=white" alt="OIDC auth">
  <img src="https://img.shields.io/badge/IaC-Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" alt="IaC">
  <img src="https://img.shields.io/badge/cloud-AWS%20Fargate-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="Cloud">
</p>

---

## Overview

KataOps Engine is a portfolio-grade demonstration of modern cloud engineering, originally developed during the **EPAM Systems Cloud & DevOps specialization** and evolved beyond it into a fully reproducible, IaC-managed deployment. The project intentionally exercises every layer of a contemporary web platform — from algorithmic backend logic to serverless container orchestration — to surface decisions that mirror real production environments rather than tutorial-grade simplifications.

The application takes three classical algorithmic challenges (**katas**) and exposes them through a typed Python API and a reactive frontend, deployed end-to-end on AWS via a fully automated pipeline. Every piece of infrastructure is described in code, every commit is gated by tests, and every artifact is built and shipped without manual intervention.

> **Live deployment** → [http://98.93.55.14:8000/](http://98.93.55.14:8000/)

---

## Architecture

<p align="center">
  <em><img width="2400" height="4165" alt="architecture" src="https://github.com/user-attachments/assets/0af33c4e-e5fb-4a54-a5c9-8844435f7be9" />
</em>
</p>

The system follows a layered, immutable-infrastructure model: developer pushes trigger a GitHub Actions pipeline that authenticates to AWS via **OIDC federation** (no static credentials), provisions infrastructure with Terraform, validates code through pytest + FastAPI TestClient, builds a multistage Docker image, and pushes it to Amazon ECR. ECS Fargate pulls the image and runs the FastAPI + React 19 SPA container behind tightly scoped security groups, with all persistence delegated to a managed Amazon RDS PostgreSQL 16 instance.

**Key architectural decisions:**

| Concern | Decision | Rationale |
|---|---|---|
| Compute | ECS Fargate (serverless) | Zero EC2 management overhead; pay-per-task billing |
| Persistence | Amazon RDS PostgreSQL 16 | Managed backups, patching, and HA without ops burden |
| Image registry | Amazon ECR (private, scan-on-push) | Native IAM integration with ECS; vulnerability scanning on every push |
| IaC | Terraform ≥ 1.5, AWS provider ~> 5.0 | Declarative, version-controlled, reproducible |
| CI/CD auth | OIDC federation (no static keys) | Short-lived STS credentials per workflow run; no secrets in repo |
| CI/CD structure | 3 sequential jobs with `needs:` gating | Test failure blocks build; build failure blocks deploy |
| Network egress | Single public endpoint on Fargate task | Demo-grade; production would front this with ALB + ACM + Route 53 |
| Networking | Default VPC + default subnets | Deliberate cost/simplicity tradeoff for demo (documented in Roadmap) |

---

## Core Challenges (The Katas)

The application implements three distinct algorithmic challenges sourced from Codewars, each exposing a different cross-cutting concern of a real backend.

### 1. Persistent Dictionary System
A data management subsystem for inserting and querying terms, designed to demonstrate the migration from volatile state to durable persistence.

- **Persistence layer** — Migrated from in-memory dictionaries to a managed PostgreSQL instance via SQLAlchemy ORM, with database sessions injected per-request through FastAPI's `Depends()` dependency injection.
- **Audit trail** — Every write captures `created_at` server-side timestamps (PostgreSQL `func.now()`) and the originating `User-Agent` HTTP header, enabling forensic traceability of every entry.
- **Idempotency** — Duplicate inserts are detected at the application layer (`SELECT` before `INSERT`) and rejected with HTTP 400 before reaching the database constraint level.

### 2. Tax Calculator
A financial calculation engine that processes itemized lists against a predefined cost catalog.

- **Business logic** — Filters non-existent items defensively and applies dynamic tax rates without coupling rate values to source code.
- **Frontend feedback** — React state management surfaces calculation results immediately, with controlled inputs preventing malformed submissions.
- **Pure functions** — The tax engine is implemented as side-effect-free pure functions, making it trivially testable in isolation.

### 3. Pattern Concatenator
A string manipulation algorithm that extracts the nth character of the nth word across a list, concatenating them into a single string (e.g., `["yoda","best","has"]` → `"yes"`).

- **Defense in depth** — Frontend validation in `App.jsx` enforces `word.length > index` before the request leaves the browser; backend re-validates and returns HTTP 400 on `IndexError` (never trust the client).
- **Data transformation** — Plain-text comma-separated input is parsed into typed arrays for backend processing, with explicit error responses on malformed payloads.

---

## Technology Stack

**Frontend** &nbsp;
![React](https://img.shields.io/badge/react%2019-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite%208-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

**Backend** &nbsp;
![Python](https://img.shields.io/badge/python%203.12-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)
![Postgres](https://img.shields.io/badge/postgresql%2016-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)

**Infrastructure & DevOps** &nbsp;
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)
![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)

---

## Technical Implementation

### Containerization — Multistage Build

A two-stage Dockerfile produces a minimal, hardened production image with explicit security and observability defaults:

- **Stage 1 — `node:20-slim`** compiles the React 19 SPA via Vite 8, producing static assets in `frontend/dist/`.
- **Stage 2 — `python:3.12-slim`** copies the compiled `dist/` output and installs runtime Python dependencies with `pip --no-cache-dir`, serving the SPA as static files through FastAPI + Uvicorn on port 8000. A catch-all route handles SPA client-side routing.

**Hardening applied at image build:**

- **Non-root runtime user** — A dedicated `appuser` is created with no password and no shell privileges; the container's `CMD` runs under this user, eliminating root inside the container (CIS Docker Benchmark 4.1 compliant).
- **No bytecode artifacts** — `PYTHONDONTWRITEBYTECODE=1` keeps the runtime filesystem free of `.pyc` cruft.
- **Unbuffered stdout/stderr** — `PYTHONUNBUFFERED=1` ensures logs stream to CloudWatch Logs in real time rather than getting trapped in Python's default buffer (essential for Fargate observability).
- **Normalized timezone** — `TZ=UTC` enforces consistent timestamps across the audit trail regardless of the host's locale.
- **Pinned base images** — Both stages use explicit version tags (`node:20-slim`, `python:3.12-slim`) for reproducible builds.

This separation strips Node.js, build toolchains, and npm dev dependencies from the runtime image, producing a significantly smaller and lower-attack-surface artifact than a single-stage equivalent would yield.

### Persistence — SQLAlchemy ORM over Amazon RDS

The application uses SQLAlchemy as the data access layer with a declarative `Base` model and per-request session lifecycle.

- **Typed models** abstract raw SQL behind Pythonic objects (`DictionaryEntry`), making schema evolution a code-review concern rather than a deploy-time surprise.
- **Per-request sessions** — `get_db()` yields a `SessionLocal` instance injected via FastAPI's `Depends()`, ensuring each request gets its own transaction scope with guaranteed `db.close()` in a `finally` block.
- **Server-side timestamps** — `created_at` uses PostgreSQL's `func.now()` rather than Python's `datetime.now()`, eliminating clock skew between the application server and the database.
- **Engine portability** — Tests run against an in-memory SQLite engine configured with `StaticPool` (so the database persists across the TestClient's request handling); production targets PostgreSQL via `DATABASE_URL`. The ORM abstracts the dialect difference, allowing the same model code to satisfy both environments.

### Automated CI/CD Pipeline

Continuous integration and deployment are fully automated via **GitHub Actions**, structured as **three sequential jobs** with strict `needs:` gating:

1. **`test`** — Pytest runs the full test suite (2 unit tests for pure kata functions + 9 API tests using FastAPI's `TestClient` against an in-memory SQLite engine with `StaticPool` for isolation). No cloud round-trips, zero per-run cost.
2. **`build-and-push`** — Gated by `needs: test`. Builds the multistage Docker image and pushes it to **Amazon ECR**. Authentication to AWS uses **OIDC federation** — the workflow assumes an IAM role via short-lived STS credentials, with no long-lived access keys stored anywhere.
3. **`deploy`** — Gated by `needs: build-and-push`. Triggers a force-deployment on the ECS service, prompting Fargate to drain the existing task and spin up a fresh one against the new image.

No green tests → no image build → no deployment. The pipeline is intentionally rigid because that's what makes it trustworthy.

### Testing Strategy — FastAPI TestClient with SQLite StaticPool

The test suite (`app/tests/`) is split between **pure unit tests** for the kata logic and **API integration tests** for the actual endpoints:

- **`conftest.py`** instantiates a fresh in-memory SQLite engine per test session, configured with `StaticPool` and `connect_args={"check_same_thread": False}` so the database survives across TestClient request boundaries. It overrides the `get_db` FastAPI dependency to inject the test session.
- **API tests** exercise every endpoint: health check, dictionary CRUD (happy path + duplicate-rejection + 404 on lookup), tax calculation (with non-existent items), and pattern concatenation (happy path + short-word validation).
- **Total**: 11 tests, all running in under a second, with zero infrastructure dependencies — runnable on a laptop or in CI without provisioning anything.

### Infrastructure as Code — Terraform

The complete AWS landscape is declared in HCL and provisioned via `terraform apply`, with provider versions pinned (`aws ~> 5.0`) and Terraform itself constrained to `>= 1.5.0` for reproducibility.

- **Amazon ECS (Fargate)** — Serverless container orchestration; no EC2 instances to patch, scale, or monitor. Task sized at 256 CPU units / 512 MB memory for cost-efficient demo footprint.
- **Amazon RDS (PostgreSQL 16)** — Managed `db.t4g.micro` (ARM-based burstable) instance with `allocated_storage = 20` GB scaling up to `100` GB via `max_allocated_storage`. `publicly_accessible = false` keeps the database off the public internet.
- **Amazon ECR** — Private container registry with `scan_on_push = true` enabling automatic vulnerability scanning of every pushed image.
- **Security Groups (zero-trust posture)** — App SG accepts ingress on `:8000` from `0.0.0.0/0`; DB SG accepts ingress on `:5432` **exclusively from the App SG's security group ID** (not its CIDR), making the database unreachable from anything except the running Fargate task — including the public internet.
- **IAM roles** — Dedicated `ecs_execution_role` with `AmazonECSTaskExecutionRolePolicy` attached for ECR pull and CloudWatch Logs write; no inline wildcard policies. A separate GitHub OIDC provider + role enables federated authentication from CI.
- **Sensitive variables** — `db_password` is declared with `sensitive = true`, preventing accidental exposure in Terraform plan/apply output.
- **Stateful outputs** — `ecr_repository_url` and `rds_endpoint` are exported as Terraform outputs for downstream pipeline consumption.

### Cost Governance — AWS Budgets

Proactive **AWS Budgets** thresholds with automated email alerts monitor spend in real time, preventing runaway costs and aligning the project with FinOps best practices throughout its lifecycle.

---

## Project Structure

```
kataops-engine/
├── app/
│   ├── main.py              # FastAPI app, endpoints, Pydantic models
│   ├── database.py          # SQLAlchemy engine, DictionaryEntry model, get_db
│   ├── katas/core.py        # Pure kata logic
│   └── tests/
│       ├── conftest.py      # TestClient + SQLite in-memory fixtures
│       └── test_core.py     # 11 tests (2 unit + 9 API)
├── frontend/src/App.jsx     # React 19 SPA with three kata cards
├── Dockerfile               # Multistage build
├── terraform/main.tf        # Full AWS infrastructure
└── .github/workflows/deploy.yml  # CI/CD pipeline (test → build → deploy)
```

### API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Smoke check |
| `POST` | `/api/v1/dictionary/add` | Insert new term (audited) |
| `GET` | `/api/v1/dictionary/look/{word}` | Lookup single term |
| `GET` | `/api/v1/dictionary/all` | List all terms with metadata |
| `POST` | `/api/v1/costs/calculate` | Compute total with tax |
| `POST` | `/api/v1/strings/concat` | Run pattern concatenator |

---

## Visual Showcase

<p align="center">
  <img width="1125" height="619" alt="Application interface — Persistent Dictionary" src="https://github.com/user-attachments/assets/b2ea3d4a-26d0-466f-a9b8-ab6f3ad0e259">
</p>

<p align="center">
  <img width="1124" height="581" alt="Application interface — Tax Calculator" src="https://github.com/user-attachments/assets/53436b10-2a0b-4364-9827-e2e10e8bbedd">
</p>

<p align="center">
  <img width="1124" height="378" alt="Application interface — Pattern Concatenator" src="https://github.com/user-attachments/assets/f1878fcd-145b-4eda-a4ff-7815aeb9ed37">
</p>

---

## Local Development

To run the project locally with Docker:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/kataops-engine.git
cd kataops-engine

# 2. Build the multistage image
docker build -t kataops-engine:local .

# 3. Run the container (defaults to in-memory SQLite for dev)
docker run -p 8000:8000 kataops-engine:local

# 4. Open the app
open http://localhost:8000
```

To run the test suite without Docker:

```bash
pip install -r requirements.txt
PYTHONPATH=. pytest -v app/tests/
```

To provision the cloud infrastructure (requires AWS credentials and Terraform ≥ 1.5):

```bash
cd terraform/
terraform init
terraform plan -var="db_password=your-secure-password" -out=tfplan
terraform apply tfplan
```

---

<p align="center">
  Built by <a href="https://github.com/Nesthings">Néstor David Reyes Quiñones</a> · Saltillo, México 🇲🇽
</p>
