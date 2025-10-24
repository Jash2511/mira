# (Mira-Ex-Jira (MERN))[https://mira-ex-jira.vercel.app/]

A minimal Jira-like project/task manager built with the MERN stack. It supports:

- JWT authentication with MongoDB Atlas
- Organization-aware signup and login
  - Signup requires choosing one of: create an organization or join an existing one
  - Joining is allowed only if your email is invited to that organization
- Roles within organization: owner, member
- Organizations can invite members via email list (stored in DB; no email sending)
- Projects within an organization
- Tasks within a project (assign, status, delete)
- MVC architecture on the server (models, controllers, routes)
- Vite + React on the client (JSX)

## Monorepo layout

- client/ — Vite + React app
- server/ — Express API, MongoDB (Mongoose)

## Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string

## Setup

1) Clone the repo and install dependencies:

```
# From project root
cd server && npm install
cd ../client && npm install
```

2) Configure environment variables for the server:

Create `server/.env` with:

```
# Example values
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-secret
```

3) Start the backend:

```
cd server
npm start
# or: npm run dev  (if you add nodemon)
```

The API will be available at `http://localhost:4000` by default.

4) Configure the client API URL:

Create `client/.env` with:

```
VITE_API_URL=http://localhost:4000
```

5) Start the frontend:

```
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

## Core API routes (summary)

- Auth
  - POST `/api/auth/signup` — { name, email, password, orgAction: "create"|"join", orgName?, orgId?, inviteEmails?[] }
  - POST `/api/auth/login` — { email, password, orgName? or orgId? }
- Organizations
  - GET `/api/orgs/mine` — list organizations you belong to
  - POST `/api/orgs` — create an organization (auth required)
  - POST `/api/orgs/:orgId/invite` — add invite emails (owner only)
  - GET `/api/orgs/:orgId/members` — list members of your org
- Projects
  - POST `/api/projects` — create (org-scoped)
  - GET `/api/projects` — list (org-scoped)
  - DELETE `/api/projects/:id` — delete
- Tasks
  - POST `/api/tasks` — create (assign to member)
  - GET `/api/tasks?projectId=<id>` — list by project
  - PATCH `/api/tasks/:id/status` — update status
  - DELETE `/api/tasks/:id` — delete

Auth is via Bearer token returned by login/signup. The client stores it in `localStorage` and includes it in the `Authorization` header.

## Notes

- Organization membership is enforced across all routes; users can only act within their own organization.
- Email invites are stored as a list of strings in the `Organization` document. A user can only "join" an organization if their email is present in that list. On successful join, their email is removed from invite list and they are added to members.
- This starter does not send emails; it's focused on data model and flows.

## Development tips

- If you see CORS errors in the browser, ensure `CLIENT_ORIGIN` matches the dev URL (default `http://localhost:5173`).
- For production, configure secure secrets and origins, and consider using HTTPS and cookie-based auth if needed.


## Troubleshooting

- npm install fails in client with ERESOLVE about @react-three/fiber requiring React ^19:
  - This happens when @react-three/fiber v9 gets installed alongside React 18.
  - The project pins @react-three/fiber to a React 18–compatible release (8.x). If you still see the error, delete `client/node_modules` and `client/package-lock.json`, then run `npm install` again in the `client` directory.
- Node version: use Node 18+ (Node 20/22 is fine). If you use older Node versions, Vite may fail to install.

