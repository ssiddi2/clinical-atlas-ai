

# Add Proper Open Graph & Twitter Card Meta Tags

## What's Wrong Now
- The `og:image` and `twitter:image` point to a generic Lovable placeholder (`https://lovable.dev/opengraph-image-p98pqg.png`) -- not your brand
- Missing `og:url`, `og:image:width`, `og:image:height` tags (needed for iMessage and social platforms to render correctly)
- Missing `twitter:title` and `twitter:description` tags

## What Needs to Happen

### 1. Create a branded OG preview image (1200x630)
You'll need to provide or create a 1200x630px landscape image representing Livemed Academy and place it in `public/og-preview.png`. This image should be:
- Your logo, tagline, and brand colors on a dark background
- Exactly 1200x630 pixels
- Saved as PNG or JPG

### 2. Update `index.html` meta tags
Replace the existing OG and Twitter meta block (lines 31-38) with complete tags:

**Open Graph tags:**
- `og:title` -- "Livemed Academy | AI-Powered Medical Education for IMGs"
- `og:description` -- "The global standard for AI-powered medical education. Virtual U.S. clinical rotations, USMLE-aligned curriculum, and ATLAS AI Professor."
- `og:image` -- `https://www.livemedacademy.org/og-preview.png`
- `og:image:width` -- "1200"
- `og:image:height` -- "630"
- `og:image:type` -- "image/png"
- `og:type` -- "website"
- `og:url` -- "https://www.livemedacademy.org"
- `og:site_name` -- "Livemed Academy"

**Twitter Card tags:**
- `twitter:card` -- "summary_large_image"
- `twitter:site` -- "@LivemedAcademy"
- `twitter:title` -- "Livemed Academy | AI-Powered Medical Education for IMGs"
- `twitter:description` -- "The global standard for AI-powered medical education. Virtual U.S. clinical rotations, USMLE-aligned curriculum, and ATLAS AI Professor."
- `twitter:image` -- `https://www.livemedacademy.org/og-preview.png`

## Important Note
You will need to upload a branded 1200x630 image to `public/og-preview.png`. If you don't have one ready, I can create a simple placeholder, but for best results you should design a proper branded image. The image URL must use your live domain (`https://www.livemedacademy.org/og-preview.png`) so social platforms can fetch it -- relative paths won't work for link previews.

## File Modified
| File | Changes |
|------|---------|
| `index.html` | Replace lines 31-38 with complete OG + Twitter meta tags |

