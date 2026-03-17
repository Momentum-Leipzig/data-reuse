# Uni Leipzig Data Reuse

## Folders

# Frontend

- Created with Next.js
- Deploying the build only

# Backend

- Using PHP and GraphQL to access the MySQL database
- Test graphQL endpoint
  `curl -X POST https://research.uni-leipzig.de/leipzig-momentum-panel/api/public/index.php \
  -H "Content-Type: application/json" \
  -d '{"query": "{ hello }"}'
{"data":{"hello":"GraphQL is working!"}}`

## Deployment

- Run `bash deploy.sh` to deploy both frontend and backend
- Run `bash deploy.sh --frontend` to deploy only the frontend
- Run `bash deploy.sh --backend` to deploy only the backend
