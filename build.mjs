// Concatenates the 5 section HTML fragments into a single public/index.html,
// then copies static pages and assets into public/ for Vercel to serve.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const out = join(root, 'public');
if (!existsSync(out)) mkdirSync(out, { recursive: true });

const sections = [
  'section-1-hero-quiz.html',
  'section-2-reviews.html',
  'section-3-how-it-works.html',
  'section-4-cta.html',
  'section-5-footer.html'
].map(f => readFileSync(join(root, f), 'utf8')).join('\n');

const pixelId = process.env.META_PIXEL_ID || '3963782680424186';

const indexHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pristine Home Care — Atlanta's Trusted Cleaning Service</title>
<meta name="description" content="Get a free quote in 60 seconds. Residential and commercial cleaning across North Atlanta — Marietta, Roswell, Sandy Springs, Alpharetta and more.">
<link rel="icon" type="image/png" href="/pristine-logo.png">

<!-- Meta Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/></noscript>
</head>
<body>
${sections}
</body>
</html>
`;

writeFileSync(join(out, 'index.html'), indexHtml);

const copies = [
  'thank-you-page.html',
  'privacy-policy.html',
  'terms-and-conditions.html',
  'pristine-logo.png',
  'pristine-logo.svg',
  'pristine-logo.webp'
];
for (const f of copies) {
  const src = join(root, f);
  if (!existsSync(src)) continue;
  const dest = f === 'thank-you-page.html' ? join(out, 'thank-you.html') : join(out, f);
  copyFileSync(src, dest);
}

writeFileSync(join(out, '.nojekyll'), '');

console.log('Build complete →', out);
