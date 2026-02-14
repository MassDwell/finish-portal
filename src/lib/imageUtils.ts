/**
 * Converts a Google Drive URL to a local image path
 * Drive URLs: https://drive.google.com/uc?id=FILE_ID
 * Local paths: /images/FILE_ID.jpg
 */
export function getLocalImageUrl(driveUrl: string | undefined): string | undefined {
  if (!driveUrl) return undefined
  
  // Extract file ID from Drive URL
  // Handles both:
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://drive.google.com/file/d/FILE_ID/view
  let fileId: string | null = null
  
  // Try ?id= format
  const idMatch = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) {
    fileId = idMatch[1]
  }
  
  // Try /d/FILE_ID/ format  
  if (!fileId) {
    const dMatch = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (dMatch) {
      fileId = dMatch[1]
    }
  }
  
  // If we found a file ID, return local path
  if (fileId) {
    return `/images/${fileId}.jpg`
  }
  
  // If not a Drive URL, return as-is (might be already local)
  return driveUrl
}
