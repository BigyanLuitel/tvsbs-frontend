# TVSBS Frontend

This repository is the frontend application for the Tamor Valley Secondary Boarding School (TVSBS) management system. It is built with Next.js and provides role-based dashboards for administrators, teachers, and students.

The app acts as the web client for the school's backend API and handles authentication, access control, attendance, fees, results, library operations, assignments, and school administration workflows.

## Project purpose

TVSBS is a school management portal designed to help different user groups work within the same system:

- Admins manage students, teachers, classes, fees, results, attendance, library resources, and reports.
- Teachers manage classes, attendance, assignments, and question papers.
- Students view attendance, assignments, and results.

The frontend is connected to the backend through a Django API configured via the environment variable `DJANGO_API_URL`.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts for charts and dashboard analytics
- React Markdown and KaTeX support for rich content and AI/report-related features

## Core features

### Authentication and access control

- Login page for email/password authentication
- Role-based redirect after login: `ADMIN`, `TEACHER`, or `STUDENT`
- JWT cookie-based auth handling with access and refresh tokens
- Middleware enforcing route access by user role

### Admin dashboard

- Overview dashboard with student, teacher, class, attendance, and invoice summary data
- Class-wise student counts
- Fee status breakdown
- Attendance trend chart
- Quick links for common administrative actions

### Teacher features

- Attendance tracking
- Assignment management
- Question paper support
- Results and performance views

### Student features

- Student dashboard
- Attendance overview
- Assignments
- Results

### School operations modules

The app includes pages and API routes for:

- Academics: classes and subjects
- Attendance
- Students and teachers
- Fees: categories, structures, invoices, and student assignments
- Library: books and circulations
- Results and publication status
- Reports
- AI assistant and question paper generation endpoints

## Project structure

```text
app/
  admin/                 # Admin dashboard and admin-only pages
  teacher/               # Teacher dashboard and teacher pages
  student/               # Student dashboard and student pages
  login/                 # Login UI
  api/                   # Next.js API routes that proxy backend requests
  lib/                   # Shared auth and Django fetch helpers
  components/            # Reusable UI pieces such as dashboard layout and logout
middleware.ts           # Role-based route protection
public/                 # Static assets such as branding images
next.config.ts
package.json
.eslintrc / eslint.config.mjs
```

## Environment setup

Create a local environment file named `.env.local` in the project root with the API base URL of the backend service:

```env
DJANGO_API_URL=http://localhost:8000
```

This application expects the backend Django server to be running locally at that address.

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Useful scripts

```bash
npm run dev     # start local development server
npm run build   # production build
npm run start   # run production server
npm run lint    # run ESLint checks
```

## Authentication flow

The login flow works as follows:

1. User submits email and password from the login page.
2. The frontend calls `/api/login`.
3. The API route sends the request to the Django backend at `/api/auth/login/`.
4. If successful, the backend returns access and refresh tokens plus the user role.
5. Cookies are set for the access token, refresh token, and role.
6. The user is redirected to the matching dashboard.

The middleware checks the role cookie to restrict access to `/admin`, `/teacher`, and `/student` routes.

## API integration notes

The app uses a helper in `app/lib/django-fetch.ts` to proxy authenticated requests to the Django backend. If a request receives a `401`, the helper attempts to refresh the access token using the refresh token before retrying.

## Notes

- This project is intended to be paired with a Django backend service.
- Branding and UI styling are school-specific, including the TVSBS crest and color scheme.
- The app is structured for role-based school administration rather than a generic SaaS or consumer application.

## License

This project currently has no explicit license file in the repository. If you are contributing or deploying it, confirm the legal ownership and licensing requirements with the project owner before distribution.
