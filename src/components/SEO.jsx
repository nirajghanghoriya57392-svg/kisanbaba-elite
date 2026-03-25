import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ 
  title, 
  description, 
  canonical, 
  ogImage = '/og-image.png', 
  ogType = 'website',
  schemaData = null 
}) => {
  const { i18n } = useTranslation();
  const siteName = 'KisanBaba';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const currentLang = i18n.language || 'en';

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical || window.location.href} />
      <html lang={currentLang} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Language Alternates */}
      <link rel="alternate" hrefLang="hi" href={`${window.location.origin}${window.location.pathname}?lng=hi`} />
      <link rel="alternate" hrefLang="en" href={`${window.location.origin}${window.location.pathname}?lng=en`} />
      <link rel="alternate" hrefLang="x-default" href={window.location.origin} />

      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "KisanBaba",
          "url": "https://kisanbaba.in",
          "logo": "https://kisanbaba.in/logo.png",
          "sameAs": [
            "https://facebook.com/kisanbaba",
            "https://twitter.com/kisanbaba"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "areaServed": "IN",
            "availableLanguage": ["Hindi", "English"]
          }
        })}
      </script>

      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
