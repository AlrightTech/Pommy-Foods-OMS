import { jsPDF } from "jspdf"

export interface InvoicePDFData {
  invoice: {
    id: string
    invoiceNumber: string
    orderId: string
    storeId: string
    totalAmount: number | string
    subtotal: number | string
    discount: number | string
    tax: number | string
    returnAdjustment: number | string
    dueDate: string | Date
    issuedAt: string | Date
    status: string
    order?: {
      orderNumber: string
      store?: {
        name: string
        address?: string
        city?: string
        region?: string
        contactName?: string
        email?: string
        phone?: string
      }
      items?: Array<{
        product?: {
          name: string
          sku: string
        }
        quantity: number
        unitPrice: number | string
        totalPrice: number | string
      }>
    }
    store?: {
      name: string
      address?: string
      city?: string
      region?: string
      contactName?: string
      email?: string
      phone?: string
    }
  }
  paidAmount: number
  remainingAmount: number
}

export function generateInvoicePDF(data: InvoicePDFData): jsPDF {
  const doc = new jsPDF()
  
  const invoice = data.invoice
  const store = invoice.store || invoice.order?.store
  const items = invoice.order?.items || []
  
  // Company info (Pommy Foods)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Pommy Foods", 20, 20)
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Invoice", 20, 30)
  
  // Invoice details
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 140, 20)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Order #: ${invoice.orderId}`, 140, 28)
  doc.text(`Date: ${new Date(invoice.issuedAt).toLocaleDateString()}`, 140, 36)
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 140, 44)
  
  // Store/Client info
  let yPos = 55
  if (store) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Bill To:", 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(store.name || "N/A", 20, yPos)
    yPos += 6
    
    if (store.address) {
      doc.text(store.address, 20, yPos)
      yPos += 6
    }
    
    if (store.city && store.region) {
      doc.text(`${store.city}, ${store.region}`, 20, yPos)
      yPos += 6
    }
    
    if (store.phone) {
      doc.text(`Phone: ${store.phone}`, 20, yPos)
      yPos += 6
    }
    
    if (store.email) {
      doc.text(`Email: ${store.email}`, 20, yPos)
      yPos += 6
    }
  }
  
  // Items table
  yPos += 10
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  
  // Table headers
  doc.text("Item", 20, yPos)
  doc.text("SKU", 70, yPos)
  doc.text("Qty", 110, yPos)
  doc.text("Price", 130, yPos)
  doc.text("Total", 160, yPos)
  
  yPos += 8
  doc.setLineWidth(0.5)
  doc.line(20, yPos, 180, yPos)
  yPos += 5
  
  // Table rows
  doc.setFont("helvetica", "normal")
  items.forEach((item) => {
    const productName = item.product?.name || "Unknown Product"
    const sku = item.product?.sku || "N/A"
    const quantity = item.quantity || 0
    const unitPrice = Number(item.unitPrice || 0)
    const totalPrice = Number(item.totalPrice || 0)
    
    // Wrap text if too long
    const lines = doc.splitTextToSize(productName, 45)
    lines.forEach((line: string, index: number) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.text(line, 20, yPos + (index * 5))
    })
    
    doc.text(sku, 70, yPos)
    doc.text(quantity.toString(), 110, yPos)
    doc.text(`$${unitPrice.toFixed(2)}`, 130, yPos)
    doc.text(`$${totalPrice.toFixed(2)}`, 160, yPos)
    
    yPos += lines.length * 5 + 5
  })
  
  // Totals
  yPos += 5
  doc.line(20, yPos, 180, yPos)
  yPos += 10
  
  const subtotal = Number(invoice.subtotal || 0)
  const discount = Number(invoice.discount || 0)
  const tax = Number(invoice.tax || 0)
  const returnAdjustment = Number(invoice.returnAdjustment || 0)
  const total = Number(invoice.totalAmount || 0)
  
  doc.text(`Subtotal:`, 130, yPos)
  doc.text(`$${subtotal.toFixed(2)}`, 160, yPos)
  yPos += 6
  
  if (discount > 0) {
    doc.text(`Discount:`, 130, yPos)
    doc.text(`-$${discount.toFixed(2)}`, 160, yPos)
    yPos += 6
  }
  
  if (tax > 0) {
    doc.text(`Tax:`, 130, yPos)
    doc.text(`$${tax.toFixed(2)}`, 160, yPos)
    yPos += 6
  }
  
  if (returnAdjustment > 0) {
    doc.text(`Return Adjustment:`, 130, yPos)
    doc.text(`-$${returnAdjustment.toFixed(2)}`, 160, yPos)
    yPos += 6
  }
  
  yPos += 2
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.line(130, yPos, 180, yPos)
  yPos += 8
  doc.text(`Total:`, 130, yPos)
  doc.text(`$${total.toFixed(2)}`, 160, yPos)
  
  // Payment info
  yPos += 15
  if (data.paidAmount > 0) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Paid: $${data.paidAmount.toFixed(2)}`, 130, yPos)
    yPos += 6
    doc.text(`Remaining: $${data.remainingAmount.toFixed(2)}`, 130, yPos)
  }
  
  // Footer
  yPos = doc.internal.pageSize.height - 20
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.text("Thank you for your business!", 20, yPos)
  doc.text(`Status: ${invoice.status}`, 140, yPos)
  
  return doc
}

export function downloadInvoicePDF(data: InvoicePDFData, filename?: string) {
  const doc = generateInvoicePDF(data)
  const invoiceNumber = data.invoice.invoiceNumber || data.invoice.id
  const downloadFilename = filename || `invoice-${invoiceNumber}.pdf`
  doc.save(downloadFilename)
}

