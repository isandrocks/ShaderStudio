/**
 * Generate thumbnail images for all shader presets
 * 
 * Usage:
 *   1. Install dependencies: npm install --save-dev puppeteer
 *   2. Run script: node scripts/generate-thumbnails.js
 * 
 * Output: Creates base64 data URLs for each preset shader
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Import presets (we'll read from the actual file)
const presetsPath = path.join(__dirname, '../src/app/presets.ts');
const presetsContent = fs.readFileSync(presetsPath, 'utf-8');

// Extract preset data by parsing the TypeScript file
// This is a simple parser - for production, consider using @babel/parser
function extractPresets(content) {
  const presets = [];
  const presetMatches = content.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["'],[\s\S]*?fragmentShader:\s*`([\s\S]*?)`,[\s\S]*?defaultUniforms:\s*\[([\s\S]*?)\]/g);
  
  for (const match of presetMatches) {
    const [, id, name, fragmentShader, uniformsStr] = match;
    
    // Parse uniforms (simplified - assumes specific format)
    const uniforms = [];
    const uniformMatches = uniformsStr.matchAll(/{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["'],\s*value:\s*([0-9.]+)/g);
    for (const uMatch of uniformMatches) {
      uniforms.push({
        name: uMatch[2],
        value: parseFloat(uMatch[3])
      });
    }
    
    presets.push({ id, name, fragmentShader, uniforms });
  }
  
  return presets;
}

// Generate HTML template for rendering shader
function generateShaderHTML(fragmentShader, uniforms) {
  const vertexShader = `
    attribute vec2 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: #1e1e1e; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas" width="512" height="512"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');
    
    const VERTEX_SHADER = \`${vertexShader}\`;
    const FRAGMENT_SHADER = \`${fragmentShader}\`;
    
    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }
    
    const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    // Set up quad vertices
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]), gl.STATIC_DRAW);
    
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    const iResolution = gl.getUniformLocation(program, 'iResolution');
    gl.uniform2f(iResolution, 512, 512);
    
    const iTime = gl.getUniformLocation(program, 'iTime');
    gl.uniform1f(iTime, 2.0); // Capture at 2 seconds for variety
    
    // Set dynamic uniforms
    ${uniforms.map(u => `
    const ${u.name} = gl.getUniformLocation(program, '${u.name}');
    if (${u.name}) gl.uniform1f(${u.name}, ${u.value});
    `).join('\n')}
    
    // Render
    gl.viewport(0, 0, 512, 512);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Signal that rendering is complete
    window.renderComplete = true;
  </script>
</body>
</html>
  `;
}

async function generateThumbnails() {
  console.log('🎨 Generating shader thumbnails...\n');
  
  const presets = extractPresets(presetsContent);
  console.log(`Found ${presets.length} presets to render\n`);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const thumbnails = {};
  
  for (const preset of presets) {
    console.log(`Rendering: ${preset.name}...`);
    
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 512, height: 512 });
      
      const html = generateShaderHTML(preset.fragmentShader, preset.uniforms);
      await page.setContent(html);
      
      // Wait for render to complete
      await page.waitForFunction(() => window.renderComplete, { timeout: 5000 });
      
      // Small delay to ensure WebGL finishes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture screenshot as base64
      const screenshot = await page.screenshot({ 
        type: 'png',
        encoding: 'base64'
      });
      
      thumbnails[preset.id] = `data:image/png;base64,${screenshot}`;
      
      console.log(`  ✓ Generated (${Math.round(screenshot.length / 1024)}KB)\n`);
      
      await page.close();
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}\n`);
      thumbnails[preset.id] = null;
    }
  }
  
  await browser.close();
  
  // Write output files
  const outputDir = path.join(__dirname, '../src/app/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write as JSON for easy import
  const jsonPath = path.join(outputDir, 'preset-thumbnails.json');
  fs.writeFileSync(jsonPath, JSON.stringify(thumbnails, null, 2));
  console.log(`\n✅ Thumbnails saved to: ${jsonPath}`);
  
  // Generate TypeScript file
  const tsPath = path.join(outputDir, 'preset-thumbnails.ts');
  const tsContent = `// Auto-generated thumbnail data
// Generated on: ${new Date().toISOString()}
// Run: node scripts/generate-thumbnails.js

export const PRESET_THUMBNAILS: Record<string, string> = ${JSON.stringify(thumbnails, null, 2)};
`;
  fs.writeFileSync(tsPath, tsContent);
  console.log(`✅ TypeScript file saved to: ${tsPath}\n`);
  
  // Print stats
  const totalSize = Object.values(thumbnails)
    .filter(t => t)
    .reduce((sum, t) => sum + t.length, 0);
  console.log(`📊 Stats:`);
  console.log(`   Total thumbnails: ${Object.keys(thumbnails).length}`);
  console.log(`   Total size: ${Math.round(totalSize / 1024)}KB`);
  console.log(`   Average size: ${Math.round(totalSize / Object.keys(thumbnails).length / 1024)}KB\n`);
  
  console.log('💡 Next steps:');
  console.log('   1. Import: import { PRESET_THUMBNAILS } from "./generated/preset-thumbnails";');
  console.log('   2. Update presets.ts to add thumbnails to each preset');
  console.log('   3. Rebuild: npm run build\n');
}

generateThumbnails().catch(console.error);
