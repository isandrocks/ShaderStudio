/**
 * Simple thumbnail generator using canvas-based rendering
 * No Puppeteer required - uses node-canvas instead
 * 
 * Usage:
 *   1. Install: npm install --save-dev canvas gl
 *   2. Run: node scripts/generate-thumbnails-simple.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const { createContext } = require('gl');

// Read presets file
const presetsPath = path.join(__dirname, '../src/app/presets.ts');
const presetsContent = fs.readFileSync(presetsPath, 'utf-8');

// Simple preset parser
function extractPresets(content) {
  const presets = [];
  const regex = /{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["']/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    presets.push({
      id: match[1],
      name: match[2]
    });
  }
  
  return presets;
}

async function generatePlaceholders() {
  console.log('🎨 Generating placeholder thumbnails...\n');
  
  const presets = extractPresets(presetsContent);
  console.log(`Found ${presets.length} presets\n`);
  
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  
  const thumbnails = {};
  
  for (const preset of presets) {
    console.log(`Creating placeholder: ${preset.name}...`);
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    const hue = (presets.indexOf(preset) * 360 / presets.length) % 360;
    gradient.addColorStop(0, `hsl(${hue}, 50%, 20%)`);
    gradient.addColorStop(1, `hsl(${hue}, 50%, 10%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add text
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(preset.name, 128, 128);
    
    // Convert to base64
    const dataUrl = canvas.toDataURL('image/png');
    thumbnails[preset.id] = dataUrl;
    
    console.log(`  ✓ Generated\n`);
  }
  
  // Save output
  const outputDir = path.join(__dirname, '../src/app/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const tsPath = path.join(outputDir, 'preset-thumbnails.ts');
  const tsContent = `// Auto-generated placeholder thumbnails
// Generated on: ${new Date().toISOString()}

export const PRESET_THUMBNAILS: Record<string, string> = ${JSON.stringify(thumbnails, null, 2)};
`;
  
  fs.writeFileSync(tsPath, tsContent);
  console.log(`✅ Saved to: ${tsPath}\n`);
  console.log('💡 Replace with actual shader renders using generate-thumbnails.js\n');
}

generatePlaceholders().catch(console.error);
