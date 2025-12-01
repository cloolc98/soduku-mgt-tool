# SodukuMgtTool

This project was generated using Angular version 20.3.8.

## Development server in local with either one from two approaches

### Approach 1: 
To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.


#### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Approach 2: Docker Build & Deploy
This project includes a production-ready Docker setup. It uses a multi-stage build to compile the Angular application and serves it using a lightweight Node.js static server (http-server).

#### Prerequisites : 
Docker installed on your machine.

#### Configuration
You can customize the network settings using environment variables. Create a file named .env (or a custom name like env_vars.env) in the root directory:

HOST_IP: The network interface on your computer to bind to 0.0.0.0: Public; or 127.0.0.1: Private.
HOST_PORT: The port access the app (Default: 10000).
CONTAINER_PORT: The internal port the container listens on (Default: 10000).

#### Running with Docker Compose
Using a custom environment file if you have a specific config file (e.g., env_vars.env)
```bash
docker compose --env-file env_vars.env up -d --build
```
        
Stopping the container:
```bash
docker compose down
```

#### Manual Docker Commands
Build the Image:
```bash
docker build -t your-image-name .
```

Run the Container:
```bash
docker run --env-file env_vars.env -p configured-host-port:configured-container-port your-image-name
```

## Development server with GitHub Actions to AWS(ECR as an example)
```bash
name: Deploy to Amazon ECR

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1                   
  ECR_REPOSITORY: soduku-mgt-tool         

jobs:
  build-and-push:
    name: Build and Push Image
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        # Build the docker image
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        
        # Push the specific tag and 'latest' tag
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
        
        echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
```