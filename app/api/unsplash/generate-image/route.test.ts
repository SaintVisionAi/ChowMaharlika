import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock environment variable
vi.stubEnv('UNSPLASH_ACCESS_KEY', undefined)

describe('Unsplash Image Generation API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST endpoint validation', () => {
    it('should return 400 error when product name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Product name is required')
    })

    it('should return fallback image when no API key is configured', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Fresh Salmon', category: 'seafood' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('imageUrl')
      expect(data).toHaveProperty('source')
      expect(data.source).toBe('fallback')
      expect(data.imageUrl).toContain('unsplash.com')
    })

    it('should handle salmon products correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Fresh Atlantic Salmon', category: 'seafood' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.imageUrl).toContain('unsplash.com')
      // Should return salmon-specific image
      expect(data.imageUrl).toContain('photo-1485921325833')
    })

    it('should handle shrimp products correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Jumbo Shrimp', category: 'seafood' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.imageUrl).toContain('unsplash.com')
      // Should return shrimp-specific image
      expect(data.imageUrl).toContain('photo-1565680018434')
    })

    it('should handle lobster products correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Live Maine Lobster', category: 'seafood' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.imageUrl).toContain('unsplash.com')
      // Should return lobster-specific image
      expect(data.imageUrl).toContain('photo-1625152587976')
    })

    it('should handle rice products correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Jasmine Rice (25lb)', category: 'grocery' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.imageUrl).toContain('unsplash.com')
      // Should return rice-specific image
      expect(data.imageUrl).toContain('photo-1586201375761')
    })

    it('should use category fallback when product name has no keyword match', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Special Product XYZ', category: 'seafood' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.imageUrl).toContain('unsplash.com')
      // Should return seafood category image
      expect(data.imageUrl).toContain('photo-1559827260')
    })

    it('should handle products with no category', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Generic Product' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.imageUrl).toContain('unsplash.com')
      // Should return default fallback
      expect(data.imageUrl).toContain('photo-1542838132')
    })

    it('should handle meat products correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Premium Beef Steak', category: 'meat' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.imageUrl).toContain('unsplash.com')
      // Should return beef-specific image
      expect(data.imageUrl).toContain('photo-1603048588665')
    })

    it('should handle case-insensitive product names', async () => {
      const lowercase = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'salmon fillet' }),
      })

      const uppercase = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'SALMON FILLET' }),
      })

      const response1 = await POST(lowercase)
      const data1 = await response1.json()

      const response2 = await POST(uppercase)
      const data2 = await response2.json()

      expect(data1.imageUrl).toBe(data2.imageUrl)
    })
  })

  describe('Error handling', () => {
    it('should handle malformed JSON gracefully with fallback', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: 'invalid json{{{',
      })

      // API gracefully handles errors by returning fallback images
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('imageUrl')
      expect(data).toHaveProperty('source')
      expect(data.source).toBe('error-fallback')
    })
  })

  describe('Response structure', () => {
    it('should return proper response structure with all required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
        method: 'POST',
        body: JSON.stringify({ productName: 'Fresh Salmon', category: 'seafood' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toHaveProperty('imageUrl')
      expect(data).toHaveProperty('source')
      expect(typeof data.imageUrl).toBe('string')
      expect(data.imageUrl.length).toBeGreaterThan(0)
    })

    it('should return valid image URLs', async () => {
      const products = [
        { name: 'Fresh Salmon', category: 'seafood' },
        { name: 'Jasmine Rice', category: 'grocery' },
        { name: 'Beef Steak', category: 'meat' },
      ]

      for (const product of products) {
        const request = new NextRequest('http://localhost:3000/api/unsplash/generate-image', {
          method: 'POST',
          body: JSON.stringify({ productName: product.name, category: product.category }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(data.imageUrl).toMatch(/^https:\/\/images\.unsplash\.com\//)
      }
    })
  })
})
