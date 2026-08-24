import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pixorva.com';
  const routes = [
    '',
    '/employees',
    '/pricing',
    '/docs',
    '/studio',
    '/login',
    '/trial',
    '/workspace',
    '/governance',
    '/billing',
    '/settings',
    '/privacy',
    '/terms',
    '/agent-detail/devon',
    '/agent-detail/ruby',
    '/agent-detail/quinn',
    '/agent-detail/cy',
    '/agent-detail/marcus',
    '/agent-detail/stella',
    '/agent-detail/gordon',
    '/agent-detail/vic',
    '/agent-detail/sarah',
    '/agent-detail/larry',
    '/agent-detail/holly',
    '/agent-detail/finn',
    '/agent-detail/lawson',
    '/agent-detail/pat',
    '/agent-detail/sam'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
