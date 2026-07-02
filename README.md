# KUN HUNDAI BACKEND

Simple backend for user signup, login, profile, and password reset.

## What this project does

- Creates users using Supabase Auth
- Saves user details in PostgreSQL using Prisma
- Lets users log in and get access and refresh tokens
- Protects private routes with access token checks
- Supports forgot-password and reset-password flow

## Quick start

1. Install packages

```bash
npm install
```

2. Create a .env file in the project root

Use these keys:

```env
NODE_ENV=dev
BASE_URL=localhost
PORT=3000

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_DATABASE_URL=your_database_connection_string
```

3. Prepare database

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
```

4. Start server

```bash
npm run dev
```

Server runs on: http://localhost:3000

## API base URL

Use this prefix for all endpoints:

http://localhost:3000/api

## Auth and token rules (important)

After login, backend returns:

- accessToken
- refreshToken

Frontend must follow these rules:

1. Save both tokens in secure storage.
2. Overwrite stored accessToken on every successful login.
3. Overwrite stored refreshToken whenever a new refreshToken is returned.

Why overwrite refreshToken:

- Supabase rotates refresh tokens.
- Keeping an old refreshToken can break future login/session actions.

## Protected routes

Any route using verifyJWT needs this header:

Authorization: Bearer <accessToken>

Current protected routes:

- GET /api/auth/profile
- DELETE /api/auth/delete

Note:

- DELETE /api/auth/delete also checks role.
- Only ADMIN can use this route.

## Auth endpoints

### Register

- Method: POST
- URL: /api/auth/register
- Auth header: Not required

Request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "fullName": "Test User",
  "phoneNumber": "0000000000",
  "role": "EMPLOYEE"
}
```

Allowed role values:

- ADMIN
- EMPLOYEE

If role is not sent, backend uses EMPLOYEE.

### Login

- Method: POST
- URL: /api/auth/login
- Auth header: Not required

Request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

### Logout

- Method: POST
- URL: /api/auth/logout
- Auth header: Not required in current implementation

### Get current user profile

- Method: GET
- URL: /api/auth/profile
- Auth header: Required

Header example:

```http
Authorization: Bearer <accessToken>
```

### Forgot password

- Method: POST
- URL: /api/auth/forgot-password
- Auth header: Not required

Request body:

```json
{
  "email": "user@example.com"
}
```

### Reset password

- Method: POST
- URL: /api/auth/reset-password
- Auth header: Not required

Request body:

```json
{
  "accessToken": "token_from_recovery_link",
  "refreshToken": "refresh_token_from_recovery_link",
  "newPassword": "NewStrongPass123"
}
```

### Delete user (admin only)

- Method: DELETE
- URL: /api/auth/delete
- Auth header: Required
- Role required: ADMIN

Header example:

```http
Authorization: Bearer <accessToken>
```

Request body:

```json
{
  "identifier": "user@example.com"
}
```

Identifier can be:

- User email
- User phone number

## Password reset flow for frontend

1. Call forgot-password.
2. User gets email from Supabase.
3. User opens link that includes recovery tokens in the URL hash.
4. Frontend reads access_token and refresh_token from that URL.
5. Frontend sends those tokens to POST /api/auth/reset-password with newPassword.

Example link format:

<frontend_url>/reset-password#access_token=...&refresh_token=...&type=recovery

## Health check

- Method: GET
- URL: /api/health

## Helpful scripts

```bash
npm run dev
npm run prisma-reset
```
