import type { UserRole } from "@prisma/client"

/**
 * Get the landing page URL based on user role
 * This serves as the central redirection point for all modules
 */
export function getLandingPageByRole(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/dashboard"
    
    case "STORE_OWNER":
    case "STORE_MANAGER":
      return "/store"
    
    case "KITCHEN_STAFF":
      return "/dashboard/kitchen"
    
    case "DRIVER":
      return "/driver"
    
    default:
      return "/dashboard"
  }
}

/**
 * Get the module name for a role (for display purposes)
 */
export function getModuleNameByRole(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "Admin Dashboard"
    
    case "STORE_OWNER":
    case "STORE_MANAGER":
      return "Store Portal"
    
    case "KITCHEN_STAFF":
      return "Kitchen Module"
    
    case "DRIVER":
      return "Driver App"
    
    default:
      return "Dashboard"
  }
}

/**
 * Get the default module path for a role
 */
export function getModulePath(role: UserRole): string {
  return getLandingPageByRole(role)
}

