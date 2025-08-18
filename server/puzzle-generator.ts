import { logger } from './logger';

export interface DesignData {
  imageUrl: string;
  pieces: number;
  complexity: 'easy' | 'medium' | 'hard';
  style: 'classic' | 'modern' | 'artistic';
  colors: string[];
  size: {
    width: number;
    height: number;
  };
}

export interface PuzzlePiece {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
  color: string;
}

// Generate design SVG for puzzle
export function generateDesignSVG(designData: DesignData): string {
  try {
    const { size, pieces, style, colors } = designData;
    const pieceWidth = size.width / Math.sqrt(pieces);
    const pieceHeight = size.height / Math.sqrt(pieces);
    
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="puzzlePattern" patternUnits="userSpaceOnUse" width="${pieceWidth}" height="${pieceHeight}">
      <rect width="${pieceWidth}" height="${pieceHeight}" fill="${colors[0] || '#4F46E5'}" opacity="0.1"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="${size.width}" height="${size.height}" fill="url(#puzzlePattern)"/>
  
  <!-- Puzzle pieces -->
`;

    // Generate puzzle pieces
    const piecesPerRow = Math.sqrt(pieces);
    const piecesPerCol = Math.sqrt(pieces);
    
    for (let row = 0; row < piecesPerRow; row++) {
      for (let col = 0; col < piecesPerCol; col++) {
        const x = col * pieceWidth;
        const y = row * pieceHeight;
        const pieceId = `piece_${row}_${col}`;
        const color = colors[Math.floor(Math.random() * colors.length)] || '#4F46E5';
        
        // Generate puzzle piece path with interlocking tabs
        const path = generatePuzzlePiecePath(x, y, pieceWidth, pieceHeight, row, col, piecesPerRow, piecesPerCol);
        
        svg += `  <path id="${pieceId}" d="${path}" fill="${color}" stroke="#333" stroke-width="1" opacity="0.8"/>
`;
      }
    }
    
    svg += `  
  <!-- Design overlay -->
  <rect width="${size.width}" height="${size.height}" fill="none" stroke="#333" stroke-width="2"/>
  
  <!-- Title -->
  <text x="${size.width / 2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#333">
    JigsawJunction Puzzle Design
  </text>
  
  <!-- Info -->
  <text x="10" y="${size.height - 10}" font-family="Arial, sans-serif" font-size="12" fill="#666">
    Pieces: ${pieces} | Style: ${style} | Size: ${size.width}x${size.height}
  </text>
</svg>`;

    return svg;
  } catch (error) {
    logger.error('Failed to generate design SVG', error);
    return generateDefaultSVG();
  }
}

// Generate laser SVG for cutting
export function generateLaserSVG(designData: DesignData): string {
  try {
    const { size, pieces, style } = designData;
    const pieceWidth = size.width / Math.sqrt(pieces);
    const pieceHeight = size.height / Math.sqrt(pieces);
    
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Laser cutting paths -->
  <g id="cutting-paths" stroke="#FF0000" stroke-width="0.1" fill="none">
`;

    // Generate cutting paths for puzzle pieces
    const piecesPerRow = Math.sqrt(pieces);
    const piecesPerCol = Math.sqrt(pieces);
    
    for (let row = 0; row < piecesPerRow; row++) {
      for (let col = 0; col < piecesPerCol; col++) {
        const x = col * pieceWidth;
        const y = row * pieceHeight;
        
        // Generate cutting path for each piece
        const cutPath = generateCuttingPath(x, y, pieceWidth, pieceHeight, row, col, piecesPerRow, piecesPerCol);
        
        svg += `    <path d="${cutPath}"/>
`;
      }
    }
    
    // Add border cutting path
    svg += `    <!-- Border cut -->
    <rect x="0" y="0" width="${size.width}" height="${size.height}" stroke="#FF0000" stroke-width="0.1" fill="none"/>
`;
    
    svg += `  </g>
  
  <!-- Cutting instructions -->
  <text x="10" y="20" font-family="Arial, sans-serif" font-size="12" fill="#FF0000">
    LASER CUTTING TEMPLATE
  </text>
  <text x="10" y="35" font-family="Arial, sans-serif" font-size="10" fill="#666">
    Power: 80% | Speed: 20% | Frequency: 1000Hz
  </text>
  <text x="10" y="50" font-family="Arial, sans-serif" font-size="10" fill="#666">
    Material: ${(designData as any).material || 'Wood'} | Thickness: 3mm
  </text>
</svg>`;

    return svg;
  } catch (error) {
    logger.error('Failed to generate laser SVG', error);
    return generateDefaultLaserSVG();
  }
}

// Generate puzzle piece path with interlocking tabs
function generatePuzzlePiecePath(x: number, y: number, width: number, height: number, row: number, col: number, maxRow: number, maxCol: number): string {
  const tabSize = Math.min(width, height) * 0.2;
  const tabRadius = tabSize * 0.5;
  
  let path = `M ${x} ${y}`;
  
  // Top edge
  if (row === 0) {
    path += ` L ${x + width} ${y}`;
  } else {
    path += ` L ${x + width * 0.3} ${y}`;
    path += ` Q ${x + width * 0.4} ${y - tabSize}, ${x + width * 0.5} ${y - tabSize}`;
    path += ` Q ${x + width * 0.6} ${y - tabSize}, ${x + width * 0.7} ${y}`;
    path += ` L ${x + width} ${y}`;
  }
  
  // Right edge
  if (col === maxCol - 1) {
    path += ` L ${x + width} ${y + height}`;
  } else {
    path += ` L ${x + width} ${y + height * 0.3}`;
    path += ` Q ${x + width + tabSize} ${y + height * 0.4}, ${x + width + tabSize} ${y + height * 0.5}`;
    path += ` Q ${x + width + tabSize} ${y + height * 0.6}, ${x + width} ${y + height * 0.7}`;
    path += ` L ${x + width} ${y + height}`;
  }
  
  // Bottom edge
  if (row === maxRow - 1) {
    path += ` L ${x} ${y + height}`;
  } else {
    path += ` L ${x + width * 0.7} ${y + height}`;
    path += ` Q ${x + width * 0.6} ${y + height + tabSize}, ${x + width * 0.5} ${y + height + tabSize}`;
    path += ` Q ${x + width * 0.4} ${y + height + tabSize}, ${x + width * 0.3} ${y + height}`;
    path += ` L ${x} ${y + height}`;
  }
  
  // Left edge
  if (col === 0) {
    path += ` Z`;
  } else {
    path += ` L ${x} ${y + height * 0.7}`;
    path += ` Q ${x - tabSize} ${y + height * 0.6}, ${x - tabSize} ${y + height * 0.5}`;
    path += ` Q ${x - tabSize} ${y + height * 0.4}, ${x} ${y + height * 0.3}`;
    path += ` L ${x} ${y}`;
    path += ` Z`;
  }
  
  return path;
}

// Generate cutting path for laser
function generateCuttingPath(x: number, y: number, width: number, height: number, row: number, col: number, maxRow: number, maxCol: number): string {
  const tabSize = Math.min(width, height) * 0.2;
  
  let path = `M ${x} ${y}`;
  
  // Top edge
  if (row === 0) {
    path += ` L ${x + width} ${y}`;
  } else {
    path += ` L ${x + width * 0.3} ${y}`;
    path += ` Q ${x + width * 0.4} ${y - tabSize}, ${x + width * 0.5} ${y - tabSize}`;
    path += ` Q ${x + width * 0.6} ${y - tabSize}, ${x + width * 0.7} ${y}`;
    path += ` L ${x + width} ${y}`;
  }
  
  // Right edge
  if (col === maxCol - 1) {
    path += ` L ${x + width} ${y + height}`;
  } else {
    path += ` L ${x + width} ${y + height * 0.3}`;
    path += ` Q ${x + width + tabSize} ${y + height * 0.4}, ${x + width + tabSize} ${y + height * 0.5}`;
    path += ` Q ${x + width + tabSize} ${y + height * 0.6}, ${x + width} ${y + height * 0.7}`;
    path += ` L ${x + width} ${y + height}`;
  }
  
  // Bottom edge
  if (row === maxRow - 1) {
    path += ` L ${x} ${y + height}`;
  } else {
    path += ` L ${x + width * 0.7} ${y + height}`;
    path += ` Q ${x + width * 0.6} ${y + height + tabSize}, ${x + width * 0.5} ${y + height + tabSize}`;
    path += ` Q ${x + width * 0.4} ${y + height + tabSize}, ${x + width * 0.3} ${y + height}`;
    path += ` L ${x} ${y + height}`;
  }
  
  // Left edge
  if (col === 0) {
    path += ` Z`;
  } else {
    path += ` L ${x} ${y + height * 0.7}`;
    path += ` Q ${x - tabSize} ${y + height * 0.6}, ${x - tabSize} ${y + height * 0.5}`;
    path += ` Q ${x - tabSize} ${y + height * 0.4}, ${x} ${y + height * 0.3}`;
    path += ` L ${x} ${y}`;
    path += ` Z`;
  }
  
  return path;
}

// Generate default SVG if error occurs
function generateDefaultSVG(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f0f0f0"/>
  <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#666">
    Default Puzzle Design
  </text>
</svg>`;
}

// Generate default laser SVG if error occurs
function generateDefaultLaserSVG(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="400" height="300" stroke="#FF0000" stroke-width="0.1" fill="none"/>
  <text x="10" y="20" font-family="Arial, sans-serif" font-size="12" fill="#FF0000">
    DEFAULT LASER TEMPLATE
  </text>
</svg>`;
}

// Clean SVG for laser cutting (remove unnecessary elements)
export function cleanSVGForLaser(svg: string): string {
  try {
    // Remove comments, metadata, and unnecessary attributes
    let cleaned = svg
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/<metadata>[\s\S]*?<\/metadata>/g, '') // Remove metadata
      .replace(/<defs>[\s\S]*?<\/defs>/g, '') // Remove defs
      .replace(/<style>[\s\S]*?<\/style>/g, '') // Remove styles
      .replace(/<text[\s\S]*?<\/text>/g, '') // Remove text elements
      .replace(/<rect[\s\S]*?fill="[^"]*"[^>]*>/g, '') // Remove filled rectangles
      .replace(/<pattern[\s\S]*?<\/pattern>/g, '') // Remove patterns
      .replace(/<g[\s\S]*?id="[^"]*"[^>]*>/g, '<g>') // Simplify groups
      .replace(/<g[\s\S]*?class="[^"]*"[^>]*>/g, '<g>') // Remove classes
      .replace(/<path[\s\S]*?fill="[^"]*"[^>]*>/g, (match) => {
        // Keep only stroke attributes for cutting paths
        return match.replace(/fill="[^"]*"/g, 'fill="none"');
      });
    
    return cleaned;
  } catch (error) {
    logger.error('Failed to clean SVG for laser', error);
    return svg;
  }
}
