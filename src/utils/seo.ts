export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  title: string;
  description: string;
  category: 'core' | 'ai-chat' | 'pdf-tools' | 'image-studio' | 'video-tools' | 'account';
}

export const PLATFORM_SITEMAP_ROUTES: SitemapUrl[] = [
  {
    loc: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0,
    title: 'VSA AI - Smart Solutions, Smarter Future | Multi-Model AI Hub',
    description: 'All-in-one next-generation AI Workspace featuring multi-model conversational intelligence, Gemini AI, multi-lingual support, PDF processing, and image tools.',
    category: 'core',
  },
  {
    loc: '/?tab=chat',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.95,
    title: 'VSA AI Multi-Model Chat Assistant | 10+ Expert Personas & Indian Languages',
    description: 'Engage with Gemini 3.6 Flash, Claude 3.7, GPT-4o, DeepSeek R1, and specialized AI personas supporting English, Hindi, Maithili, Bhojpuri, and Punjabi.',
    category: 'ai-chat',
  },
  {
    loc: '/?tab=pdf',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.9,
    title: 'PDF Security & Processing Studio | Merge, Compress, OCR, Encrypt & Sign',
    description: 'Comprehensive browser-based & cloud PDF toolbox. Merge PDFs, compress file sizes, split pages, OCR text scanner, password protect, and electronic signing.',
    category: 'pdf-tools',
  },
  {
    loc: '/?tab=image',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.9,
    title: 'AI Image Studio | Text-to-Image, Enhance, Compress, Crop & Convert',
    description: 'Generate hyper-realistic AI imagery with Gemini Imagen, remove backgrounds, compress photos, crop, resize, and convert WebP, PNG, and JPEG.',
    category: 'image-studio',
  },
  {
    loc: '/?tab=video',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.85,
    title: 'Video Processing Studio | Audio MP3 Extractor, Trim & Transcode',
    description: 'Extract pristine high-bitrate audio from video files, clip & trim highlights, mute tracks, and convert media formats with zero quality loss.',
    category: 'video-tools',
  },
  {
    loc: '/?tab=dashboard',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.7,
    title: 'User Profile & Activity Dashboard | VSA AI Workspace',
    description: 'Manage your verified VSA AI account, track real-time API quota, review processing histories, and configure personal security credentials.',
    category: 'account',
  },
];

export function generateSitemapXml(baseUrl: string = 'https://ais-pre-wwwlpc7rpildcei3zcbgbb-1023392227228.asia-southeast1.run.app'): string {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  
  const urlsXml = PLATFORM_SITEMAP_ROUTES.map((route) => {
    const fullUrl = route.loc === '/' ? cleanBaseUrl : `${cleanBaseUrl}${route.loc}`;
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlsXml}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string = 'https://ais-pre-wwwlpc7rpildcei3zcbgbb-1023392227228.asia-southeast1.run.app'): string {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  return `# Robots.txt for VSA AI Platform
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

# Host
Host: ${cleanBaseUrl}

# Sitemaps
Sitemap: ${cleanBaseUrl}/sitemap.xml
`;
}
