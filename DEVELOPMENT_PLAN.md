# Pommy Foods - Development Plan
## Full-Stack Next.js Project

---

## 1. TECHNOLOGY STACK

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or React Context
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts or Chart.js
- **Maps**: Google Maps API / Mapbox
- **Mobile**: Progressive Web App (PWA) for Driver App
- **Real-time**: WebSockets (Socket.io) for live updates

### Backend
- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **File Upload**: AWS S3 / Cloudinary / Local storage
- **Payment Gateway**: Stripe / Paystack (depending on region)
- **Email**: Nodemailer / Resend / SendGrid
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Background Jobs**: BullMQ / Node-cron

### DevOps
- **Version Control**: Git
- **Deployment**: Vercel / AWS / Railway
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry

---

## 2. ROLES & PERMISSIONS

### 2.1 Role Definitions

| Role | Access Level | Key Permissions |
|------|-------------|-----------------|
| **Super Admin** | Highest | Full system access, user management, system settings |
| **Admin** | High | Order approval, stock management, invoice management, analytics |
| **Store Owner** | Medium | View/manage own store, update stock, view orders/invoices |
| **Store Manager** | Medium | Same as Store Owner (assigned to specific store) |
| **Kitchen Staff** | Low-Medium | View kitchen sheets, update prep status, barcode generation |
| **Driver** | Low | View assigned deliveries, update delivery status, log returns, temperature tracking |

### 2.2 Permission Matrix

```
┌──────────────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Feature          │ Admin   │ Store   │ Kitchen │ Driver  │ Guest   │
├──────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ View Orders      │ ✅ All  │ ✅ Own  │ ✅ Assigned│ ✅ Assigned│ ❌     │
│ Create Orders    │ ✅      │ ✅      │ ❌       │ ❌       │ ❌     │
│ Approve Orders   │ ✅      │ ❌      │ ❌       │ ❌       │ ❌     │
│ Update Stock     │ ✅      │ ✅ Own  │ ❌       │ ❌       │ ❌     │
│ Manage Products  │ ✅      │ ❌      │ ❌       │ ❌       │ ❌     │
│ View Invoices    │ ✅ All  │ ✅ Own  │ ❌       │ ❌       │ ❌     │
│ Kitchen Sheets   │ ✅      │ ❌      │ ✅      │ ❌       │ ❌     │
│ Delivery Notes   │ ✅      │ ✅ Own  │ ❌       │ ✅       │ ❌     │
│ Temperature Log  │ ✅      │ ✅ Own  │ ❌       │ ✅ Enter │ ❌     │
│ Returns Log      │ ✅      │ ✅ Own  │ ❌       │ ✅ Enter │ ❌     │
│ Payments         │ ✅      │ ✅ Own  │ ❌       │ ✅ Collect│ ❌    │
│ Analytics        │ ✅ Full │ ✅ Own  │ ❌       │ ❌       │ ❌     │
└──────────────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

---

## 3. UI/UX DESIGN PLANNING

### 3.1 Admin Dashboard

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Notifications | Profile Menu            │
├─────────────────────────────────────────────────────────┤
│  Sidebar Navigation                                      │
│  ├─ Dashboard                                            │
│  ├─ Orders (Pending/Approved/All)                        │
│  ├─ Products & Stock                                     │
│  ├─ Stores & Customers                                   │
│  ├─ Kitchen Sheets                                       │
│  ├─ Delivery Management                                  │
│  ├─ Invoices & Payments                                  │
│  ├─ Temperature Logs                                     │
│  ├─ Returns & Wastage                                    │
│  ├─ Analytics & Reports                                  │
│  └─ Settings                                             │
├─────────────────────────────────────────────────────────┤
│  Main Content Area (Dynamic based on route)              │
└─────────────────────────────────────────────────────────┘
```

#### Key Pages

1. **Dashboard Overview**
   - KPI Cards: Pending Orders, Today's Deliveries, Revenue, Low Stock Alerts
   - Charts: Sales Trends, Order Status Distribution, Top Products
   - Recent Activity Feed
   - Quick Actions: Approve Orders, Generate Reports

2. **Order Management**
   - **Pending Orders Tab**: List of draft/auto-generated orders
     - Order cards showing: Store name, items count, total value, created date
     - Quick actions: View Details, Edit, Approve, Reject
     - Filters: Store, Date Range, Order Type
   - **Order Details Modal/Page**:
     - Order summary
     - Editable product list with quantity controls
     - Add/remove products
     - Notes section
     - Approve/Reject buttons

3. **Products & Stock Management**
   - Product catalog table with: Name, SKU, Price, Stock Level, Status
   - CRUD operations for products
   - Bulk import/export
   - Pricing management
   - Stock alerts dashboard

4. **Stores & Customers**
   - Store list with search/filter
   - Store details: Contact info, credit limit, payment terms, order history
   - Create/edit stores
   - Assign managers

5. **Kitchen Sheets**
   - Auto-generated kitchen sheets list
   - Sheet details: Order items, quantities, batch numbers, expiry dates
   - Status tracking: Pending → In Progress → Completed
   - Barcode/QR code generation for packed items

6. **Delivery Management**
   - Delivery calendar/view
   - Delivery notes list
   - Assign drivers
   - Route optimization
   - Real-time tracking map

7. **Invoices & Payments**
   - Invoice list with filters
   - Invoice generation/view/download
   - Payment status tracking
   - Credit management dashboard
   - Payment reminders

8. **Temperature & Compliance**
   - Temperature logs table
   - Compliance reports
   - Alerts for out-of-range temperatures
   - Audit trail

9. **Returns & Wastage**
   - Returns log by store/product
   - Wastage analytics
   - Charts showing return trends

10. **Analytics & Reports**
    - Sales reports (product, store, region, date range)
    - Stock insights
    - Delivery performance metrics
    - Payment collection reports
    - Export to PDF/Excel

### 3.2 Customer Portal / Store App

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header: Store Name | Notifications | Profile            │
├─────────────────────────────────────────────────────────┤
│  Navigation Tabs                                         │
│  ├─ Dashboard                                            │
│  ├─ Products & Order                                     │
│  ├─ Stock Management                                     │
│  ├─ My Orders                                            │
│  ├─ Invoices & Payments                                  │
│  └─ Settings                                             │
├─────────────────────────────────────────────────────────┤
│  Main Content                                            │
└─────────────────────────────────────────────────────────┘
```

#### Key Pages

1. **Store Dashboard**
   - Current stock levels with low stock warnings
   - Pending orders status
   - Recent orders
   - Payment due alerts
   - Quick actions: Update Stock, Place Order

2. **Products & Ordering**
   - Product catalog (grid/list view)
   - Search and filter products
   - Product details: Name, image, description, price, available stock
   - Add to cart functionality
   - Cart review and checkout
   - Order confirmation

3. **Stock Management**
   - Current stock levels table
   - Update stock form (per product)
   - Bulk stock update (CSV upload)
   - Stock history/changes log
   - Threshold settings per product

4. **My Orders**
   - Order history table
   - Order details view
   - Order status tracking
   - Cancel order (if pending approval)

5. **Invoices & Payments**
   - Invoice list with payment status
   - Invoice details and download
   - Payment history
   - Payment method selection
   - Credit limit display

### 3.3 Driver Mobile App (PWA)

#### Mobile-First Design

#### Layout Structure
```
┌─────────────────────────┐
│  Header: Driver Name |   │
│  Logout                  │
├─────────────────────────┤
│  Tab Navigation          │
│  ├─ 🏠 Dashboard        │
│  ├─ 📦 Deliveries        │
│  ├─ 📊 Completed         │
│  └─ ⚙️ Profile           │
├─────────────────────────┤
│  Main Content (Scrollable)│
└─────────────────────────┘
```

#### Key Screens

1. **Dashboard**
   - Today's assigned deliveries count
   - Next delivery (with route button)
   - Quick stats: Completed, In Progress, Pending

2. **Active Deliveries**
   - List of assigned deliveries
   - Delivery card: Store name, address, items count, delivery time
   - Status indicators
   - Tap to view details

3. **Delivery Details**
   - Delivery information
   - Route button (opens maps)
   - Items list
   - Actions:
     - Start Delivery
     - Record Temperature
     - Collect Payment (Cash/Direct Debit)
     - Upload Proof of Payment
     - Log Returns (expired items)
     - Complete Delivery (with signature/photo)
   - GPS tracking toggle

4. **Temperature Logging**
   - Simple form: Temperature input, timestamp, location
   - Temperature history for current delivery

5. **Return Entry**
   - Scan/select expired products
   - Enter quantities
   - Add notes
   - Submit

6. **Completed Deliveries**
   - History of completed deliveries
   - View delivery details

### 3.4 Kitchen Module Interface

#### Layout
- Simple, focused interface for kitchen staff
- Large buttons, clear typography
- Touch-friendly for tablet use

#### Key Screens

1. **Kitchen Sheets List**
   - Today's kitchen sheets
   - Status: Pending, In Progress, Completed

2. **Kitchen Sheet Details**
   - Order information
   - Items list with quantities
   - Batch number assignment
   - Expiry date entry
   - Generate barcode/QR code
   - Mark items as packed
   - Complete sheet

---

## 4. BACKEND IMPLEMENTATION PLANNING

### 4.1 Database Schema Design

#### Core Entities

```prisma
// User & Authentication
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
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  STORE_OWNER
  STORE_MANAGER
  KITCHEN_STAFF
  DRIVER
}

// Store Management
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

// Product Catalog
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

// Stock Management
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

// Order Management
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

enum OrderStatus {
  DRAFT           // Auto-generated, pending admin review
  PENDING         // Submitted by store, pending admin approval
  APPROVED        // Approved by admin, ready for kitchen
  KITCHEN_PREP    // Kitchen sheet generated, being prepared
  READY           // Ready for delivery
  IN_DELIVERY     // Out for delivery
  DELIVERED       // Delivered to store
  COMPLETED       // Payment settled, closed
  CANCELLED       // Cancelled
  REJECTED        // Rejected by admin
}

enum OrderType {
  MANUAL          // Manual order by store
  AUTO_REPLENISH  // Auto-generated replenishment order
}

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

// Kitchen Management
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

enum KitchenSheetStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

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

// Delivery Management
model Delivery {
  id              String   @id @default(cuid())
  orderId         String   @unique
  driverId        String?
  status          DeliveryStatus @default(PENDING)
  scheduledDate   DateTime
  deliveredAt     DateTime?
  deliveryAddress String
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
  storeId         String
  temperatureLogs TemperatureLog[]
  returns         Return[]
  payment         Payment?
}

enum DeliveryStatus {
  PENDING
  ASSIGNED
  IN_TRANSIT
  DELIVERED
  FAILED
}

// Temperature & Compliance
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

// Returns & Wastage
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

enum ReturnStatus {
  PENDING
  PROCESSED
  REJECTED
}

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

// Invoicing & Payments
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

enum InvoiceStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
}

model Payment {
  id              String      @id @default(cuid())
  invoiceId       String
  deliveryId      String?
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

enum PaymentMethod {
  CASH
  DIRECT_DEBIT
  ONLINE_PAYMENT
  BANK_TRANSFER
}

// Notifications
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

enum NotificationType {
  ORDER_APPROVED
  ORDER_REJECTED
  DELIVERY_ASSIGNED
  PAYMENT_RECEIVED
  INVOICE_GENERATED
  STOCK_LOW
  TEMPERATURE_ALERT
}
```

### 4.2 API Routes Structure

```
/api
├── /auth
│   ├── /login              POST
│   ├── /register           POST
│   ├── /logout             POST
│   ├── /forgot-password    POST
│   └── /reset-password     POST
│
├── /users
│   ├── GET                 (list users - admin only)
│   ├── POST                (create user - admin only)
│   ├── /[id]
│   │   ├── GET             (get user)
│   │   ├── PUT             (update user)
│   │   └── DELETE          (delete user)
│   └── /me                 GET (current user)
│
├── /stores
│   ├── GET                 (list stores)
│   ├── POST                (create store - admin only)
│   └── /[id]
│       ├── GET             (get store)
│       ├── PUT             (update store)
│       ├── DELETE          (delete store)
│       ├── /stock          GET (store stock levels)
│       └── /orders         GET (store orders)
│
├── /products
│   ├── GET                 (list products)
│   ├── POST                (create product - admin only)
│   └── /[id]
│       ├── GET             (get product)
│       ├── PUT             (update product)
│       └── DELETE          (delete product)
│
├── /stock
│   ├── GET                 (list all stock - admin) or (own store stock)
│   ├── POST                (update stock level)
│   ├── /bulk-update        POST (bulk stock update)
│   └── /thresholds         PUT (update thresholds)
│
├── /orders
│   ├── GET                 (list orders - filtered by role)
│   ├── POST                (create order)
│   ├── /[id]
│   │   ├── GET             (get order)
│   │   ├── PUT             (update order)
│   │   ├── /approve        POST (approve order - admin only)
│   │   ├── /reject         POST (reject order - admin only)
│   │   └── /cancel         POST (cancel order)
│   ├── /draft              GET (draft orders - admin only)
│   └── /auto-generate      POST (trigger auto-generation - admin only)
│
├── /kitchen-sheets
│   ├── GET                 (list kitchen sheets)
│   ├── /[id]
│   │   ├── GET             (get kitchen sheet)
│   │   ├── PUT             (update kitchen sheet)
│   │   ├── /complete       POST (mark as completed)
│   │   └── /items/[itemId]/pack  POST (mark item as packed)
│   └── /generate-barcode   POST (generate barcode for item)
│
├── /deliveries
│   ├── GET                 (list deliveries - filtered by role)
│   ├── /[id]
│   │   ├── GET             (get delivery)
│   │   ├── PUT             (update delivery)
│   │   ├── /assign         POST (assign driver - admin only)
│   │   ├── /start          POST (start delivery - driver)
│   │   ├── /complete       POST (complete delivery - driver)
│   │   ├── /temperature    POST (log temperature)
│   │   └── /returns        POST (log returns)
│   └── /route              POST (optimize route)
│
├── /returns
│   ├── GET                 (list returns)
│   ├── POST                (create return)
│   └── /[id]
│       ├── GET             (get return)
│       ├── PUT             (update return)
│       └── /process        POST (process return - admin)
│
├── /invoices
│   ├── GET                 (list invoices)
│   ├── POST                (generate invoice)
│   └── /[id]
│       ├── GET             (get invoice)
│       ├── /download       GET (download PDF)
│       └── /payments       GET (get payments for invoice)
│
├── /payments
│   ├── GET                 (list payments)
│   ├── POST                (create payment)
│   └── /[id]
│       ├── GET             (get payment)
│       └── /upload-receipt POST (upload receipt)
│
├── /temperature
│   ├── GET                 (list temperature logs)
│   └── POST                (create temperature log)
│
├── /analytics
│   ├── /sales              GET (sales reports)
│   ├── /stock              GET (stock insights)
│   ├── /deliveries         GET (delivery performance)
│   ├── /returns            GET (returns/wastage reports)
│   └── /payments           GET (payment reports)
│
├── /notifications
│   ├── GET                 (list notifications for current user)
│   ├── /[id]/read         PUT (mark as read)
│   └── /read-all           PUT (mark all as read)
│
└── /replenishment
    ├── /check              POST (check and generate draft orders)
    └── /rules              GET/PUT (manage replenishment rules)
```

### 4.3 Business Logic Services

#### 4.3.1 Order Service
- **Auto-replenishment Logic**:
  - Monitor store stock levels
  - Compare with thresholds
  - Generate draft orders when stock < threshold
  - Calculate quantities based on historical consumption

- **Order Approval Workflow**:
  - Validate order (check credit limit, stock availability)
  - Allow admin to modify quantities/products
  - Generate kitchen sheet on approval
  - Generate delivery note on approval
  - Notify store of approval

#### 4.3.2 Kitchen Service
- Generate kitchen sheets from approved orders
- Track preparation status
- Generate barcodes/QR codes for packed items
- Validate expiry dates

#### 4.3.3 Delivery Service
- Assign deliveries to drivers
- Route optimization (if multiple deliveries)
- GPS tracking integration
- Delivery confirmation workflow
- Handle delivery failures

#### 4.3.4 Return Service
- Validate return items (only expired, unsold items)
- Calculate return adjustment amount
- Auto-adjust invoice on return processing
- Track wastage analytics

#### 4.3.5 Invoice Service
- Auto-generate invoice on delivery completion
- Apply return adjustments
- Calculate taxes/discounts
- Set due dates based on payment terms
- Generate PDF invoices

#### 4.3.6 Payment Service
- Process cash payments (driver entry)
- Process direct debit payments
- Integrate with payment gateway
- Update invoice status
- Track payment history

#### 4.3.7 Temperature Service
- Log temperature readings (manual/IoT)
- Alert on out-of-range temperatures
- Generate compliance reports

#### 4.3.8 Notification Service
- Send real-time notifications
- Email notifications for important events
- Push notifications (for mobile app)
- In-app notifications

#### 4.3.9 Analytics Service
- Generate sales reports (by product, store, region, date)
- Stock insights and trends
- Delivery performance metrics
- Returns/wastage analysis
- Payment collection reports

### 4.4 Background Jobs & Scheduled Tasks

1. **Stock Monitoring Job** (Every hour)
   - Check all store stock levels
   - Compare with thresholds
   - Generate draft replenishment orders if needed
   - Send low stock alerts

2. **Invoice Generation Job** (On delivery completion)
   - Triggered when delivery is marked as delivered
   - Generate invoice automatically
   - Send invoice to store

3. **Payment Reminder Job** (Daily)
   - Check overdue invoices
   - Send payment reminders
   - Update overdue status

4. **Temperature Alert Job** (Real-time/Every 5 mins)
   - Check temperature logs
   - Alert if out of range
   - Generate compliance warnings

5. **Order Expiration Job** (Daily)
   - Cancel draft orders older than X days
   - Clean up expired data

---

## 5. IMPLEMENTATION PHASES

### Phase 1: Foundation & Setup (Week 1-2)
- [ ] Project initialization (Next.js setup)
- [ ] Database setup (PostgreSQL + Prisma)
- [ ] Authentication system (NextAuth.js)
- [ ] Basic UI components (shadcn/ui setup)
- [ ] User management (CRUD operations)
- [ ] Role-based access control (RBAC)
- [ ] Basic layout components (Header, Sidebar, Navigation)

### Phase 2: Core Modules - Part 1 (Week 3-4)
- [ ] Product management (CRUD)
- [ ] Store management (CRUD)
- [ ] Stock management (View, Update, Thresholds)
- [ ] Basic order creation (manual orders)
- [ ] Order listing and details

### Phase 3: Order Management System (Week 5-6)
- [ ] Auto-replenishment logic
- [ ] Draft order generation
- [ ] Admin order approval workflow
- [ ] Order modification by admin
- [ ] Order status transitions
- [ ] Notifications for order approval/rejection

### Phase 4: Kitchen Module (Week 7)
- [ ] Kitchen sheet generation from approved orders
- [ ] Kitchen sheet interface
- [ ] Batch number and expiry date tracking
- [ ] Barcode/QR code generation
- [ ] Kitchen sheet status management

### Phase 5: Delivery Management (Week 8-9)
- [ ] Delivery note generation
- [ ] Driver assignment
- [ ] Delivery listing and details
- [ ] Route optimization (basic)
- [ ] Delivery status tracking

### Phase 6: Driver App (Week 10-11)
- [ ] PWA setup for mobile
- [ ] Driver dashboard
- [ ] Delivery assignment view
- [ ] GPS tracking integration
- [ ] Temperature logging
- [ ] Return entry functionality
- [ ] Payment collection (cash)
- [ ] Proof of delivery (signature/photo)

### Phase 7: Returns & Wastage (Week 12)
- [ ] Return entry and validation
- [ ] Return processing
- [ ] Invoice auto-adjustment on returns
- [ ] Returns analytics

### Phase 8: Invoicing & Payments (Week 13-14)
- [ ] Auto-invoice generation
- [ ] Invoice PDF generation
- [ ] Payment entry and tracking
- [ ] Payment method selection
- [ ] Payment gateway integration (if applicable)
- [ ] Credit management
- [ ] Payment reminders

### Phase 9: Temperature & Compliance (Week 15)
- [ ] Temperature logging (manual)
- [ ] Temperature alerts
- [ ] Compliance reports
- [ ] IoT sensor integration (optional, future)

### Phase 10: Analytics & Reporting (Week 16)
- [ ] Sales reports
- [ ] Stock insights
- [ ] Delivery performance metrics
- [ ] Returns/wastage reports
- [ ] Payment reports
- [ ] Report export (PDF/Excel)

### Phase 11: Testing & Refinement (Week 17-18)
- [ ] Unit testing
- [ ] Integration testing
- [ ] E2E testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security audit

### Phase 12: Deployment & Documentation (Week 19-20)
- [ ] Production deployment
- [ ] User documentation
- [ ] Admin documentation
- [ ] API documentation
- [ ] Training materials

---

## 6. SECURITY CONSIDERATIONS

1. **Authentication & Authorization**
   - Secure password hashing (bcrypt)
   - JWT tokens with refresh tokens
   - Session management
   - Role-based route protection
   - API route middleware for authorization

2. **Data Validation**
   - Input validation (Zod schemas)
   - SQL injection prevention (Prisma ORM)
   - XSS prevention
   - CSRF protection

3. **API Security**
   - Rate limiting
   - Request validation
   - Error handling (no sensitive data exposure)

4. **File Upload Security**
   - File type validation
   - File size limits
   - Secure storage
   - Virus scanning (if applicable)

5. **Payment Security**
   - PCI DSS compliance considerations
   - Secure payment gateway integration
   - No storage of sensitive payment data

---

## 7. PERFORMANCE OPTIMIZATION

1. **Database Optimization**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Caching strategies (Redis, if needed)

2. **Frontend Optimization**
   - Code splitting
   - Image optimization
   - Lazy loading
   - Server-side rendering where appropriate
   - Client-side caching

3. **API Optimization**
   - Response pagination
   - Data aggregation at database level
   - Caching for frequently accessed data

---

## 8. FUTURE ENHANCEMENTS

1. **Mobile Apps**
   - Native iOS/Android apps (React Native)
   - Enhanced offline capabilities

2. **Advanced Features**
   - AI-powered demand forecasting
   - Advanced route optimization
   - Predictive analytics
   - Chat/support system
   - Multi-language support

3. **Integrations**
   - ERP system integration
   - Accounting software integration
   - Warehouse management system
   - Advanced IoT sensor networks

---

## 9. DOCUMENTATION REQUIREMENTS

1. **Technical Documentation**
   - API documentation (Swagger/OpenAPI)
   - Database schema documentation
   - Architecture diagrams
   - Deployment guide

2. **User Documentation**
   - Admin user guide
   - Store owner guide
   - Driver app guide
   - Kitchen staff guide

3. **Development Documentation**
   - Setup instructions
   - Code style guide
   - Git workflow
   - Testing guidelines

---

## 10. SUCCESS METRICS

1. **Functional Metrics**
   - Order processing time reduction
   - Automated order generation accuracy
   - Delivery on-time percentage
   - Invoice accuracy

2. **User Experience Metrics**
   - User adoption rate
   - Task completion time
   - User satisfaction scores
   - Error rates

3. **Business Metrics**
   - Time saved (vs manual process)
   - Reduced wastage
   - Improved cash flow
   - Compliance adherence

---

This development plan provides a comprehensive roadmap for building the Pommy Foods digital distribution system. Each phase builds upon the previous one, ensuring a systematic and manageable development process.

