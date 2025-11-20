/**
 * Generate thumbnail images for all shader presets
 * 
 * Usage:
 *   npm run generate:thumbnails
 * 
 * Output: Creates base64 PNG data URLs for each preset shader
 * 
 * This script replicates the exact WebGL rendering logic from src/app/webgl.ts
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Read the presets and shaders files
const presetsPath = path.join(__dirname, '../src/app/presets.ts');
const shadersPath = path.join(__dirname, '../src/app/shaders.ts');

const presetsContent = fs.readFileSync(presetsPath, 'utf-8');
const shadersContent = fs.readFileSync(shadersPath, 'utf-8');

/**
 * Extract the VERTEX_SHADER from shaders.ts
 */
function extractVertexShader(content) {
  const match = content.match(/export const VERTEX_SHADER = `([\s\S]*?)`;/);
  return match ? match[1].trim() : null;
}

/**
 * Extract shader presets from TypeScript file
 * Parses the SHADER_PRESETS array to get id, name, fragmentShader, and defaultUniforms
 */
function extractPresets(content) {
  const presets = [];
  
  // Match each preset object - use non-greedy match for defaultUniforms up to },
  // which marks the end of the preset object
  const presetRegex = /{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["'],[\s\S]*?fragmentShader:\s*`([\s\S]*?)`,\s*defaultUniforms:\s*\[([\s\S]*?)\s*\]\s*,?\s*\}/g;
  
  let match;
  while ((match = presetRegex.exec(content)) !== null) {
    const [, id, name, fragmentShader, uniformsStr] = match;
    
    // Parse the defaultUniforms array
    const uniforms = parseUniforms(uniformsStr);
    
    presets.push({
      id,
      name,
      fragmentShader: fragmentShader.trim(),
      uniforms
    });
  }
  
  return presets;
}

/**
 * Parse uniform objects from the defaultUniforms array string
 * Handles float, vec3, and vec4 types with multi-line formatting
 */
function parseUniforms(uniformsStr) {
  const uniforms = [];
  
  // Split by },  to find object boundaries (handles multi-line objects)
  const parts = uniformsStr.split(/\},\s*/);
  
  parts.forEach(part => {
    // Add back the closing brace if it was removed
    const objStr = part.trim().endsWith('}') ? part : part + '}';
    
    // Extract individual fields
    const idMatch = objStr.match(/id:\s*["']([^"']+)["']/);
    const nameMatch = objStr.match(/name:\s*["']([^"']+)["']/);
    const typeMatch = objStr.match(/type:\s*["']([^"']+)["']/);
    const valueMatch = objStr.match(/value:\s*(\[[^\]]+\]|[\d.]+)/);
    
    if (idMatch && nameMatch && typeMatch && valueMatch) {
      const id = idMatch[1];
      const name = nameMatch[1];
      const type = typeMatch[1];
      const valueStr = valueMatch[1].trim();
      
      // Parse value
      let value;
      if (valueStr.startsWith('[')) {
        value = JSON.parse(valueStr);
      } else {
        value = parseFloat(valueStr);
      }
      
      uniforms.push({ id, name, value, type });
    }
  });
  
  return uniforms;
}

/**
 * Generate standalone HTML that renders a shader with uniforms
 * This replicates the exact WebGL setup from src/app/webgl.ts
 */
function generateShaderHTML(vertexShader, fragmentShader, uniforms) {
  // Escape backticks and template literals in shader code
  const escapedVertexShader = vertexShader.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const escapedFragmentShader = fragmentShader.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; }
    body { background: #000; overflow: hidden; }
    canvas { display: block; width: 512px; height: 512px; }
  </style>
</head>
<body>
  <canvas id="canvas" width="512" height="512"></canvas>
  <script>
    (function() {
      const canvas = document.getElementById('canvas');
      const gl = canvas.getContext('webgl', { 
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true
      });
      
      if (!gl) {
        console.error('WebGL not supported');
        window.renderComplete = false;
        return;
      }
      
      const VERTEX_SHADER = \`${escapedVertexShader}\`;
      const FRAGMENT_SHADER = \`${escapedFragmentShader}\`;
      
      function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const log = gl.getShaderInfoLog(shader);
          console.error('Shader compile error:', log);
          console.error('Source:', source);
          return null;
        }
        return shader;
      }
      
      const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      
      if (!vertShader || !fragShader) {
        window.renderComplete = false;
        return;
      }
      
      const program = gl.createProgram();
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        window.renderComplete = false;
        return;
      }
      
      gl.useProgram(program);
      
      // Set up position attribute
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      
      const positionLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
      
      // Set base uniforms
      const resolutionLoc = gl.getUniformLocation(program, 'iResolution');
      const timeLoc = gl.getUniformLocation(program, 'iTime');
      
      gl.uniform2f(resolutionLoc, 512, 512);
      gl.uniform1f(timeLoc, 3.7); // Advanced time for interesting frame
      
      // Set dynamic uniforms - replicate exact logic from webgl.ts renderShader()
      const uniforms = ${JSON.stringify(uniforms)};
      
      uniforms.forEach(uniform => {
        const loc = gl.getUniformLocation(program, uniform.name);
        if (loc === null) {
          console.warn('Uniform not found in shader:', uniform.name);
          return;
        }
        
        const { type, value } = uniform;
        
        if (type === 'float') {
          gl.uniform1f(loc, value);
        } else if (type === 'vec3') {
          gl.uniform3f(loc, value[0], value[1], value[2]);
        } else if (type === 'vec4') {
          gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
        }
      });
      
      // Clear and render
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // Signal completion
      window.renderComplete = true;
    })();
  </script>
</body>
</html>`;
}

/**
 * Main function to generate all thumbnails
 */
async function generateThumbnails() {
  console.log('🎨 Generating shader preset thumbnails...\n');
  
  // Extract vertex shader
  const vertexShader = extractVertexShader(shadersContent);
  if (!vertexShader) {
    console.error('❌ Failed to extract VERTEX_SHADER from shaders.ts');
    process.exit(1);
  }
  
  // Extract presets
  const presets = extractPresets(presetsContent);
  console.log(`Found ${presets.length} shader presets\n`);
  
  if (presets.length === 0) {
    console.error('❌ No presets found in presets.ts');
    process.exit(1);
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const thumbnails = {};
  
  // Generate thumbnail for each preset
  for (const preset of presets) {
    console.log(`📸 ${preset.name} (${preset.id})`);
    
    // Log uniform values for debugging
    console.log(`  Uniforms (${preset.uniforms.length}):`);
    preset.uniforms.forEach(u => {
      if (u.type === 'float') {
        console.log(`    - ${u.name} (${u.type}): ${u.value}`);
      } else if (u.type === 'vec3' || u.type === 'vec4') {
        console.log(`    - ${u.name} (${u.type}): [${u.value.join(', ')}]`);
      }
    });
    
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
      
      // Capture console logging from page for debugging
      page.on('console', msg => {
        console.log(`  [Browser] ${msg.text()}`);
      });
      
      // Load the shader HTML
      const html = generateShaderHTML(vertexShader, preset.fragmentShader, preset.uniforms);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait for WebGL to render
      await page.waitForFunction(() => window.renderComplete === true, { 
        timeout: 5000 
      });
      
      // Extra delay to ensure render is complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture screenshot as base64
      const screenshot = await page.screenshot({
        type: 'png',
        encoding: 'base64',
        omitBackground: false
      });
      
      thumbnails[preset.id] = `data:image/png;base64,${screenshot}`;
      
      console.log(`  ✓ Generated (${Math.round(screenshot.length / 1024)}KB)\n`);
      
      await page.close();
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
      if (error.stack) {
        console.error(`  Stack: ${error.stack.split('\n')[1]}`);
      }
      thumbnails[preset.id] = null;
    }
  }
  
  await browser.close();
  
  // Write output files
  const outputDir = path.join(__dirname, '../src/app/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write as JSON for reference
  const jsonPath = path.join(outputDir, 'preset-thumbnails.json');
  fs.writeFileSync(jsonPath, JSON.stringify(thumbnails, null, 2));
  console.log(`\n✅ Thumbnails saved to: ${jsonPath}`);
  
  // Generate TypeScript file
  const tsPath = path.join(outputDir, 'preset-thumbnails.ts');
  const tsContent = `// Auto-generated thumbnail data
// Generated: ${new Date().toISOString()}
// Command: npm run generate:thumbnails
// DO NOT EDIT MANUALLY - regenerate with: npm run generate:thumbnails

export const PRESET_THUMBNAILS: Record<string, string> = ${JSON.stringify(thumbnails, null, 2)};
`;
  fs.writeFileSync(tsPath, tsContent);
  console.log(`✅ TypeScript file saved to: ${tsPath}\n`);
  
  // Print stats
  const successCount = Object.values(thumbnails).filter(t => t !== null).length;
  const failCount = Object.values(thumbnails).filter(t => t === null).length;
  const totalSize = Object.values(thumbnails)
    .filter(t => t)
    .reduce((sum, t) => sum + t.length, 0);
  
  console.log(`📊 Summary:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total size: ${Math.round(totalSize / 1024)}KB`);
}

// Run the generator
generateThumbnails().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
