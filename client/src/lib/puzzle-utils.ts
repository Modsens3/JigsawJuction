export interface PuzzleConfiguration {
  size: string;
  material: string;
  pieceCount: number;
  imageUrl?: string;
  templateId?: string;
  totalPrice: number;
}

export const puzzleSizes = [
  { value: "small", label: "Μικρό (20x30cm)", basePrice: 15 },
  { value: "medium", label: "Μεσαίο (30x40cm)", basePrice: 25 },
  { value: "large", label: "Μεγάλο (40x50cm)", basePrice: 35 },
  { value: "xlarge", label: "Πολύ Μεγάλο (50x70cm)", basePrice: 45 },
];

export const puzzleMaterials = [
  { value: "paper", label: "Χαρτί", multiplier: 1.0 },
  { value: "wood", label: "Ξύλο", multiplier: 1.5 },
  { value: "acrylic", label: "Ακρυλικό", multiplier: 2.0 },
];

export const puzzlePieceCounts = [
  { value: 100, label: "100 κομμάτια", multiplier: 1.0 },
  { value: 300, label: "300 κομμάτια", multiplier: 1.2 },
  { value: 500, label: "500 κομμάτια", multiplier: 1.4 },
  { value: 1000, label: "1000 κομμάτια", multiplier: 1.8 },
  { value: 1500, label: "1500 κομμάτια", multiplier: 2.2 },
];

export function calculatePrice(size: string, material: string, pieceCount: number): number {
  const sizeData = puzzleSizes.find(s => s.value === size);
  const materialData = puzzleMaterials.find(m => m.value === material);
  const pieceData = puzzlePieceCounts.find(p => p.value === pieceCount);
  
  if (!sizeData || !materialData || !pieceData) {
    return 25; // fallback price
  }
  
  return Math.round(sizeData.basePrice * materialData.multiplier * pieceData.multiplier);
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

export function getSizeLabel(value: string): string {
  return puzzleSizes.find(s => s.value === value)?.label || value;
}

export function getMaterialLabel(value: string): string {
  return puzzleMaterials.find(m => m.value === value)?.label || value;
}

export function getPieceCountLabel(value: number): string {
  return puzzlePieceCounts.find(p => p.value === value)?.label || `${value} κομμάτια`;
}