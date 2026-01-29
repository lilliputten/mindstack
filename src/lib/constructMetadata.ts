import { Metadata } from 'next';

import { defaultLanguage, siteDescription, siteKeywords, siteTitle } from '@/config/env';
import { PUBLIC_URL } from '@/config/envServer';
import { getT } from '@/i18n';

export interface TConstructMetadataParams {
  /*extends Partial<Pick<SiteConfig, 'title' | 'description' | 'keywords'>>*/ title?: string;
  description?: string;
  keywords?: string;
  // logo?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  locale?: string;
  url?: string;
}

/** Server function to create html, oath, twitter and other meta data tags */
export async function constructMetadata(params: TConstructMetadataParams = {}): Promise<Metadata> {
  /* // NOTE: Opengraph warnings:
   *
   * According to https://www.opengraph.xyz/url/https%3A%2F%2Fmind-stack-trainer.vercel.app
   *
   * - [x] Image is 1250x650px. Recommended size is 1200x630px.
   * - [ ] Missing a call-to-action in your image
   * - [ ] Title is short (18 characters). Optimal: 50-60 characters
   * - [x] Description is short (27 chars). Optimal: 110-160 chars
   *
   * According to https://orcascan.com/tools/open-graph-validator?url=https%3A%2F%2Fmind-stack-trainer.vercel.app:
   *
   * The following Open Graph tags are missing from this webpage: <meta property="og:logo" content="your value" />
   */
  const {
    title,
    description,
    keywords,
    // logo = '/static/favicons/transparent-circle.png',
    image = '/static/opengraph-image-v2.jpg',
    icons = '/favicon.ico',
    noIndex = false,
    locale = defaultLanguage, // routing.defaultLocale as TLocale,
    url = PUBLIC_URL,
  } = params;
  const t = await getT({ locale });
  const imageUrl = url + image;
  const rootTitle = t('Pages.RootTitle') || siteTitle;
  // const logoUrl = url + logo;
  return {
    title: title || rootTitle,
    description: description || t('Pages.RootDescription') || siteDescription,
    keywords: [siteKeywords, t('Pages.RootKeywords'), keywords].filter(Boolean).join(', '),
    // authors: [{ name: 'lilliputten' }],
    // creator: 'lilliputten',
    openGraph: {
      type: 'website',
      locale, // 'en',
      url,
      title,
      description,
      siteName: rootTitle,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      // creator: '@lilliputten',
    },
    /* // It generated <meta name="og:logo" ...> instead of <meta property="og:logo" ...>
     * other: {
     *   'og:logo': logoUrl, // Absolute URL required
     *   'og:logo:width': '512',
     *   'og:logo:height': '512',
     * },
     */
    icons,
    metadataBase: new URL(url), // NOTE: It may break vercel build if there is a malformed url
    manifest: `${url}/site.webmanifest`,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
