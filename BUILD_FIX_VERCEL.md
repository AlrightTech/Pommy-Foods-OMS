# Vercel Build Fix - TypeScript Type Error

## Issue
Build failing on Vercel with TypeScript error:
```
Type error: Type 'ProductPerformance[] | null' is not assignable to type 'ProductPerformanceData[] | undefined'.
Type 'null' is not assignable to type 'ProductPerformanceData[] | undefined'.
```

## Root Cause
- `useApi` hook returns `{ data: T | null }` (null when no data)
- `ProductPerformanceChart` component expected `data?: ProductPerformanceData[]` (undefined when no data)
- TypeScript strict type checking doesn't allow `null` where `undefined` is expected

## Solution

### 1. Updated Component Interface
**File**: `components/charts/product-performance-chart.tsx`
```typescript
// Before
interface ProductPerformanceChartProps {
  data?: ProductPerformanceData[]
  loading?: boolean
}

// After
interface ProductPerformanceChartProps {
  data?: ProductPerformanceData[] | null  // Now accepts null
  loading?: boolean
}
```

### 2. Updated Component Usage
**File**: `app/dashboard/analytics/page.tsx`
```typescript
// Before
<ProductPerformanceChart data={productData} loading={productLoading} />

// After
<ProductPerformanceChart 
  data={productData ?? undefined}  // Convert null to undefined
  loading={productLoading} 
/>
```

## Files Modified
1. `components/charts/product-performance-chart.tsx` - Updated interface to accept `null`
2. `app/dashboard/analytics/page.tsx` - Added null coalescing operator

## Verification
- ✅ TypeScript compilation passes
- ✅ ESLint passes
- ✅ No linter errors
- ✅ Build should now succeed on Vercel

## Status
✅ **FIXED** - Ready for deployment

