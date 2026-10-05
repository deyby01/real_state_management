# Backend

Backend for the Real Estate Management project. See the [main README](../README.md) for team and course information, and for how to run the whole project with Docker.

## Status

**Basic setup.** An [Express](https://expressjs.com/) server connected to [MongoDB](https://www.mongodb.com/) through [Mongoose](https://mongoosejs.com/). The only route for now is a health check.

| Method | Route | Response |
|---|---|---|
| GET | `/api/health` | `{"status":"ok"}` when the server is running |

## Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js      # Connects to MongoDB using MONGO_URI
│   ├── app.js         # Express app: middlewares and routes
│   └── index.js       # Entry point: connects to the database and starts the server
├── .env.example       # Template for the environment variables
├── Dockerfile         # Image used by docker-compose.yml
└── package.json
```

## Environment variables

The server reads its configuration from environment variables, so the same code works with and without Docker.

| Variable | Description | Without Docker | With Docker |
|---|---|---|---|
| `PORT` | Port where Express listens | `4000` | `4000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/real_estate` | `mongodb://mongo:27017/real_estate` |

- **With Docker** you don't need to do anything: `docker-compose.yml` sets these variables. Inside Docker, `mongo` is the name of the database service, not `localhost`.
- **Without Docker**, create your local `.env` from the template:
  ```bash
  cp .env.example .env
  ```

`.env` is ignored by git, so never commit it. If you add a new variable, also add it to `.env.example` so the rest of the team knows it exists.

## Running without Docker

Requirements: Node.js 22.9 or newer (LTS recommended), and MongoDB running on `localhost:27017`.

```bash
cp .env.example .env
npm install
npm run dev
```

`npm run dev` uses nodemon, so the server restarts every time you save a file.
