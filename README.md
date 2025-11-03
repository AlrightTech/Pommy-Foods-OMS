# Pommy Foods - Digital Distribution System

A comprehensive order management system for Pommy Foods, built with Next.js 14, TypeScript, Prisma, and Supabase.

## Features

- 🛒 **Order Management**: Manual and auto-replenishment orders
- 👨‍🍳 **Kitchen Module**: Kitchen sheet generation and tracking
- 🚚 **Delivery Management**: Driver assignment and route optimization
- 📊 **Analytics & Reporting**: Sales, stock, and delivery insights
- 💰 **Invoicing & Payments**: Automated invoicing and payment tracking
- 🌡️ **Temperature Compliance**: Temperature logging and alerts
- 📱 **Driver Mobile App**: PWA for delivery execution
- 🔔 **Real-time Notifications**: In-app and email notifications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)
- PostgreSQL database (local or Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pommy-foods
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/pommy_foods"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

After seeding:
- **Email**: `admin@pommyfoods.com`
- **Password**: `admin123` (or value from `ADMIN_PASSWORD` env var)

⚠️ **Change this password immediately in production!**

## Project Structure

```
pommy-foods/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard pages
│   ├── store/             # Store owner portal
│   ├── driver/            # Driver mobile app
│   └── login/             # Auth pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── [module]/         # Feature-specific components
├── lib/                  # Utilities and services
│   ├── services/        # Business logic services
│   ├── jobs/            # Background jobs
│   └── utils/           # Helper functions
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes (dev)
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models:

- **User** - System users with role-based access
- **Store** - Customer stores
- **Product** - Product catalog
- **Order** - Orders (manual and auto-generated)
- **KitchenSheet** - Kitchen preparation sheets
- **Delivery** - Delivery management
- **Invoice** - Invoicing
- **Payment** - Payment tracking
- **TemperatureLog** - Temperature compliance
- **Return** - Returns and wastage
- **Notification** - System notifications

## User Roles

- **SUPER_ADMIN** - Full system access
- **ADMIN** - Administrative access
- **STORE_OWNER** - Store portal access
- **STORE_MANAGER** - Store management access
- **KITCHEN_STAFF** - Kitchen module access
- **DRIVER** - Driver app access

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for Supabase + Vercel.

### Quick Deploy

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## API Documentation

API routes follow RESTful conventions:

- `GET /api/[resource]` - List resources
- `GET /api/[resource]/[id]` - Get resource
- `POST /api/[resource]` - Create resource
- `PUT /api/[resource]/[id]` - Update resource
- `DELETE /api/[resource]/[id]` - Delete resource

All API routes require authentication (except `/api/auth` and `/api/health`).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.

---

Built with ❤️ for Pommy Foods
