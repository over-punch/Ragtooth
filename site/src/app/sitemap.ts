// Sitemap for ragtooth.com — single-page site
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://ragtooth.com',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 1,
		},
	]
}
