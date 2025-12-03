// Image lookup table for Wikipedia images
// Maps filename to actual Wikipedia Commons thumbnail URL base path
// Generated from ship_of_theseus_revisions.json
// Format: /thumb/{first_char}/{first_two_chars}/{filename}
//
// To find missing images, check browser console for warnings like:
// "Image not found in lookup: <filename>"
// Then add them here with the correct Wikipedia Commons URL

export const imageLookup: Record<string, string> = {
  // Images found in ship_of_theseus_revisions.json:
  'Teseo e Arianna, Pompei.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Teseo_e_Arianna%2C_Pompei.jpg/1036px-Teseo_e_Arianna%2C_Pompei.jpg',
  'USS Constitution fires a 17-gun salute.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/USS_Constitution_fires_a_17-gun_salute.jpg/1599px-USS_Constitution_fires_a_17-gun_salute.jpg',
  'Kinkaku3402CBcropped.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Kinkaku3402CBcropped.jpg/1600px-Kinkaku3402CBcropped.jpg',
  'Kinkaku-ji_close_up.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kinkaku-ji_close_up.jpg/1600px-Kinkaku-ji_close_up.jpg',
  'Naiku 01.JPG': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Naiku_01.JPG',
  
  // Add more images here as they are discovered
  // Example:
  // 'Another Image.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/X/XX/Another_Image.jpg',
}

// Helper function to get image URL for a given filename
// This matches the ImageUrlResolver type signature from showdown-wiki.ts
// Note: The lookup table contains full URLs with widths already included
export function getImageUrl(filename: string, width: number = 200): string {
  // Try exact match first
  let imageUrl = imageLookup[filename]
  
  // If not found, try case-insensitive match
  if (!imageUrl) {
    const lowerFilename = filename.toLowerCase()
    for (const [key, value] of Object.entries(imageLookup)) {
      if (key.toLowerCase() === lowerFilename) {
        imageUrl = value
        break
      }
    }
  }
  
  if (!imageUrl) {
    console.warn(`Image not found in lookup: "${filename}"`)
    return '' // Return empty string to trigger fallback to MD5
  }
  
  // The lookup table contains full URLs, so return them as-is
  // If you need different widths, update the URLs in the lookup table
  return imageUrl
}

