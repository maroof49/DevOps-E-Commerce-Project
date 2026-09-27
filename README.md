# DevOps E-Commerce Demo

![Uploading image.png…]()

A small full-stack e-commerce application for practicing:

Git -> Jenkins -> Maven -> Docker -> Docker Hub -> AWS EKS -> Kubernetes Ingress -> AWS ALB -> Route 53 -> GoDaddy -> HTTPS

## Project structure

- `backend/` - Java 17 Spring Boot REST API with H2
- `frontend/` - HTML/CSS/JavaScript frontend served by Nginx
- `k8s/` - Namespace, Deployments, Services and ALB Ingress
- `Dockerfile.backend` - multi-stage backend image
- `Dockerfile.frontend` - Nginx frontend image
- `Jenkinsfile` - CI/CD pipeline

## Application API

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`

The frontend calls `/api/products`. Nginx proxies `/api/` to the backend Kubernetes Service.

## 1. Run backend locally

Requirements: Java 17+ and Maven 3.9+.

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

## 2. Build Docker images

Replace `YOUR_DOCKERHUB_USERNAME`.

```bash
docker login

docker build -f Dockerfile.backend -t YOUR_DOCKERHUB_USERNAME/ecommerce-backend:1.0 .
docker build -f Dockerfile.frontend -t YOUR_DOCKERHUB_USERNAME/ecommerce-frontend:1.0 .

docker push YOUR_DOCKERHUB_USERNAME/ecommerce-backend:1.0
docker push YOUR_DOCKERHUB_USERNAME/ecommerce-frontend:1.0
```

## 3. EKS prerequisites

Install/configure:
- AWS CLI
- kubectl
- Docker
- Helm
- An EKS cluster
- AWS Load Balancer Controller

Example:

```bash
aws configure
aws eks update-kubeconfig --region ap-south-1 --name YOUR_EKS_CLUSTER
kubectl get nodes
```

Install the current AWS Load Balancer Controller using the official AWS documentation appropriate for your EKS version.

## 4. Deploy Kubernetes resources

Before applying, replace `YOUR_DOCKERHUB_USERNAME` in `k8s/backend.yaml` and `k8s/frontend.yaml`, and replace `YOUR_DOMAIN` in `k8s/ingress.yaml`.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml

kubectl get pods -n ecommerce
kubectl get ingress -n ecommerce
```

The AWS Load Balancer Controller should provision an internet-facing ALB.

## 5. Traffic flow

```text
Browser
  |
  v
GoDaddy domain
  |
  v
Route 53
  |
  v
AWS ALB
  |
  v
AWS Load Balancer Controller
  |
  v
Kubernetes Ingress
  |                         |
  | /                       | /api
  v                         v
Frontend Service          Backend Service
  |                         |
  v                         v
Frontend Pods             Backend Pods
```

## 6. GoDaddy + Route 53

1. Create a public Route 53 hosted zone for your domain.
2. Copy the Route 53 nameservers.
3. In GoDaddy, change the domain nameservers to the Route 53 nameservers.
4. Wait for DNS delegation.
5. In Route 53, create an `A` record with **Alias** enabled and select the ALB.
6. For `www`, create another alias record if required.

Do not use the ALB hostname as an IP address in a normal A record.

## 7. HTTPS

For a real deployment, add an ACM certificate for your domain and configure the ALB Ingress for HTTPS. The certificate should be in the AWS region containing the ALB.

Typical annotation:

```yaml
alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:REGION:ACCOUNT_ID:certificate/CERTIFICATE_ID
```

Use the current AWS Load Balancer Controller documentation for the exact TLS/listener annotations.

## 8. Jenkins CI/CD

Create a Jenkins credential:

```text
ID: dockerhub-creds
Type: Username with password
Username: Docker Hub username
Password: Docker Hub access token
```

Edit the environment variables in `Jenkinsfile`:

```text
DOCKERHUB_USER
AWS_REGION
EKS_CLUSTER
```

The pipeline does:

1. Checkout source
2. Maven test
3. Maven package
4. Build backend Docker image
5. Build frontend Docker image
6. Push images to Docker Hub
7. Update EKS deployment images
8. Wait for Kubernetes rollout

The image tag is the short Git commit SHA, while `latest` is also pushed for convenience.

The Jenkins agent needs Docker, AWS CLI and kubectl, and an AWS identity authorized to access EKS. Prefer IAM roles/short-lived credentials over long-lived AWS keys.

## 9. Useful troubleshooting

```bash
kubectl get all -n ecommerce
kubectl describe ingress ecommerce-ingress -n ecommerce
kubectl get events -n ecommerce --sort-by=.lastTimestamp
kubectl logs -n ecommerce deployment/ecommerce-backend
kubectl logs -n ecommerce deployment/ecommerce-frontend
kubectl rollout status deployment/ecommerce-backend -n ecommerce
kubectl rollout status deployment/ecommerce-frontend -n ecommerce
```

If the ALB is not created:

```bash
kubectl logs -n kube-system deployment/aws-load-balancer-controller
```

## 10. Suggested learning sequence

### Phase 1
Run the Java backend and understand the REST API.

### Phase 2
Build and run both Docker images.

### Phase 3
Push both images to Docker Hub.

### Phase 4
Deploy both applications to EKS.

### Phase 5
Install/configure AWS Load Balancer Controller and create the ALB.

### Phase 6
Connect GoDaddy -> Route 53 -> ALB.

### Phase 7
Configure Jenkins to build, push and deploy automatically.

### Phase 8
Add ACM/HTTPS.

### Phase 9
Practice production improvements: Secrets, RDS/PostgreSQL, HPA, image scanning, resource limits, monitoring, logging, rollback and GitOps.

## Cleanup

```bash
kubectl delete namespace ecommerce
```

Delete unused AWS lab resources as well to avoid charges.
