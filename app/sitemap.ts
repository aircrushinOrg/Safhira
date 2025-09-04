import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://safhira.vercel.app'
  const now = new Date()

  // Static top-level and nested routes present in the app router
  const staticRoutes = [
    '/',
    '/stis',
    '/stis/prevention',
    '/stis/prevalence',
    '/chat',
    '/chat/about',
    '/privacy-policy',
    '/terms-of-use',
    '/rights',
  ]

  // Key STI details that have dedicated dynamic pages
  const stiSlugs = [
    'chlamydia',
    'gonorrhea',
    'herpes',
    'hpv',
    'hiv',
    'syphilis',
  ]

  return [
    ...staticRoutes.map((path): MetadataRoute.Sitemap[number] => ({
      url: path === '/' ? baseUrl : `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: path === '/' ? 1 : 0.8,
    })),
    ...stiSlugs.map((slug): MetadataRoute.Sitemap[number] => ({
      url: `${baseUrl}/stis/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ]
}
