pipeline {
    agent any

    environment {
        PROJECT_ID = "learning-481011"
        REGION     = "asia-south1"
        REPO       = "learning"

        IMAGE_PROD = "frontend-prod"
        IMAGE_STAG = "frontend-stag"

        TAG = "${env.GIT_COMMIT.take(7)}"
    }

    stages {

        stage("Git Checkout") {
            steps {
                checkout scm
            }
        }

        stage("Set Image Name") {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        env.IMAGE = IMAGE_PROD
                        echo "Main branch detected → Using PROD image"
                    } else {
                        env.IMAGE = IMAGE_STAG
                        echo "Non-main branch detected → Using STAG image"
                    }

                    env.IMAGE_REPO = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${env.IMAGE}"
                    env.IMAGE_TAG  = TAG
                    env.IMAGE_URL  = "${env.IMAGE_REPO}:${env.IMAGE_TAG}"

                    echo "Image Repo : ${env.IMAGE_REPO}"
                    echo "Image Tag  : ${env.IMAGE_TAG}"
                    echo "Image URL  : ${env.IMAGE_URL}"
                }
            }
        }

        stage("Set Frontend API URL") {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        env.FRONTEND_API_URL = "http://34.117.34.248"
                    } else {
                        env.FRONTEND_API_URL = "http://34.110.173.147"
                    }

                    echo "Using API URL: ${env.FRONTEND_API_URL}"
                }
            }
        }

        stage("Build Docker Image") {
            steps {
                sh """
                  docker build \
                    --build-arg VITE_API_BASE_URL=${env.FRONTEND_API_URL} \
                    -t ${env.IMAGE_URL} .
                """
            }
        }

        stage("Login to Artifact Registry") {
            steps {
                withCredentials([
                    file(credentialsId: "gcp-json", variable: "GCP_KEY")
                ]) {
                    sh '''
                      cat "$GCP_KEY" | docker login \
                        -u _json_key \
                        --password-stdin \
                        https://asia-south1-docker.pkg.dev
                    '''
                }
            }
        }

        stage("Push Image") {
            steps {
                sh "docker push ${env.IMAGE_URL}"
            }
        }

        stage("Update STAGING image tag") {
            when {
                branch 'dev'
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'git-pat',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    sh '''
                      rm -rf gitops
                      git clone https://$GIT_USER:$GIT_TOKEN@github.com/AayushChauhan1916/deveops-charts gitops
                      cd gitops

                      yq e -i '.image.repository = "'$IMAGE_REPO'"' services/frontend/values-staging.yaml
                      yq e -i '.image.tag = "'$IMAGE_TAG'"' services/frontend/values-staging.yaml

                      git config user.email "jenkins@ci"
                      git config user.name "jenkins"

                      git diff --quiet || git commit -am "staging: update image to ${IMAGE_TAG}"
                      git push
                    '''
                }
            }
        }

        stage("Update PRODUCTION image tag") {
            when {
                branch 'main'
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'git-pat',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    sh '''
                      rm -rf gitops
                      git clone https://$GIT_USER:$GIT_TOKEN@github.com/AayushChauhan1916/deveops-charts gitops
                      cd gitops

                      yq e -i '.image.repository = "'$IMAGE_REPO'"' services/frontend/values-production.yaml
                      yq e -i '.image.tag = "'$IMAGE_TAG'"' services/frontend/values-production.yaml

                      git config user.email "jenkins@ci"
                      git config user.name "jenkins"

                      git diff --quiet || git commit -am "prod: update image to ${IMAGE_TAG}"
                      git push
                    '''
                }
            }
        }
    }
}