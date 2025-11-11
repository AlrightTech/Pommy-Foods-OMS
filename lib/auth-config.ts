/**
 * NextAuth Configuration Validation
 * Validates required environment variables and provides helpful error messages
 */

export function validateAuthConfig() {
  const errors: string[] = []
  const warnings: string[] = []

  // Check NEXTAUTH_SECRET
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    errors.push("NEXTAUTH_SECRET is not set. This is required for authentication.")
  } else if (secret.length < 32) {
    errors.push(
      `NEXTAUTH_SECRET is too short (${secret.length} characters). It must be at least 32 characters.`
    )
  }

  // Check NEXTAUTH_URL
  const url = process.env.NEXTAUTH_URL
  if (!url) {
    // In development, we can auto-detect, but warn
    if (process.env.NODE_ENV === "production") {
      errors.push(
        "NEXTAUTH_URL is not set. This is required in production. Set it to your application URL (e.g., https://your-app.vercel.app)"
      )
    } else {
      warnings.push(
        "NEXTAUTH_URL is not set. Using default: http://localhost:3000. Set this in production."
      )
    }
  } else {
    // Validate URL format
    try {
      const urlObj = new URL(url)
      if (urlObj.pathname !== "/" || url.endsWith("/")) {
        warnings.push(
          "NEXTAUTH_URL should not have a trailing slash or path. Use: https://your-app.vercel.app"
        )
      }
    } catch {
      errors.push(
        `NEXTAUTH_URL is invalid: "${url}". It must be a valid URL (e.g., https://your-app.vercel.app)`
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    secret: secret || undefined,
    url: url || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined),
  }
}

/**
 * Get validated auth configuration
 * Throws an error if configuration is invalid
 */
export function getAuthConfig() {
  const validation = validateAuthConfig()

  if (!validation.isValid) {
    const errorMessage = [
      "NextAuth configuration is invalid:",
      ...validation.errors,
      "",
      "To fix this:",
      "1. Set NEXTAUTH_SECRET (generate with: openssl rand -base64 32)",
      "2. Set NEXTAUTH_URL to your application URL",
      "3. Restart your development server or redeploy",
    ].join("\n")

    throw new Error(errorMessage)
  }

  // Log warnings in development
  if (process.env.NODE_ENV === "development" && validation.warnings.length > 0) {
    console.warn("NextAuth Configuration Warnings:")
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`))
  }

  return {
    secret: validation.secret!,
    url: validation.url,
  }
}

