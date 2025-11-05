#!/usr/bin/env node

/**
 * Environment Variable Checker
 * Checks if required environment variables are set
 */

const fs = require("fs")
const path = require("path")

const requiredVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]

console.log("Checking environment variables...\n")

// Check .env.local
const envLocalPath = path.join(process.cwd(), ".env.local")
const envPath = path.join(process.cwd(), ".env")

let envFile = null
if (fs.existsSync(envLocalPath)) {
  envFile = envLocalPath
  console.log("✓ Found .env.local")
} else if (fs.existsSync(envPath)) {
  envFile = envPath
  console.log("✓ Found .env")
} else {
  console.log("✗ No .env.local or .env file found")
  console.log("\nPlease create .env.local file with required variables:")
  console.log("  DATABASE_URL=...")
  console.log("  NEXTAUTH_SECRET=...")
  console.log("  NEXTAUTH_URL=...")
  process.exit(1)
}

// Load and check variables
const envContent = fs.readFileSync(envFile, "utf-8")
const envVars = {}
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=")
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join("=").replace(/^["']|["']$/g, "").trim()
    }
  }
})

console.log("\nChecking required variables:\n")

let allPresent = true
requiredVars.forEach((varName) => {
  const value = process.env[varName] || envVars[varName]
  if (value) {
    const displayValue = varName === "DATABASE_URL" 
      ? value.replace(/:[^:@]+@/, ":****@") 
      : value.length > 20 
        ? value.substring(0, 20) + "..." 
        : value
    console.log(`  ✓ ${varName}: ${displayValue}`)
  } else {
    console.log(`  ✗ ${varName}: MISSING`)
    allPresent = false
  }
})

if (!allPresent) {
  console.log("\n⚠️  Some required environment variables are missing!")
  console.log("Please update your .env.local file with the missing variables.")
  process.exit(1)
}

console.log("\n✅ All required environment variables are present!")
process.exit(0)

