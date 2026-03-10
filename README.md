# JobBoard – Employers & Employees

A job search and job posting site with **employer** and **employee** roles, registration, login, and Bootstrap frontend with Mongoose (MongoDB) backend.

## Features

- **Registration & Login** – Separate flows for job seekers (employees) and employers
- **Employers** – Post jobs, edit/delete own jobs, view “My Jobs”
- **Employees** – Browse and search jobs, view job details
- **Bootstrap 5** – Responsive UI
- **Backend** – Node.js, Express, Mongoose, JWT auth

## Setup

### 1. MongoDB

Install and run MongoDB locally, or use a cloud URI (e.g. MongoDB Atlas).

### 2. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and set:

- `MONGODB_URI` – e.g. `mongodb://127.0.0.1:27017/jobboard`
- `JWT_SECRET` – Secret for JWT (use a strong value in production)

Start the server:

```bash
npm start
```

Server runs at **http://localhost:3000**. The same app serves the API and the static frontend.

### 3. Using the site

- **Home** – http://localhost:3000/ – Browse and search jobs
- **Register** – http://localhost:3000/register.html – Choose “Job Seeker” or “Employer”
- **Login** – http://localhost:3000/login.html
- **Post Job** – http://localhost:3000/post-job.html (employers only, after login)
- **My Jobs** – http://localhost:3000/my-jobs.html (employers only)

## API (examples)

- `POST /api/auth/register` – Register (body: name, email, password, role, company?, phone?)
- `POST /api/auth/login` – Login (body: email, password)
- `GET /api/auth/me` – Current user (Authorization: Bearer &lt;token&gt;)
- `GET /api/jobs` – List jobs (query: q, type, location, page, limit)
- `GET /api/jobs/:id` – Job detail
- `POST /api/jobs` – Create job (employer, auth)
- `PUT /api/jobs/:id` – Update job (employer, own only)
- `DELETE /api/jobs/:id` – Delete job (employer, own only)
- `GET /api/jobs/my/posted` – My posted jobs (employer, auth)
