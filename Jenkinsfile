pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'YOUR_DOCKERHUB_USERNAME'
        BACKEND_IMAGE = "${DOCKERHUB_USER}/ecommerce-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/ecommerce-frontend"
        AWS_REGION = 'ap-south-1'
        EKS_CLUSTER = 'YOUR_EKS_CLUSTER'
        NAMESPACE = 'ecommerce'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Test Backend') {
            steps { sh 'cd backend && mvn -B test' }
        }

        stage('Build Backend') {
            steps { sh 'cd backend && mvn -B clean package -DskipTests' }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    sh '''
                      docker build -f Dockerfile.backend -t $BACKEND_IMAGE:$IMAGE_TAG .
                      docker build -f Dockerfile.frontend -t $FRONTEND_IMAGE:$IMAGE_TAG .
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                      echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USER" --password-stdin
                      docker push "$BACKEND_IMAGE:$IMAGE_TAG"
                      docker push "$FRONTEND_IMAGE:$IMAGE_TAG"
                    '''
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                  aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER"

                  kubectl apply -f k8s/namespace.yaml
                  kubectl apply -f k8s/backend.yaml
                  kubectl apply -f k8s/frontend.yaml
                  kubectl apply -f k8s/ingress.yaml

                  kubectl -n "$NAMESPACE" set image deployment/ecommerce-backend                     backend="$BACKEND_IMAGE:$IMAGE_TAG"

                  kubectl -n "$NAMESPACE" set image deployment/ecommerce-frontend                     frontend="$FRONTEND_IMAGE:$IMAGE_TAG"

                  kubectl -n "$NAMESPACE" rollout status deployment/ecommerce-backend --timeout=180s
                  kubectl -n "$NAMESPACE" rollout status deployment/ecommerce-frontend --timeout=180s
                '''
            }
        }
    }
}
