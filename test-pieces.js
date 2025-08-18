// Test script to calculate pieces for different dimensions
const { CircleFractalJigsaw } = require('./client/src/lib/fractal-generator.ts');

const testDimensions = [
  { cols: 15, rows: 10, name: 'Μικρό (15×10)' },
  { cols: 20, rows: 15, name: 'Μεσαίο (20×15)' },
  { cols: 25, rows: 20, name: 'Μεγάλο (25×20)' },
  { cols: 30, rows: 25, name: 'Πολύ Μεγάλο (30×25)' }
];

console.log('Αναλύοντας κομμάτια παζλ για κάθε διάσταση:');
console.log('='.repeat(50));

testDimensions.forEach(dim => {
  const jig = new CircleFractalJigsaw(dim.cols, dim.rows, 1, 3);
  jig.setSeed(123); // Fixed seed for consistent results
  
  jig.generate();
  let fillIterations = 0;
  while (jig.fillholes(false) && fillIterations < 10) {
    fillIterations++;
  }
  jig.fillholes(true);
  
  const pieces = jig.getPieceCount();
  const gridCells = dim.cols * dim.rows;
  const ratio = (pieces / gridCells * 100).toFixed(1);
  
  console.log(`${dim.name}:`);
  console.log(`  Πλέγμα: ${dim.cols}×${dim.rows} = ${gridCells} κελιά`);
  console.log(`  Κομμάτια: ${pieces}`);
  console.log(`  Αναλογία: ${ratio}% των κελιών γίνονται κομμάτια`);
  console.log('');
});