// Test script to verify fractal generator creates proper laser cutting SVG
const { CircleFractalJigsaw } = require('./client/src/lib/fractal-generator.ts');

function testFractalLaserSVG() {
  console.log('=== Testing Fractal Generator Laser SVG ===');
  
  try {
    // Create puzzle generator
    const jig = new CircleFractalJigsaw(10, 8, 1, 3);
    jig.setSeed(123);
    
    // Generate the puzzle
    console.log('Generating puzzle...');
    jig.generate();
    
    let fillIterations = 0;
    while (jig.fillholes(false) && fillIterations < 10) {
      fillIterations++;
    }
    jig.fillholes(true);
    
    console.log('Puzzle generated with', jig.getPieceCount(), 'pieces');
    
    // Generate preview SVG (with frame)
    const frame = 10;
    const crad = 15;
    const arcShape = 0;
    
    const previewSVG = jig.exportSVG(frame, crad, arcShape);
    console.log('\n=== Preview SVG ===');
    console.log('Length:', previewSVG.length);
    console.log('Contains <defs>:', previewSVG.includes('<defs'));
    console.log('Contains <pattern>:', previewSVG.includes('<pattern'));
    console.log('Contains <image>:', previewSVG.includes('<image'));
    console.log('Contains <rect>:', previewSVG.includes('<rect'));
    console.log('Contains <path>:', previewSVG.includes('<path'));
    
    // Generate laser SVG (without frame)
    const laserFrame = 0;
    const laserSVG = jig.exportSVGSinglePath(laserFrame, crad, arcShape);
    
    console.log('\n=== Laser SVG ===');
    console.log('Length:', laserSVG.length);
    console.log('Contains <defs>:', laserSVG.includes('<defs'));
    console.log('Contains <pattern>:', laserSVG.includes('<pattern'));
    console.log('Contains <image>:', laserSVG.includes('<image'));
    console.log('Contains <rect>:', laserSVG.includes('<rect'));
    console.log('Contains <path>:', laserSVG.includes('<path'));
    
    // Count paths in laser SVG
    const pathMatches = laserSVG.match(/<path[^>]*\/?>/g);
    const pathCount = pathMatches ? pathMatches.length : 0;
    console.log('Path count in laser SVG:', pathCount);
    
    // Check if laser SVG is clean
    const isCleanForLaser = laserSVG.includes('<path') && 
                           !laserSVG.includes('<defs') && 
                           !laserSVG.includes('<pattern') && 
                           !laserSVG.includes('<image') && 
                           !laserSVG.includes('<rect');
    
    console.log('\n=== Laser Cutting Ready ===');
    console.log('Clean for laser cutting:', isCleanForLaser ? '✅ YES' : '❌ NO');
    
    if (isCleanForLaser) {
      console.log('✅ SUCCESS: Laser SVG is clean and ready for cutting!');
    } else {
      console.log('❌ FAILED: Laser SVG contains unwanted elements');
    }
    
    // Show preview of laser SVG
    console.log('\n=== Laser SVG Preview (first 300 chars) ===');
    console.log(laserSVG.substring(0, 300));
    
    return isCleanForLaser;
    
  } catch (error) {
    console.error('Error testing fractal generator:', error);
    return false;
  }
}

// Run the test
testFractalLaserSVG();
