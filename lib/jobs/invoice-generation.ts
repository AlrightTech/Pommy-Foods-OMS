import { InvoiceService } from "@/lib/services/invoice.service"

/**
 * Background job to auto-generate invoices for delivered orders
 * Should be run after deliveries are completed
 */
export async function generateInvoicesForDeliveredOrders() {
  try {
    console.log("Starting invoice generation for delivered orders...")
    
    const result = await InvoiceService.autoGenerateInvoices()
    
    console.log(`Invoice generation completed:`, {
      ordersProcessed: result.ordersProcessed,
      invoicesGenerated: result.invoicesGenerated,
    })
    
    return result
  } catch (error) {
    console.error("Error in invoice generation job:", error)
    throw error
  }
}

