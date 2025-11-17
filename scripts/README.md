# Shader Thumbnail Generator

This script automatically generates preview thumbnails for all shader presets.

## Setup

Install Puppeteer (one-time):
```bash
npm install --save-dev puppeteer
```

## Usage

Run the thumbnail generator:
```bash
node scripts/generate-thumbnails.js
```

This will:
1. Parse `src/app/presets.ts` to extract all shader presets
2. Render each shader using WebGL in a headless browser
3. Capture a 512×512 PNG screenshot at t=2.0 seconds
4. Generate base64-encoded data URLs
5. Save output to `src/app/generated/preset-thumbnails.ts`

## Integration

After generating thumbnails:

1. **Import the thumbnails in presets.ts:**
```typescript
import { PRESET_THUMBNAILS } from "./generated/preset-thumbnails";
```

2. **Update SHADER_PRESETS array:**
```typescript
export const SHADER_PRESETS: ShaderPreset[] = [
  {
    id: "multi-wave",
    name: "Multi Wave",
    // ... other fields
    thumbnail: PRESET_THUMBNAILS["multi-wave"],
  },
  // ... rest of presets
];
```

3. **Rebuild the plugin:**
```bash
npm run build
```

## Customization

Edit `generate-thumbnails.js` to customize:
- **Capture time**: Change `gl.uniform1f(iTime, 2.0)` to a different timestamp
- **Image size**: Modify canvas width/height (default: 512×512)
- **Image format**: Change `type: 'png'` to 'jpeg' for smaller files
- **Quality**: Add `quality: 80` for JPEG compression

## Troubleshooting

**Error: "Cannot find module 'puppeteer'"**
- Run: `npm install --save-dev puppeteer`

**Shader compilation errors:**
- Check console output for WebGL errors
- Verify shader syntax in presets.ts

**Large bundle size:**
- Consider using JPEG format with compression
- Or host thumbnails externally and use URLs
- Or generate smaller thumbnails (e.g., 256×256)

## File Size Optimization

Base64-encoded PNGs can be large (~50-100KB each). To reduce size:

1. **Use smaller dimensions:**
```javascript
const page = await browser.newPage();
await page.setViewport({ width: 256, height: 256 });
```

2. **Use JPEG format:**
```javascript
const screenshot = await page.screenshot({ 
  type: 'jpeg',
  quality: 75,
  encoding: 'base64'
});
```

3. **External hosting** (requires network access):
- Upload thumbnails to CDN/cloud storage
- Use URLs instead of base64 strings
