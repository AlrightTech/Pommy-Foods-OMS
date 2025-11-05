import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env.local (priority) or .env
// This ensures environment variables are loaded before Prisma Client initialization
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create initial admin user
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@pommyfoods.com" },
    update: {},
    create: {
      email: "admin@pommyfoods.com",
      name: "Admin User",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  })

  console.log("Created admin user:", admin.email)

  // Create system user for auto-generated orders
  const systemPassword = process.env.SYSTEM_USER_PASSWORD || "system-password-change-me"
  const systemPasswordHash = await bcrypt.hash(systemPassword, 10)

  const systemUser = await prisma.user.upsert({
    where: { email: "system@pommyfoods.com" },
    update: {},
    create: {
      email: "system@pommyfoods.com",
      name: "System",
      passwordHash: systemPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  })

  console.log("Created system user:", systemUser.email)

  // Create sample store (use findFirst + create/update since name is not unique)
  let store = await prisma.store.findFirst({
    where: { name: "Sample Store" },
  })

  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "Sample Store",
        contactName: "John Doe",
        email: "store@example.com",
        phone: "+1 234-567-8900",
        address: "123 Main Street",
        city: "New York",
        region: "NYC",
        creditLimit: 10000,
        paymentTerms: 30,
        isActive: true,
      },
    })
  }

  console.log("Created sample store:", store.name)

  // Create sample products
  const products = [
    {
      name: "Pommy Meal - Chicken",
      sku: "PM-CH-001",
      description: "Delicious chicken meal",
      price: 12.99,
      unit: "unit",
      category: "Meals",
      shelfLife: 7,
      storageTempMin: 2,
      storageTempMax: 8,
      isActive: true,
    },
    {
      name: "Pommy Meal - Beef",
      sku: "PM-BF-001",
      description: "Delicious beef meal",
      price: 14.99,
      unit: "unit",
      category: "Meals",
      shelfLife: 7,
      storageTempMin: 2,
      storageTempMax: 8,
      isActive: true,
    },
    {
      name: "Pommy Meal - Vegetarian",
      sku: "PM-VEG-001",
      description: "Delicious vegetarian meal",
      price: 11.99,
      unit: "unit",
      category: "Meals",
      shelfLife: 7,
      storageTempMin: 2,
      storageTempMax: 8,
      isActive: true,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }

  console.log(`Created ${products.length} sample products`)

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

