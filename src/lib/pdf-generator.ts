import jsPDF from 'jspdf'
import type { Project, ProjectSelection, FinishCategory, FinishOption } from './supabase'

export async function generateProjectPDF(
  project: Project, 
  selections: ProjectSelection[], 
  categories: FinishCategory[], 
  options: FinishOption[]
) {
  const pdf = new jsPDF()
  
  // Constants
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  let yPosition = 30

  // Helper functions
  const addText = (text: string, x: number, y: number, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize)
    if (isBold) {
      pdf.setFont('helvetica', 'bold')
    } else {
      pdf.setFont('helvetica', 'normal')
    }
    pdf.text(text, x, y)
    return y + (fontSize * 0.6) + 2
  }

  const addLine = (y: number) => {
    pdf.line(margin, y, pageWidth - margin, y)
    return y + 5
  }

  const checkPageBreak = (neededSpace: number) => {
    const pageHeight = pdf.internal.pageSize.getHeight()
    if (yPosition + neededSpace > pageHeight - 30) {
      pdf.addPage()
      yPosition = 30
    }
  }

  // Header
  pdf.setFillColor(1, 24, 50) // Deep Navy
  pdf.rect(0, 0, pageWidth, 25, 'F')
  pdf.setTextColor(255, 255, 255)
  yPosition = addText('MassDwell Finish Selection Summary', margin, 18, 18, true)
  
  pdf.setTextColor(0, 0, 0) // Reset to black
  yPosition += 10

  // Project Information
  yPosition = addText('PROJECT INFORMATION', margin, yPosition, 14, true)
  yPosition = addLine(yPosition)
  
  yPosition = addText(`Project Name: ${project.project_name}`, margin, yPosition, 12)
  yPosition = addText(`ADU Model: ${project.adu_model}`, margin, yPosition, 12)
  
  if (project.customer_email) {
    yPosition = addText(`Customer Email: ${project.customer_email}`, margin, yPosition, 12)
  }
  
  if (project.customer_phone) {
    yPosition = addText(`Customer Phone: ${project.customer_phone}`, margin, yPosition, 12)
  }
  
  yPosition = addText(`Created: ${new Date(project.created_at).toLocaleDateString()}`, margin, yPosition, 12)
  
  if (project.completed_at) {
    yPosition = addText(`Completed: ${new Date(project.completed_at).toLocaleDateString()}`, margin, yPosition, 12)
  }
  
  yPosition = addText(`Status: ${project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}`, margin, yPosition, 12)
  yPosition += 10

  // Helper function to get option for selection
  const getOptionForSelection = (selection: ProjectSelection): FinishOption | undefined => {
    return options.find(o => o.id === selection.option_id)
  }

  // Helper function to get selection for category
  const getSelectionForCategory = (categoryId: string): ProjectSelection | undefined => {
    return selections.find(s => s.category_id === categoryId)
  }

  // Calculate total upgrade cost
  const totalUpgradeCost = selections.reduce((total, selection) => {
    const option = getOptionForSelection(selection)
    return total + (option?.price_upgrade || 0)
  }, 0)

  // Selection Summary
  yPosition = addText('FINISH SELECTIONS', margin, yPosition, 14, true)
  yPosition = addLine(yPosition)

  for (const category of categories) {
    checkPageBreak(40)
    
    const selection = getSelectionForCategory(category.id)
    const option = selection ? getOptionForSelection(selection) : null
    
    yPosition = addText(category.display_name, margin, yPosition, 12, true)
    
    if (selection && option) {
      yPosition = addText(`Selected: ${option.name}`, margin + 10, yPosition, 11)
      
      if (option.description) {
        yPosition = addText(`Description: ${option.description}`, margin + 10, yPosition, 10)
      }
      
      if (option.price_upgrade && option.price_upgrade > 0) {
        yPosition = addText(`Upgrade Cost: +$${option.price_upgrade.toLocaleString()}`, margin + 10, yPosition, 11, true)
      } else {
        yPosition = addText('Cost: Standard (No additional charge)', margin + 10, yPosition, 11)
      }
      
      yPosition = addText(`Selected on: ${new Date(selection.updated_at || selection.created_at).toLocaleDateString()}`, margin + 10, yPosition, 9)
    } else {
      pdf.setTextColor(255, 0, 0) // Red for missing selections
      yPosition = addText('No selection made', margin + 10, yPosition, 11)
      pdf.setTextColor(0, 0, 0) // Reset to black
    }
    
    yPosition += 5
  }

  // Cost Summary
  if (totalUpgradeCost > 0) {
    checkPageBreak(30)
    yPosition += 10
    yPosition = addText('COST SUMMARY', margin, yPosition, 14, true)
    yPosition = addLine(yPosition)
    yPosition = addText(`Total Upgrade Cost: +$${totalUpgradeCost.toLocaleString()}`, margin, yPosition, 12, true)
    yPosition = addText('* This amount will be added to your base project cost', margin, yPosition, 9)
  }

  // Footer
  const pageHeight = pdf.internal.pageSize.getHeight()
  pdf.setFillColor(68, 89, 112) // Soft Denim
  pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(10)
  pdf.text('Generated by MassDwell Finish Selection Portal', margin, pageHeight - 8)
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 80, pageHeight - 8)

  // Generate filename
  const filename = `${project.project_name.replace(/[^a-z0-9]/gi, '_')}_Finish_Selections.pdf`
  
  // Download the PDF
  pdf.save(filename)
}