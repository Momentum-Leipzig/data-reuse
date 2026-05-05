# Uni Leipzig Data Reuse

## Frontend

- Created with Next.js
- Deploying the build only
- Run locally `npm run dev`

## Backend

- Using PHP and GraphQL to access the MySQL database
- Terminal 1: Open SSH tunnel to forward port: `ssh -L 4406:localhost:4406 <user>@<internal-host> -N`
- Terminal 2: Run locally `php -S localhost:8080` in the backend folder
- Terminal 3: CURL endpoint
- Test graphQL endpoints
  curl -X POST https://research.uni-leipzig.de/leipzig-momentum-panel/api/public/index.php \
   -H "Content-Type: application/json" \
   -d '{"query": "{ hello }"}'

curl -X POST localhost:8080/public/index.php \
 -H "Content-Type: application/json" \
 -d '{"query": "{ hello }"}'

--> Get all studies
curl -X POST localhost:8080/public/index.php \
 -H "Content-Type: application/json" \
 -d '{"query": "{ studies { study_name title doi } }"}'

--> Get one study by name
curl -X POST localhost:8080/public/index.php \
 -H "Content-Type: application/json" \
 -d '{"query": "{ study(study_name: \"some_name\") { title publication_year journal } }"}'

- GraphiQL playground here: http://localhost:8080/public/graphiql.php (local only, not deployed)

### GraphQL Concepts Explained

The data flows like this:

Type (StudyType.php as reference) — Describes the shape of your data. Maps to a DB table. Each field = a column. It's like a contract: the frontend knows exactly what fields exist ("study has a name, title, doi...").

Resolver (StudyResolver.php as reference) — The function that actually fetches data. When a query asks for studies, the resolver runs the SQL and returns rows. This is where PDO queries live.

QueryType / Schema (QueryType.php as reference) — The root entry point. It wires together "query name" → "which type + which resolver". The Schema wraps the QueryType and is what GraphQL executes against.

Connection (Connection.php as reference) — A singleton PDO wrapper. Called by resolvers to get a database handle.

## Deployment

- Run `bash deploy.sh` to deploy both frontend and backend
- Run `bash deploy.sh --frontend` to deploy only the frontend
- Run `bash deploy.sh --backend` to deploy only the backend
