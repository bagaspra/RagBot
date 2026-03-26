# AWS Deployment Guide - RAG Chatbot

## OPTION A — AWS EC2 (full control)

1. Launch an EC2 instance
   - Instance type: `t3.medium`
   - OS: `Amazon Linux 2023`
   - Open ports:
     - `22` (SSH)
     - `8000` (FastAPI backend)
     - `3000` (Next.js frontend)

2. Install Docker + Docker Compose v2
   - Install Docker
   - Install Compose v2 plugin

3. Clone repo, create `.env` and `.env.local`
   - Copy `rag-chatbot/.env.example` to `.env`
   - Copy `rag-chatbot/.env.local.example` to `.env.local`
   - Set all API keys (Groq, DeepSeek, Pinecone if applicable)

4. Start containers
   - `docker-compose up -d`

5. (Optional) Nginx reverse proxy
   - Map:
     - `/api/*` → `http://localhost:8000`
     - `/*` → `http://localhost:3000`
   - SSL via Certbot

6. systemd service for auto-restart on reboot
   - Create a systemd unit to run `docker-compose up -d` at boot
   - Ensure restart policy is enabled

## OPTION B — AWS App Runner (simplified, managed)

1. Build and push BOTH images to Amazon ECR
   - Images:
     - `rag-chatbot-backend`
     - `rag-chatbot-frontend`

   Example commands (update placeholders):
   - Create ECR repos:
     - `aws ecr create-repository --repository-name rag-chatbot-backend --image-scanning-configuration scanOnPush=true`
     - `aws ecr create-repository --repository-name rag-chatbot-frontend --image-scanning-configuration scanOnPush=true`
   - Login:
     - `aws ecr get-login-password --region <AWS_REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com`
   - Build & push backend image:
     - `docker build -t rag-chatbot-backend -f docker/Dockerfile.backend .`
     - `docker tag rag-chatbot-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/rag-chatbot-backend:latest`
     - `docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/rag-chatbot-backend:latest`
   - Build & push frontend image:
     - `docker build -t rag-chatbot-frontend -f docker/Dockerfile.frontend .`
     - `docker tag rag-chatbot-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/rag-chatbot-frontend:latest`
     - `docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/rag-chatbot-frontend:latest`

2. Create two App Runner services (one per image)
   - Backend service uses `rag-chatbot-backend` image
   - Frontend service uses `rag-chatbot-frontend` image

3. Link frontend App Runner URL as `BACKEND_URL` for frontend service env var
   - In frontend App Runner environment variables:
     - `BACKEND_URL=https://<backend-app-runner-url>`

4. Health check
   - Backend: `/health`
   - Frontend: `/api/health`

5. Note: Qdrant must be hosted separately
   - For example:
     - Qdrant Cloud
     - or a dedicated EC2-hosted Qdrant instance

## Architecture Diagram (ASCII art)

Browser → Next.js Frontend (3000) → FastAPI Backend (8000) → Qdrant (6333)
                                                               ↑
                                                     HuggingFace Embeddings
                                                     Groq / DeepSeek API

## Monthly Cost Estimate (rough)

- EC2 t3.medium: ~$30/mo
- App Runner (2 services): ~$20–$40/mo
- Qdrant Cloud free tier: $0 (up to 1GB)
- Groq API: free tier available
Total estimate: $20–$70/mo depending on option

## Security Checklist

- IAM: least-privilege role for EC2/App Runner
- Security Groups: restrict inbound ports
- Secrets: store API keys in AWS Secrets Manager, inject via:
  - ECS task definition (if using ECS)
  - App Runner env vars (if supported by your workflow)
- HTTPS:
  - EC2: Nginx + Certbot
  - App Runner: built-in TLS
- Rate limiting:
  - Add slowapi to FastAPI backend

