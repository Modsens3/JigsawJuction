// Test script to check if downloaded SVG is clean for laser cutting
const fs = require('fs');
const path = require('path');

function checkSVGForLaserCutting(svgFilePath) {
  try {
    const svgContent = fs.readFileSync(svgFilePath, 'utf8');
    
    console.log('=== SVG Analysis ===');
    console.log('File:', svgFilePath);
    console.log('Size:', svgContent.length, 'characters');
    
    // Check for unwanted elements
    const hasDefs = svgContent.includes('<defs');
    const hasPattern = svgContent.includes('<pattern');
    const hasImage = svgContent.includes('<image');
    const hasRect = svgContent.includes('<rect');
    const hasPath = svgContent.includes('<path');
    
    console.log('\n=== Element Check ===');
    console.log('Has <defs>:', hasDefs);
    console.log('Has <pattern>:', hasPattern);
    console.log('Has <image>:', hasImage);
    console.log('Has <rect>:', hasRect);
    console.log('Has <path>:', hasPath);
    
    // Count paths
    const pathMatches = svgContent.match(/<path[^>]*\/?>/g);
    const pathCount = pathMatches ? pathMatches.length : 0;
    console.log('Path count:', pathCount);
    
    // Check if it's clean for laser cutting
    const isCleanForLaser = hasPath && !hasDefs && !hasPattern && !hasImage && !hasRect;
    
    console.log('\n=== Laser Cutting Ready ===');
    console.log('Clean for laser cutting:', isCleanForLaser ? '✅ YES' : '❌ NO');
    
    if (!isCleanForLaser) {
      console.log('\n=== Issues Found ===');
      if (hasDefs) console.log('- Contains <defs> (should be removed)');
      if (hasPattern) console.log('- Contains <pattern> (should be removed)');
      if (hasImage) console.log('- Contains <image> (should be removed)');
      if (hasRect) console.log('- Contains <rect> (should be removed)');
      if (!hasPath) console.log('- No <path> elements found');
    }
    
    // Show first 500 characters
    console.log('\n=== SVG Preview (first 500 chars) ===');
    console.log(svgContent.substring(0, 500));
    
    return isCleanForLaser;
    
  } catch (error) {
    console.error('Error reading SVG file:', error.message);
    return false;
  }
}

// Test with a sample SVG file if it exists
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  const svgFiles = files.filter(f => f.endsWith('.svg'));
  
  if (svgFiles.length > 0) {
    console.log('Found SVG files in uploads directory:');
    svgFiles.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      console.log('\n' + '='.repeat(50));
      checkSVGForLaserCutting(filePath);
    });
  } else {
    console.log('No SVG files found in uploads directory');
  }
} else {
  console.log('Uploads directory not found');
}

module.exports = { checkSVGForLaserCutting };
