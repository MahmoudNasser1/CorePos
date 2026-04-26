"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface ExportOptions {
  filename: string
  elementId: string
  title: string
}

export async function exportToPremiumPDF({ filename, elementId }: ExportOptions) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error("Element not found")
    return
  }

  try {
    // 1. Capture the element as a high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for premium quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    // 2. Add some headers/branding if needed
    // Note: Since we captured the whole element including headers, we just place the Image
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

    // 3. Save the PDF
    pdf.save(`${filename}_${new Date().getTime()}.pdf`)
    
    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}
