pipeline {

    agent any
    // agent {
    //     dockerContainer {
    //         image 'maven:3.9.6-eclipse-temurin-17'
    //         args '-v /root/.m2:/root/.m2'
    //     }
    // }

    tools {
        jdk 'jdk17'
        maven 'mvn'
    }
    environment {
       // DOCKERHUB_USER = 'YOUR_DOCKERHUB_USERNAME'
        BACKEND_IMAGE = "280224036415.dkr.ecr.ap-south-1.amazonaws.com/dev/backend-image"
        FRONTEND_IMAGE = "280224036415.dkr.ecr.ap-south-1.amazonaws.com/dev/frontend-image"
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '280224036415'
        //EKS_CLUSTER = 'YOUR_EKS_CLUSTER'
        //NAMESPACE = 'ecommerce'
    }

    stages {
   
       stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/maroof49/DevOps-E-Commerce-Project.git'
            }
        }
        
        stage('Test Backend') {
            steps { sh 'cd backend && mvn -B test' }
        }

        stage('Build Backend') {
            steps { sh 'cd backend && mvn -B clean package -DskipTests' }
        }

        // stage('Build Docker Images') {
        //     steps {
        //         script {
                    
        //             env.IMAGE_TAG = sh(
        //                 script: 'git rev-parse --short HEAD',
        //                 returnStdout: true
        //             ).trim()
                    
        //             //def IMAGE_TAG = "${env.BUILD_NUMBER}"
        //             sh '''
        //               docker build -f Dockerfile.backend -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
        //               docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
        //             '''
        //         }
        //     }
        // }
    
        //     stage('Push to AWS ECR') {
        //     steps {
        //         withCredentials([amazonWebServicesCredentials(credentialsId: 'aws_credentials')]) {
        //             sh """
        //               aws ecr get-login-password --region ${AWS_REGION} | \
        //               docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com
                
        //               docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
        //               docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
        //             """
        //             }
        //         }
        //     }

        stage('Docker image Build & AWS ECR Push') {
            steps {
                script {
                    
                  env.IMAGE_TAG = sh(
                    script: 'git rev-parse --short HEAD',
                    returnStdout: true
                    ).trim()
                    
                    withAWS(credentials: 'aws_credentials', region: "ap-south-1") {
                        sh """
                          aws ecr get-login-password --region ap-south-1 | \
                          docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

                          docker build -f backend.Dockerfile -t ${BACKEND_IMAGE}:${IMAGE_TAG}
                          docker push ${BACKEND_IMAGE}:${IMAGE_TAG}

                            docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        """
                    }
                }
            }
        }
        // stage('Push Docker Images') {
        //     steps {
        //         withCredentials([usernamePassword(
        //             credentialsId: 'dockerhub-creds',
        //             usernameVariable: 'DOCKER_USER',
        //             passwordVariable: 'DOCKER_PASSWORD'
        //         )]) {
        //             sh '''
        //               echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USER" --password-stdin
        //               docker push "$BACKEND_IMAGE:$IMAGE_TAG"
        //               docker push "$FRONTEND_IMAGE:$IMAGE_TAG"
        //             '''
        //         }
        //     }
        // }

        // stage('Deploy to EKS') {
        //     steps {
        //         sh '''
        //           aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER"

        //           kubectl apply -f k8s/namespace.yaml
        //           kubectl apply -f k8s/backend.yaml
        //           kubectl apply -f k8s/frontend.yaml
        //           kubectl apply -f k8s/ingress.yaml

        //           kubectl -n "$NAMESPACE" set image deployment/ecommerce-backend                     backend="$BACKEND_IMAGE:$IMAGE_TAG"

        //           kubectl -n "$NAMESPACE" set image deployment/ecommerce-frontend                     frontend="$FRONTEND_IMAGE:$IMAGE_TAG"

        //           kubectl -n "$NAMESPACE" rollout status deployment/ecommerce-backend --timeout=180s
        //           kubectl -n "$NAMESPACE" rollout status deployment/ecommerce-frontend --timeout=180s
        //         '''
        //     }
     }
}


        
