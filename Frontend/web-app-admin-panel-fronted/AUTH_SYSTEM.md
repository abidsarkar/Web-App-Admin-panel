# Authentication System Documentation

## Overview

This admin panel uses **Redux Toolkit (RTK Query)** for all API calls, including authentication. All requests go through a **Next.js API Proxy** to hide the backend endpoint from the client.

## Architecture

### 1. API Proxy (`/api/proxy`)

- **Location**: `app/api/proxy/[...path]/route.ts`
- **Purpose**: Forwards all client requests to the backend, hiding the real backend URL
- **Backend URL**: `http://localhost:5001/api/v1` (configurable via `BACKEND_URL` env variable)
- **Client sees**: `http://localhost:3000/api/proxy/...`

### 2. Redux Toolkit Query

- **Base API**: `redux/api/baseApi.ts`
- **Auth API**: `redux/features/auth/authApi.ts`
- **Base URL**: `/api/proxy` (goes through Next.js proxy)

### 3. Token Management

- **Access Token**: Stored in cookies (`accessToken`) - used by middleware for SSR
- **Refresh Token**: Stored in cookies (`refreshToken`) - managed by backend
- **Cookie Settings**: HttpOnly, Secure (in production), SameSite=Strict

## Authentication Flow

### Login Flow

1. User submits email/password via `app/login/page.tsx`
2. Redux calls `useLoginMutation` → `/api/proxy/auth/login`
3. Proxy forwards to backend → `http://localhost:5001/api/v1/auth/login`
4. Backend returns tokens in cookies
5. Frontend stores `accessToken` cookie
6. Middleware (`middleware.ts`) checks cookie for protected routes
7. User redirected to `/dashboard`

### Token Refresh (Automatic)

The backend automatically refreshes tokens via the `refreshToken` cookie. The frontend doesn't need to manually call refresh - it's handled by the backend middleware.

### Logout Flow

1. User clicks logout
2. Redux calls `useLogoutMutation` → `/api/proxy/auth/logout`
3. Backend clears all cookies
4. User redirected to `/login`

## Available Auth Endpoints

All endpoints are available via Redux hooks:

```typescript
import {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyForgotPasswordOTPMutation,
  useChangePasswordMutation,
  useChangePasswordFromProfileMutation,
  useRefreshTokenMutation,
  useResendOTPMutation,
} from "@/redux/features/auth/authApi";
```

### Endpoints

| Hook                                   | Endpoint                           | Purpose                        |
| -------------------------------------- | ---------------------------------- | ------------------------------ |
| `useLoginMutation`                     | `/auth/login`                      | Login with email/password      |
| `useLogoutMutation`                    | `/auth/logout`                     | Logout and clear cookies       |
| `useForgotPasswordMutation`            | `/auth/forgot-password`            | Send OTP to email              |
| `useVerifyForgotPasswordOTPMutation`   | `/auth/verify-forgot-password-otp` | Verify OTP code                |
| `useChangePasswordMutation`            | `/auth/change-password`            | Change password after OTP      |
| `useChangePasswordFromProfileMutation` | `/auth/change-pass-from-profile`   | Change password when logged in |
| `useRefreshTokenMutation`              | `/auth/refresh-token`              | Manually refresh access token  |
| `useResendOTPMutation`                 | `/auth/resend-otp`                 | Resend OTP code                |

## Pages

### Login Page

- **Location**: `app/login/page.tsx`
- **Uses**: Redux (`useLoginMutation`)
- **Features**: Email/password form, error handling, auto-redirect

### Forgot Password Page

- **Location**: `app/forgot-password/page.tsx`
- **Uses**: Redux (multiple mutations)
- **Features**: 3-step flow (Email → OTP → New Password), Resend OTP button
- **Steps**:
  1. Enter email → Send OTP
  2. Enter OTP → Verify (with Resend button)
  3. Enter new password → Reset

### Dashboard (Protected)

- **Location**: `app/dashboard/page.tsx`
- **Protection**: Middleware checks `accessToken` cookie
- **Redirect**: Unauthenticated users → `/login`

## Middleware Protection

**File**: `middleware.ts`

**Protected Routes**:

- `/dashboard/*` - Requires authentication
- `/` - Redirects to `/dashboard` if logged in, `/login` if not

**Public Routes**:

- `/login` - Redirects to `/dashboard` if already logged in
- `/forgot-password` - Always accessible

## ⚠️ Deprecated Components

### `components/auth/SignInForm.tsx` - DO NOT USE

This component is **deprecated** and should not be used. It uses:

- Direct axios calls (bypasses Redux)
- Hardcoded API endpoints (bypasses proxy)
- Old Router from `next/router` (deprecated in Next.js 13+)

**Use instead**: `app/login/page.tsx` which uses Redux and the proxy.

## Environment Variables

### Frontend (.env.local)

```env
# Not needed - proxy uses relative URLs
```

### Backend (.env)

```env
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

## Security Features

1. **Hidden Backend URL**: Client never sees real backend endpoint
2. **HttpOnly Cookies**: Tokens not accessible via JavaScript
3. **CORS Protection**: Backend only accepts requests from configured frontend
4. **Middleware Protection**: Server-side route protection (SSR-compatible)
5. **Automatic Token Refresh**: Backend handles token refresh transparently

## Common Issues & Solutions

### Issue: "Invalid credentials" after adding proxy

**Solution**: Ensure `content-length` header is deleted in proxy (already fixed)

### Issue: Cookies not being set

**Solution**:

- Check `FRONTEND_URL` in backend `.env` matches your frontend URL
- Ensure `credentials: 'include'` in `baseApi.ts` (already configured)

### Issue: Middleware not protecting routes

**Solution**: Check that `accessToken` cookie is being set after login

### Issue: Can't login after refresh

**Solution**: Backend automatically uses `refreshToken` cookie. If it fails, user must login again.

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (see error)
- [ ] Logout (cookies cleared, redirected to login)
- [ ] Access `/dashboard` without login (redirected to login)
- [ ] Forgot password flow (all 3 steps)
- [ ] Resend OTP button works
- [ ] Refresh page while logged in (stay logged in)
- [ ] Network tab shows `/api/proxy/...` URLs (not `localhost:5001`)

## Future Enhancements

1. **Automatic Token Refresh UI**: Show notification when token is refreshed
2. **Session Timeout Warning**: Warn user before session expires
3. **Remember Me**: Extend cookie expiration for "Keep me logged in"
4. **2FA Support**: Add two-factor authentication option
