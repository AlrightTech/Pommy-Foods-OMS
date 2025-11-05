# Pommy Foods - Database Schema Documentation

## Overview

This document describes the complete database schema for the Pommy Foods Digital Distribution System.

**Database:** PostgreSQL  
**ORM:** Prisma  
**Schema File:** `prisma/schema.prisma`

---

## Schema Summary

- **Total Models:** 15
- **Total Enums:** 8
- **Database:** PostgreSQL
- **Relationships:** Fully configured with foreign keys
- **Indexes:** Optimized for query performance

---

## Models

### 1. User & Authentication

**Model:** `User`

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  passwordHash  String
  role          UserRole
  storeId       String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  store         Store?   @relation(fields: [storeId], references: [id])
  orders        Order[]
  deliveries    Delivery[]
  createdBy     User?    @relation("CreatedBy", fields: [createdById], references: [id])
  createdById   String?
  createdUsers  User[]   @relation("CreatedBy")
  approvedOrders Order[] @relation("ApprovedOrders")
}
```

**Fields:**
- `id` - Unique identifier (CUID)
- `email` - User email (unique)
- `name` - User full name
- `passwordHash` - Bcrypt hashed password
- `role` - User role (enum)
- `storeId` - Optional store assignment
- `isActive` - Account status
- `createdAt`, `updatedAt` - Timestamps

**Relationships:**
- `store` → Store (many-to-one, optional)
- `orders` → Order[] (orders created by user)
- `deliveries` → Delivery[] (deliveries assigned to driver)
- `createdBy` → User (self-relation for user creation tracking)
- `approvedOrders` → Order[] (orders approved by admin)

**Enum:** `UserRole`
- `SUPER_ADMIN`
- `ADMIN`
- `STORE_OWNER`
- `STORE_MANAGER`
- `KITCHEN_STAFF`
- `DRIVER`

---

### 2. Store Management

**Model:** `Store`

```prisma
model Store {
  id                String   @id @default(cuid())
  name              String
  contactName       String
  email             String?
  phone             String
  address           String
  city              String
  region            String
  latitude          Float?
  longitude         Float?
  creditLimit       Decimal  @default(0)
  paymentTerms      Int      @default(30) // days
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  users             User[]
  orders            Order[]
  stockLevels       StoreStock[]
  invoices          Invoice[]
  deliveries        Delivery[]
  returns           Return[]
  temperatureLogs   TemperatureLog[]
}
```

**Fields:**
- `id` - Unique identifier
- `name` - Store name
- `contactName` - Primary contact person
- `email` - Contact email (optional)
- `phone` - Contact phone
- `address`, `city`, `region` - Location
- `latitude`, `longitude` - GPS coordinates (optional)
- `creditLimit` - Credit limit in currency
- `paymentTerms` - Payment terms in days (default: 30)
- `isActive` - Store status

**Relationships:**
- `users` → User[] (store employees)
- `orders` → Order[] (all orders for this store)
- `stockLevels` → StoreStock[] (inventory levels)
- `invoices` → Invoice[] (all invoices)
- `deliveries` → Delivery[] (all deliveries)
- `returns` → Return[] (all returns)
- `temperatureLogs` → TemperatureLog[] (temperature records)

---

### 3. Product Catalog

**Model:** `Product`

```prisma
model Product {
  id              String   @id @default(cuid())
  name            String
  sku             String   @unique
  description     String?
  price           Decimal
  unit            String   @default("unit")
  category        String?
  shelfLife       Int      // days
  storageTempMin  Float?   // Celsius
  storageTempMax  Float?   // Celsius
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  orderItems      OrderItem[]
  stockLevels     StoreStock[]
  returns         ReturnItem[]
  kitchenItems    KitchenSheetItem[]
}
```

**Fields:**
- `id` - Unique identifier
- `name` - Product name
- `sku` - Stock Keeping Unit (unique)
- `description` - Product description (optional)
- `price` - Unit price
- `unit` - Unit of measurement (default: "unit")
- `category` - Product category (optional)
- `shelfLife` - Shelf life in days
- `storageTempMin`, `storageTempMax` - Temperature range in Celsius (optional)
- `isActive` - Product status

**Relationships:**
- `orderItems` → OrderItem[]
- `stockLevels` → StoreStock[]
- `returns` → ReturnItem[]
- `kitchenItems` → KitchenSheetItem[]

---

### 4. Stock Management

**Model:** `StoreStock`

```prisma
model StoreStock {
  id              String   @id @default(cuid())
  storeId         String
  productId       String
  currentLevel    Int
  threshold       Int      @default(10)
  lastUpdated     DateTime @default(now())
  updatedBy       String?  // userId
  
  store           Store    @relation(fields: [storeId], references: [id])
  product         Product  @relation(fields: [productId], references: [id])
  
  @@unique([storeId, productId])
  @@index([storeId])
  @@index([productId])
}
```

**Fields:**
- `id` - Unique identifier
- `storeId` - Store reference
- `productId` - Product reference
- `currentLevel` - Current stock quantity
- `threshold` - Reorder threshold (default: 10)
- `lastUpdated` - Last update timestamp
- `updatedBy` - User who last updated (optional)

**Constraints:**
- Unique constraint on `[storeId, productId]` (one stock record per store-product)
- Indexes on `storeId` and `productId` for query performance

---

### 5. Order Management

**Model:** `Order`

```prisma
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  storeId         String
  createdById     String
  status          OrderStatus @default(DRAFT)
  orderType       OrderType   @default(MANUAL)
  totalAmount     Decimal
  notes           String?
  autoGeneratedAt DateTime?   // when auto-generated
  approvedById    String?
  approvedAt      DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  store           Store       @relation(fields: [storeId], references: [id])
  createdBy      User        @relation(fields: [createdById], references: [id])
  approvedBy     User?       @relation("ApprovedOrders", fields: [approvedById], references: [id])
  items          OrderItem[]
  kitchenSheet   KitchenSheet?
  delivery       Delivery?
  invoice        Invoice?
}
```

**Fields:**
- `id` - Unique identifier
- `orderNumber` - Unique order number (e.g., "ORD-20240115-0001")
- `storeId` - Store reference
- `createdById` - User who created the order
- `status` - Order status (enum)
- `orderType` - Order type (enum)
- `totalAmount` - Total order amount
- `notes` - Additional notes (optional)
- `autoGeneratedAt` - Timestamp if auto-generated
- `approvedById` - Admin who approved (optional)
- `approvedAt` - Approval timestamp (optional)

**Enum:** `OrderStatus`
- `DRAFT` - Auto-generated, pending admin review
- `PENDING` - Submitted by store, pending admin approval
- `APPROVED` - Approved by admin, ready for kitchen
- `KITCHEN_PREP` - Kitchen sheet generated, being prepared
- `READY` - Ready for delivery
- `IN_DELIVERY` - Out for delivery
- `DELIVERED` - Delivered to store
- `COMPLETED` - Payment settled, closed
- `CANCELLED` - Cancelled
- `REJECTED` - Rejected by admin

**Enum:** `OrderType`
- `MANUAL` - Manual order by store
- `AUTO_REPLENISH` - Auto-generated replenishment order

**Model:** `OrderItem`

```prisma
model OrderItem {
  id          String  @id @default(cuid())
  orderId    String
  productId  String
  quantity   Int
  unitPrice  Decimal
  totalPrice Decimal
  
  order      Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product    Product @relation(fields: [productId], references: [id])
  
  @@index([orderId])
}
```

**Fields:**
- `id` - Unique identifier
- `orderId` - Order reference
- `productId` - Product reference
- `quantity` - Item quantity
- `unitPrice` - Price per unit
- `totalPrice` - Total price (quantity × unitPrice)

**Relationships:**
- Order → `kitchenSheet` (one-to-one, optional)
- Order → `delivery` (one-to-one, optional)
- Order → `invoice` (one-to-one, optional)

---

### 6. Kitchen Management

**Model:** `KitchenSheet`

```prisma
model KitchenSheet {
  id              String   @id @default(cuid())
  orderId         String   @unique
  status          KitchenSheetStatus @default(PENDING)
  preparedBy      String?  // userId
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  order           Order    @relation(fields: [orderId], references: [id])
  items           KitchenSheetItem[]
}
```

**Fields:**
- `id` - Unique identifier
- `orderId` - Order reference (unique, one kitchen sheet per order)
- `status` - Kitchen sheet status (enum)
- `preparedBy` - User who prepared (optional)
- `completedAt` - Completion timestamp (optional)

**Enum:** `KitchenSheetStatus`
- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`

**Model:** `KitchenSheetItem`

```prisma
model KitchenSheetItem {
  id              String   @id @default(cuid())
  kitchenSheetId  String
  productId       String
  quantity        Int
  batchNumber     String?
  expiryDate      DateTime?
  barcode         String?
  qrCode          String?
  isPacked        Boolean  @default(false)
  
  kitchenSheet    KitchenSheet @relation(fields: [kitchenSheetId], references: [id], onDelete: Cascade)
  product         Product      @relation(fields: [productId], references: [id])
  
  @@index([kitchenSheetId])
}
```

**Fields:**
- `id` - Unique identifier
- `kitchenSheetId` - Kitchen sheet reference
- `productId` - Product reference
- `quantity` - Quantity to prepare
- `batchNumber` - Batch/lot number (optional)
- `expiryDate` - Expiry date (optional)
- `barcode` - Generated barcode (optional)
- `qrCode` - Generated QR code (optional)
- `isPacked` - Packing status

---

### 7. Delivery Management

**Model:** `Delivery`

```prisma
model Delivery {
  id              String   @id @default(cuid())
  orderId         String   @unique
  driverId        String?
  status          DeliveryStatus @default(PENDING)
  scheduledDate   DateTime
  deliveredAt     DateTime?
  deliveryAddress String
  storeId         String
  latitude        Float?
  longitude       Float?
  signature       String?  // base64 image
  deliveryPhoto   String?  // file URL
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  order           Order    @relation(fields: [orderId], references: [id])
  driver          User?    @relation(fields: [driverId], references: [id])
  store           Store    @relation(fields: [storeId], references: [id])
  temperatureLogs TemperatureLog[]
  returns         Return[]
  payment         Payment?
}
```

**Fields:**
- `id` - Unique identifier
- `orderId` - Order reference (unique, one delivery per order)
- `driverId` - Assigned driver (optional)
- `status` - Delivery status (enum)
- `scheduledDate` - Scheduled delivery date
- `deliveredAt` - Actual delivery timestamp (optional)
- `deliveryAddress` - Delivery address
- `storeId` - Store reference
- `latitude`, `longitude` - GPS coordinates (optional)
- `signature` - Proof of delivery signature (base64 image, optional)
- `deliveryPhoto` - Delivery photo URL (optional)
- `notes` - Delivery notes (optional)

**Enum:** `DeliveryStatus`
- `PENDING`
- `ASSIGNED`
- `IN_TRANSIT`
- `DELIVERED`
- `FAILED`

---

### 8. Temperature & Compliance

**Model:** `TemperatureLog`

```prisma
model TemperatureLog {
  id              String   @id @default(cuid())
  deliveryId      String?
  storeId         String
  temperature     Float
  location        String?  // "fridge", "freezer", "ambient", etc.
  recordedBy      String?  // userId (driver)
  recordedAt      DateTime @default(now())
  isManual        Boolean  @default(true) // manual vs IoT sensor
  sensorId        String?
  notes           String?
  
  delivery        Delivery? @relation(fields: [deliveryId], references: [id])
  store           Store     @relation(fields: [storeId], references: [id])
  
  @@index([deliveryId])
  @@index([storeId])
  @@index([recordedAt])
}
```

**Fields:**
- `id` - Unique identifier
- `deliveryId` - Delivery reference (optional)
- `storeId` - Store reference
- `temperature` - Temperature reading in Celsius
- `location` - Storage location (optional)
- `recordedBy` - User who recorded (optional, typically driver)
- `recordedAt` - Recording timestamp
- `isManual` - Whether manually recorded (default: true)
- `sensorId` - IoT sensor ID (optional)
- `notes` - Additional notes (optional)

**Indexes:**
- Index on `deliveryId` for delivery-specific queries
- Index on `storeId` for store-specific queries
- Index on `recordedAt` for time-based queries

---

### 9. Returns & Wastage

**Model:** `Return`

```prisma
model Return {
  id              String   @id @default(cuid())
  deliveryId      String
  storeId         String
  returnedBy      String   // userId (driver)
  returnDate      DateTime @default(now())
  reason          String   @default("expired")
  status          ReturnStatus @default(PENDING)
  processedAt     DateTime?
  notes           String?
  
  delivery        Delivery  @relation(fields: [deliveryId], references: [id])
  store           Store     @relation(fields: [storeId], references: [id])
  items           ReturnItem[]
}
```

**Fields:**
- `id` - Unique identifier
- `deliveryId` - Delivery reference
- `storeId` - Store reference
- `returnedBy` - User who processed return (driver)
- `returnDate` - Return date
- `reason` - Return reason (default: "expired")
- `status` - Return status (enum)
- `processedAt` - Processing timestamp (optional)
- `notes` - Additional notes (optional)

**Enum:** `ReturnStatus`
- `PENDING`
- `PROCESSED`
- `REJECTED`

**Model:** `ReturnItem`

```prisma
model ReturnItem {
  id              String   @id @default(cuid())
  returnId        String
  productId       String
  quantity        Int
  expiryDate      DateTime
  reason          String   @default("expired")
  
  return          Return   @relation(fields: [returnId], references: [id], onDelete: Cascade)
  product         Product  @relation(fields: [productId], references: [id])
  
  @@index([returnId])
}
```

**Fields:**
- `id` - Unique identifier
- `returnId` - Return reference
- `productId` - Product reference
- `quantity` - Returned quantity
- `expiryDate` - Expiry date of returned items
- `reason` - Return reason (default: "expired")

---

### 10. Invoicing & Payments

**Model:** `Invoice`

```prisma
model Invoice {
  id              String      @id @default(cuid())
  invoiceNumber   String      @unique
  orderId         String      @unique
  storeId         String
  subtotal        Decimal
  discount        Decimal     @default(0)
  tax             Decimal     @default(0)
  returnAdjustment Decimal    @default(0) // from returns
  totalAmount     Decimal
  dueDate         DateTime
  status          InvoiceStatus @default(PENDING)
  issuedAt        DateTime    @default(now())
  paidAt          DateTime?
  
  order           Order       @relation(fields: [orderId], references: [id])
  store           Store       @relation(fields: [storeId], references: [id])
  payments        Payment[]
  
  @@index([storeId])
  @@index([status])
}
```

**Fields:**
- `id` - Unique identifier
- `invoiceNumber` - Unique invoice number (e.g., "INV-20240115-0001")
- `orderId` - Order reference (unique, one invoice per order)
- `storeId` - Store reference
- `subtotal` - Subtotal amount
- `discount` - Discount amount (default: 0)
- `tax` - Tax amount (default: 0)
- `returnAdjustment` - Return adjustment amount (default: 0)
- `totalAmount` - Total invoice amount
- `dueDate` - Payment due date
- `status` - Invoice status (enum)
- `issuedAt` - Issue timestamp
- `paidAt` - Payment completion timestamp (optional)

**Enum:** `InvoiceStatus`
- `PENDING`
- `PARTIAL`
- `PAID`
- `OVERDUE`
- `CANCELLED`

**Model:** `Payment`

```prisma
model Payment {
  id              String      @id @default(cuid())
  invoiceId       String
  deliveryId      String?     @unique
  amount          Decimal
  paymentMethod   PaymentMethod
  paymentDate     DateTime    @default(now())
  transactionId   String?     // from payment gateway
  receiptUrl      String?     // uploaded receipt/photo
  collectedBy     String?     // userId (driver for cash)
  notes           String?
  
  invoice         Invoice     @relation(fields: [invoiceId], references: [id])
  delivery        Delivery?   @relation(fields: [deliveryId], references: [id])
  
  @@index([invoiceId])
}
```

**Fields:**
- `id` - Unique identifier
- `invoiceId` - Invoice reference
- `deliveryId` - Delivery reference (optional, unique)
- `amount` - Payment amount
- `paymentMethod` - Payment method (enum)
- `paymentDate` - Payment timestamp
- `transactionId` - Payment gateway transaction ID (optional)
- `receiptUrl` - Receipt photo URL (optional)
- `collectedBy` - User who collected payment (optional, driver for cash)
- `notes` - Payment notes (optional)

**Enum:** `PaymentMethod`
- `CASH`
- `DIRECT_DEBIT`
- `ONLINE_PAYMENT`
- `BANK_TRANSFER`

---

### 11. Notifications

**Model:** `Notification`

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  title       String
  message     String
  type        NotificationType
  isRead      Boolean  @default(false)
  relatedId   String?  // orderId, invoiceId, etc.
  relatedType String?  // "order", "invoice", etc.
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([isRead])
}
```

**Fields:**
- `id` - Unique identifier
- `userId` - User reference
- `title` - Notification title
- `message` - Notification message
- `type` - Notification type (enum)
- `isRead` - Read status (default: false)
- `relatedId` - Related entity ID (optional)
- `relatedType` - Related entity type (optional)
- `createdAt` - Creation timestamp

**Enum:** `NotificationType`
- `ORDER_APPROVED`
- `ORDER_REJECTED`
- `DELIVERY_ASSIGNED`
- `PAYMENT_RECEIVED`
- `INVOICE_GENERATED`
- `STOCK_LOW`
- `TEMPERATURE_ALERT`

**Indexes:**
- Index on `userId` for user-specific queries
- Index on `isRead` for filtering unread notifications

---

## Entity Relationship Diagram

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ├───┬──→ Store (many-to-one)
     │   │
     ├───┼──→ Order (createdBy, one-to-many)
     │   │
     ├───┼──→ Delivery (driver, one-to-many)
     │   │
     └───┴──→ User (createdBy, self-relation)

┌─────────┐
│  Store  │
└────┬────┘
     │
     ├──→ User[]
     ├──→ Order[]
     ├──→ StoreStock[]
     ├──→ Invoice[]
     ├──→ Delivery[]
     ├──→ Return[]
     └──→ TemperatureLog[]

┌──────────┐
│ Product  │
└────┬─────┘
     │
     ├──→ OrderItem[]
     ├──→ StoreStock[]
     ├──→ ReturnItem[]
     └──→ KitchenSheetItem[]

┌─────────┐
│  Order  │
└────┬────┘
     │
     ├──→ OrderItem[] (one-to-many)
     ├──→ KitchenSheet (one-to-one)
     ├──→ Delivery (one-to-one)
     └──→ Invoice (one-to-one)

┌──────────────┐
│ KitchenSheet │
└──────┬───────┘
       │
       └──→ KitchenSheetItem[] (one-to-many)

┌──────────┐
│ Delivery │
└────┬─────┘
     │
     ├──→ TemperatureLog[]
     ├──→ Return[]
     └──→ Payment (one-to-one)

┌─────────┐
│ Invoice │
└────┬────┘
     │
     └──→ Payment[] (one-to-many)

┌────────┐
│ Return │
└────┬───┘
     │
     └──→ ReturnItem[] (one-to-many)
```

---

## Database Indexes

1. **User**
   - `email` (unique)

2. **Product**
   - `sku` (unique)

3. **StoreStock**
   - `[storeId, productId]` (unique composite)
   - `storeId` (index)
   - `productId` (index)

4. **Order**
   - `orderNumber` (unique)

5. **OrderItem**
   - `orderId` (index)

6. **KitchenSheet**
   - `orderId` (unique)

7. **KitchenSheetItem**
   - `kitchenSheetId` (index)

8. **Delivery**
   - `orderId` (unique)

9. **TemperatureLog**
   - `deliveryId` (index)
   - `storeId` (index)
   - `recordedAt` (index)

10. **ReturnItem**
    - `returnId` (index)

11. **Invoice**
    - `invoiceNumber` (unique)
    - `orderId` (unique)
    - `storeId` (index)
    - `status` (index)

12. **Payment**
    - `invoiceId` (index)
    - `deliveryId` (unique)

13. **Notification**
    - `userId` (index)
    - `isRead` (index)

---

## Cascade Deletes

The following relationships have cascade delete enabled:

- `OrderItem` → deleted when `Order` is deleted
- `KitchenSheetItem` → deleted when `KitchenSheet` is deleted
- `ReturnItem` → deleted when `Return` is deleted

---

## Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Push schema changes (dev only)
npx prisma db push
```

---

## Seed Data

The seed script (`prisma/seed.ts`) creates:
- Initial admin user
- Sample stores
- Sample products
- Sample stock levels
- Test data for development

Run with: `npm run db:seed`

---

## Production Deployment

### Database Connection

For Supabase, use the **connection pooler URL**:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
```

### Migration Steps

1. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

2. **Run Migrations**
   ```bash
   npm run db:migrate:deploy
   ```

3. **Seed Initial Data** (optional)
   ```bash
   npm run db:seed
   ```

---

## Schema Version

**Current Version:** 1.0.0  
**Last Updated:** 2024  
**Prisma Version:** 5.19.0

---

## Notes

- All IDs use CUID format for better distribution
- Timestamps are automatically managed (`createdAt`, `updatedAt`)
- Decimal fields are used for currency to avoid floating-point errors
- Optional fields are nullable for flexibility
- Indexes are optimized for common query patterns
- Foreign key constraints ensure data integrity

