# Landing Page Setup - Central Redirection Point

## Overview

A central landing page has been created at the root (`/`) that serves as the redirection point for all modules. This page automatically redirects authenticated users to their role-specific module.

## How It Works

### 1. **Landing Page (`app/page.tsx`)**
   - **For Unauthenticated Users**: Displays a welcome page with module cards
   - **For Authenticated Users**: Automatically redirects to their role-specific module

### 2. **Role-Based Redirects**

The landing page uses `lib/utils/role-redirect.ts` to determine where each role should be redirected:

| Role | Landing Page | Module |
|------|-------------|--------|
| `SUPER_ADMIN` | `/dashboard` | Admin Dashboard |
| `ADMIN` | `/dashboard` | Admin Dashboard |
| `STORE_OWNER` | `/store` | Store Portal |
| `STORE_MANAGER` | `/store` | Store Portal |
| `KITCHEN_STAFF` | `/dashboard/kitchen` | Kitchen Module |
| `DRIVER` | `/driver` | Driver App |

### 3. **Login Flow**

When a user logs in:
1. User authenticates via `/login`
2. After successful login, redirects to `/` (landing page)
3. Landing page detects authentication and user role
4. Automatically redirects to the appropriate module

### 4. **Callback URL Support**

If a user tries to access a protected route while not logged in:
- They are redirected to `/login?callbackUrl=/dashboard/orders`
- After login, they are redirected to the original requested page
- If no callback URL, they go to the landing page which redirects to their module

## Files Created/Modified

### Created
- `lib/utils/role-redirect.ts` - Utility functions for role-based redirects

### Modified
- `app/page.tsx` - Central landing page with automatic redirect
- `app/login/page.tsx` - Updated to redirect to landing page after login
- `middleware.ts` - Ensures root path is accessible

## Features

### Landing Page Features
- ✅ **Automatic Redirect**: Authenticated users are automatically redirected
- ✅ **Module Cards**: Unauthenticated users see cards for each module
- ✅ **Loading States**: Shows loading indicator during redirect
- ✅ **Responsive Design**: Works on all device sizes

### Security
- ✅ **Protected Routes**: All module routes require authentication
- ✅ **Role-Based Access**: Middleware can enforce role-based routing (optional)
- ✅ **Session Management**: Uses NextAuth session for authentication

## Usage

### For Users
1. Visit the root URL (`/`)
2. If logged in, automatically redirected to your module
3. If not logged in, see module cards and click "Sign In"

### For Developers
```typescript
import { getLandingPageByRole, getModuleNameByRole } from "@/lib/utils/role-redirect"

// Get landing page for a role
const landingPage = getLandingPageByRole("STORE_OWNER") // Returns "/store"

// Get module name for display
const moduleName = getModuleNameByRole("DRIVER") // Returns "Driver App"
```

## Testing

### Test Scenarios
1. **Unauthenticated User**
   - Visit `/` → Should see landing page with module cards
   - Click "Sign In" → Should go to login page

2. **Authenticated Admin**
   - Visit `/` → Should automatically redirect to `/dashboard`

3. **Authenticated Store Owner**
   - Visit `/` → Should automatically redirect to `/store`

4. **Authenticated Driver**
   - Visit `/` → Should automatically redirect to `/driver`

5. **Login Flow**
   - Login successfully → Should redirect to `/` → Then to role-specific module

## Next Steps (Optional Enhancements)

1. **Role-Based Middleware Enforcement**
   - Add middleware rules to prevent users from accessing wrong modules
   - Example: Driver accessing `/dashboard` should redirect to `/driver`

2. **Landing Page Customization**
   - Add statistics or announcements
   - Show recent activity for authenticated users
   - Add quick action buttons

3. **Multi-Module Support**
   - Allow users with multiple roles to choose their module
   - Show module switcher in header

## Status

✅ **COMPLETE** - Landing page is fully functional and ready for use.

---

**Last Updated**: 2024  
**Status**: ✅ Production Ready

