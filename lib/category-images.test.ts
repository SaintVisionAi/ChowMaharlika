import { describe, it, expect } from 'vitest'
import { getCategoryImage, getAllCategories, CATEGORY_IMAGES } from './category-images'

describe('category-images', () => {
  describe('getCategoryImage', () => {
    it('should return correct image for exact category match', () => {
      const result = getCategoryImage('seafood')
      
      expect(result).toEqual({
        url: expect.stringContaining('unsplash.com'),
        alt: 'Fresh seafood display with various fish and shellfish'
      })
      expect(result.url).toContain('photo-1559827260-dc66d52bef19')
    })

    it('should return correct image for grocery category', () => {
      const result = getCategoryImage('grocery')
      
      expect(result).toEqual({
        url: expect.stringContaining('unsplash.com'),
        alt: 'Grocery items and pantry staples'
      })
      expect(result.url).toContain('photo-1542838132-92c53300491e')
    })

    it('should match category case-insensitively', () => {
      const lowercase = getCategoryImage('seafood')
      const uppercase = getCategoryImage('SEAFOOD')
      const mixed = getCategoryImage('SeAfOoD')
      
      expect(lowercase).toEqual(uppercase)
      expect(lowercase).toEqual(mixed)
    })

    it('should handle partial category matches', () => {
      const result = getCategoryImage('seafood-fresh')
      
      // Should match 'seafood' from the partial match
      expect(result.url).toContain('unsplash.com')
      expect(result).not.toEqual(CATEGORY_IMAGES.default)
    })

    it('should return default image for unknown category', () => {
      const result = getCategoryImage('unknown-category-xyz')
      
      expect(result).toEqual(CATEGORY_IMAGES.default)
      expect(result.url).toContain('unsplash.com')
    })

    it('should return default image for empty string', () => {
      const result = getCategoryImage('')
      
      expect(result).toEqual(CATEGORY_IMAGES.default)
    })

    it('should return default image for undefined', () => {
      const result = getCategoryImage(undefined)
      
      expect(result).toEqual(CATEGORY_IMAGES.default)
    })

    it('should handle whitespace in category names', () => {
      const result = getCategoryImage('  seafood  ')
      
      expect(result.url).toContain('photo-1559827260-dc66d52bef19')
    })

    it('should match all main categories correctly', () => {
      const categories = ['seafood', 'grocery', 'fish', 'meat', 'produce', 'frozen', 'bakery']
      
      categories.forEach(category => {
        const result = getCategoryImage(category)
        expect(result.url).toContain('unsplash.com')
        expect(result.alt).toBeTruthy()
        expect(result).not.toEqual(CATEGORY_IMAGES.default)
      })
    })
  })

  describe('getAllCategories', () => {
    it('should return all categories except default', () => {
      const categories = getAllCategories()
      
      expect(categories.length).toBeGreaterThan(0)
      expect(categories.every(c => c.category !== 'default')).toBe(true)
    })

    it('should return categories with valid image objects', () => {
      const categories = getAllCategories()
      
      categories.forEach(({ category, image }) => {
        expect(typeof category).toBe('string')
        expect(image).toHaveProperty('url')
        expect(image).toHaveProperty('alt')
        expect(image.url).toContain('unsplash.com')
      })
    })

    it('should include main food categories', () => {
      const categories = getAllCategories()
      const categoryNames = categories.map(c => c.category)
      
      expect(categoryNames).toContain('seafood')
      expect(categoryNames).toContain('grocery')
      expect(categoryNames).toContain('meat')
      expect(categoryNames).toContain('produce')
    })
  })

  describe('CATEGORY_IMAGES constant', () => {
    it('should have all required main categories', () => {
      expect(CATEGORY_IMAGES).toHaveProperty('seafood')
      expect(CATEGORY_IMAGES).toHaveProperty('grocery')
      expect(CATEGORY_IMAGES).toHaveProperty('meat')
      expect(CATEGORY_IMAGES).toHaveProperty('produce')
      expect(CATEGORY_IMAGES).toHaveProperty('default')
    })

    it('should have valid Unsplash URLs for all categories', () => {
      Object.entries(CATEGORY_IMAGES).forEach(([key, value]) => {
        expect(value.url).toContain('unsplash.com')
        expect(value.url).toContain('?w=800')
        expect(value.alt).toBeTruthy()
        expect(typeof value.alt).toBe('string')
      })
    })

    it('should have seafood subcategories', () => {
      expect(CATEGORY_IMAGES).toHaveProperty('salmon')
      expect(CATEGORY_IMAGES).toHaveProperty('shrimp')
      expect(CATEGORY_IMAGES).toHaveProperty('lobster')
      expect(CATEGORY_IMAGES).toHaveProperty('crab')
    })

    it('should have grocery subcategories', () => {
      expect(CATEGORY_IMAGES).toHaveProperty('rice')
      expect(CATEGORY_IMAGES).toHaveProperty('noodles')
      expect(CATEGORY_IMAGES).toHaveProperty('sauce')
    })
  })
})
