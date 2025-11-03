import { prisma } from "@/lib/prisma"
import { NotificationService } from "@/lib/services/notification.service"

/**
 * Background job to send payment reminders for overdue invoices
 * Should be run daily
 */
export async function sendPaymentReminders() {
  try {
    console.log("Starting payment reminder check...")
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Find overdue invoices (status PENDING or PARTIAL, due date < today)
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: ["PENDING", "PARTIAL"],
        },
        dueDate: {
          lt: today,
        },
      },
      include: {
        store: {
          include: {
            users: {
              where: {
                role: {
                  in: ["STORE_OWNER", "STORE_MANAGER"],
                },
                isActive: true,
              },
            },
          },
        },
      },
    })
    
    // Update status to OVERDUE
    await prisma.invoice.updateMany({
      where: {
        id: {
          in: overdueInvoices.map((inv) => inv.id),
        },
      },
      data: {
        status: "OVERDUE",
      },
    })
    
    // Send notifications to store owners/managers
    for (const invoice of overdueInvoices) {
      if (invoice.store.users.length > 0) {
        const userIds = invoice.store.users.map((u) => u.id)
        
        await NotificationService.createNotificationsForUsers(userIds, {
          title: "Payment Reminder",
          message: `Invoice ${invoice.invoiceNumber} is overdue. Amount due: $${Number(invoice.totalAmount).toFixed(2)}. Please arrange payment.`,
          type: "INVOICE_GENERATED", // Using existing type
          relatedId: invoice.id,
          relatedType: "invoice",
        })
      }
    }
    
    console.log(`Payment reminder check completed: ${overdueInvoices.length} overdue invoices processed`)
    
    return {
      overdueInvoices: overdueInvoices.length,
      notificationsSent: overdueInvoices.reduce((sum, inv) => sum + inv.store.users.length, 0),
    }
  } catch (error) {
    console.error("Error in payment reminder job:", error)
    throw error
  }
}

