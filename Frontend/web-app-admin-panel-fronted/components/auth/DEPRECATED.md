# ⚠️ DEPRECATED - DO NOT USE

This component (`SignInForm.tsx`) is **deprecated** and should not be used in the application.

## Why Deprecated?

1. **Uses axios directly** - Bypasses Redux Toolkit Query
2. **Hardcoded API endpoint** - Bypasses the Next.js API proxy
3. **Uses old Next.js Router** - `next/router` is deprecated in App Router
4. **No SSR support** - Uses localStorage instead of cookies
5. **Missing error handling** - Doesn't handle all error cases

## What to Use Instead

Use the **Redux-based login page**: `app/login/page.tsx`

### Example Usage:

```tsx
import { useLoginMutation } from "@/redux/features/auth/authApi";

const [login, { isLoading }] = useLoginMutation();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await login({ email, password }).unwrap();
    router.push("/dashboard");
  } catch (err) {
    setError(err.data?.message || "Login failed");
  }
};
```

## Migration Guide

If you're currently using this component:

1. Replace with `app/login/page.tsx`
2. Update any imports
3. Remove any direct axios calls
4. Use Redux hooks instead

## See Also

- `AUTH_SYSTEM.md` - Complete authentication documentation
- `app/login/page.tsx` - Current login implementation
- `redux/features/auth/authApi.ts` - Auth API endpoints
