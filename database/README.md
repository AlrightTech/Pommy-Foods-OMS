# Database Schema Import Guide

This directory contains SQL schema files for direct database import.

## Files

- **`schema.sql`** - Complete PostgreSQL schema with all tables, enums, indexes, and foreign keys

## Import Methods

### Method 1: Using psql Command Line

```bash
# Connect and import
psql -U postgres -d your_database -f schema.sql

# Or with connection string
psql "postgresql://user:password@host:5432/database" -f schema.sql
```

### Method 2: Using Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the contents of `schema.sql`
6. Click **Run** (or press `Ctrl+Enter`)

### Method 3: Using pgAdmin

1. Open pgAdmin
2. Connect to your database
3. Right-click on your database → **Query Tool**
4. Open `schema.sql` file
5. Click **Execute** (or press `F5`)

### Method 4: Using Prisma Migrate (Recommended)

If you have Prisma set up, use migrations instead:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Generate and apply migrations
npm run db:migrate:deploy
```

## Post-Import Steps

1. **Verify Schema**
   ```sql
   -- Check tables
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Check enums
   SELECT typname FROM pg_type WHERE typtype = 'e';
   ```

2. **Seed Initial Data**
   ```bash
   npm run db:seed
   ```

3. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

## Schema Summary

- **15 Tables**: User, Store, Product, StoreStock, Order, OrderItem, KitchenSheet, KitchenSheetItem, Delivery, TemperatureLog, Return, ReturnItem, Invoice, Payment, Notification
- **8 Enums**: UserRole, OrderStatus, OrderType, KitchenSheetStatus, DeliveryStatus, ReturnStatus, InvoiceStatus, PaymentMethod, NotificationType
- **All Relationships**: Foreign keys configured with proper cascade rules
- **All Indexes**: Optimized for query performance

## Troubleshooting

### Error: "relation already exists"
If tables already exist, you can either:
1. Drop existing schema: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
2. Use Prisma migrations instead
3. Manually drop tables before importing

### Error: "type already exists"
If enums already exist, comment out the enum creation section in `schema.sql` and run only the table creation parts.

### Error: "permission denied"
Ensure your database user has CREATE TABLE and CREATE TYPE permissions.

## Notes

- This schema uses CUID format for IDs (text strings)
- All timestamps use `TIMESTAMP(3)` for millisecond precision
- Decimal fields use `DECIMAL(65,30)` for precise currency calculations
- Cascade deletes are configured for OrderItem, KitchenSheetItem, and ReturnItem

