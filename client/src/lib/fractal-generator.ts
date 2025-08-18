// Exact port of the fractal puzzle generator from the HTML file

interface Tile {
  x: number;
  y: number;
  hasconnections?: boolean;
}

interface Cell {
  x: number;
  y: number;
}

class DiagonalConnection {
  p1: Tile;
  p2: Tile;
  p2_taken: boolean;
  slope: number;
  quad: number;
  cell: Cell;

  constructor(p1: Tile, p2: Tile, p2_taken: boolean) {
    this.p1 = p1;
    this.p2 = p2;
    this.p2_taken = p2_taken;
    this.slope = (p2.y - p1.y) / (p2.x - p1.x);
    
    const ccx = Math.min(p2.x, p1.x);
    const ccy = Math.min(p2.y, p1.y);
    this.cell = { x: ccx, y: ccy };
    
    if (this.slope > 0) {
      if (p2.y > p1.y) {
        this.quad = 3;
      } else {
        this.quad = 1;
      }
    } else {
      if (p2.y > p1.y) {
        this.quad = 2;
      } else {
        this.quad = 0;
      }
    }
  }

  eq(other: DiagonalConnection): boolean {
    return this.cell.x === other.cell.x && 
           this.cell.y === other.cell.y && 
           this.slope === other.slope && 
           this.p2_taken === other.p2_taken;
  }

  static FromPointAndQuad(p1: Tile, quadrant: number, p2_taken: boolean): DiagonalConnection {
    let p2: Tile;
    switch (quadrant) {
      case 0: p2 = { x: p1.x + 1, y: p1.y - 1 }; break;
      case 1: p2 = { x: p1.x - 1, y: p1.y - 1 }; break;
      case 2: p2 = { x: p1.x - 1, y: p1.y + 1 }; break;
      case 3: p2 = { x: p1.x + 1, y: p1.y + 1 }; break;
      default: p2 = { x: p1.x, y: p1.y }; break;
    }
    return new DiagonalConnection(p1, p2, p2_taken);
  }
}

class CellGrid {
  nrow: number;
  ncol: number;
  visited: boolean[];
  cellmap: boolean[];
  private _nunvisited: number;

  constructor(nrow: number, ncol: number) {
    this.nrow = nrow;
    this.ncol = ncol;
    this.visited = new Array(this.ncol * this.nrow).fill(false);
    this.cellmap = new Array((this.ncol - 1) * (this.nrow - 1)).fill(false);
    this._nunvisited = this.ncol * this.nrow;
  }

  randomemptytile(randomFunc: () => number): Tile {
    const emptytiles = this.visited.reduce((acc: number[], curr: boolean, index: number) => {
      if (!curr) {
        acc.push(index);
      }
      return acc;
    }, []);

    const index = emptytiles[Math.floor(randomFunc() * emptytiles.length)];
    const y = Math.floor(index / this.nrow);
    const x = index % this.nrow;
    return { x, y };
  }

  reset(): void {
    this.visited.fill(false);
    this.cellmap.fill(false);
    this._nunvisited = this.ncol * this.nrow;
  }

  istilevalid(v: Tile): boolean {
    return v.x >= 0 && v.x < this.nrow && v.y >= 0 && v.y < this.ncol;
  }

  istilevisited(v: Tile): boolean {
    return this.visited[v.y * this.nrow + v.x];
  }

  iscellempty(c: Cell): boolean {
    return !this.cellmap[c.y * this.nrow + c.x];
  }

  visittile(v: Tile): void {
    if (!this.visited[v.y * this.nrow + v.x]) {
      this.visited[v.y * this.nrow + v.x] = true;
      this._nunvisited--;
    }
  }

  occupycell(c: Cell): void {
    if (!this.cellmap[c.y * this.nrow + c.x]) {
      this.cellmap[c.y * this.nrow + c.x] = true;
    }
  }

  liberatecell(c: Cell): void {
    this.cellmap[c.y * this.nrow + c.x] = false;
  }

  get nunvisited(): number {
    return this._nunvisited;
  }
}

class Arc {
  private _cp: Tile;
  private _quad: number;
  private _rad: number;
  private _sign: number;
  private _sp: Tile;
  private _ep: Tile;

  constructor(gcp: Tile, rad: number, offs: number, quad: number, sign: number) {
    this._cp = { x: gcp.x * 2 * rad + rad + offs, y: gcp.y * 2 * rad + rad + offs };
    this._quad = quad;
    this._rad = rad;
    this._sign = sign;
    
    let pa: Tile, pb: Tile;
    switch (quad) {
      case 0:
        pa = { x: this._cp.x + rad, y: this._cp.y };
        pb = { x: this._cp.x, y: this._cp.y - rad };
        break;
      case 1:
        pa = { x: this._cp.x, y: this._cp.y - rad };
        pb = { x: this._cp.x - rad, y: this._cp.y };
        break;
      case 2:
        pa = { x: this._cp.x - rad, y: this._cp.y };
        pb = { x: this._cp.x, y: this._cp.y + rad };
        break;
      case 3:
        pa = { x: this._cp.x, y: this._cp.y + rad };
        pb = { x: this._cp.x + rad, y: this._cp.y };
        break;
      default:
        pa = { x: 0, y: 0 };
        pb = { x: 0, y: 0 };
    }
    
    if (this.sign === 0) {
      this._sp = pa;
      this._ep = pb;
    } else {
      this._sp = pb;
      this._ep = pa;
    }
  }

  svg(arcshape: number): string {
    const tan225 = 0.4142135623730950488016887242097;
    const hlen = this._rad * tan225;
    
    switch (arcshape) {
      case 0:
        return `A ${this._rad} ${this._rad} 0 0,${this.sign} ${this.ep.x} ${this.ep.y} `;
      case 1:
        return `L ${this.ep.x} ${this.ep.y} `;
      case 2:
        let quad = this._quad;
        let sp = this.sp;
        let ep = this.ep;
        if (this._sign === 1) {
          sp = this.ep;
          ep = this.sp;
        }
        let mp1: number[], mp2: number[];
        switch (quad) {
          case 0:
            mp1 = [sp.x, sp.y - hlen];
            mp2 = [ep.x + hlen, ep.y];
            break;
          case 1:
            mp1 = [sp.x - hlen, sp.y];
            mp2 = [ep.x, ep.y - hlen];
            break;
          case 2:
            mp1 = [sp.x, sp.y + hlen];
            mp2 = [ep.x - hlen, ep.y];
            break;
          case 3:
            mp1 = [sp.x + hlen, sp.y];
            mp2 = [ep.x, ep.y + hlen];
            break;
          default:
            mp1 = [0, 0];
            mp2 = [0, 0];
        }
        if (this._sign === 1) {
          return `L ${mp2[0]} ${mp2[1]} L ${mp1[0]} ${mp1[1]} L ${this.ep.x} ${this.ep.y} `;
        } else {
          return `L ${mp1[0]} ${mp1[1]} L ${mp2[0]} ${mp2[1]} L ${this.ep.x} ${this.ep.y} `;
        }
      default:
        return "";
    }
  }

  eq(a: Arc): boolean {
    return this.quad === a.quad && this.cp.x === a.cp.x && this.cp.y === a.cp.y;
  }

  get cp(): Tile { return this._cp; }
  get sign(): number { return this._sign; }
  get sp(): Tile { return this._sp; }
  get ep(): Tile { return this._ep; }
  get quad(): number { return this._quad; }
}

class CircleFractalJigsaw {
  ncols: number;
  nrows: number;
  grid: CellGrid;
  pieces: DiagonalConnection[][];
  maxpiecelen: number;
  minpiecelen: number;
  maskgrid: number[][];
  seed: number;

  constructor(ncols: number, nrows: number, minpiecelen: number, maxpiecelen: number) {
    this.ncols = ncols;
    this.nrows = nrows;
    this.grid = new CellGrid(ncols, nrows);
    this.pieces = [];
    this.maxpiecelen = maxpiecelen;
    this.minpiecelen = minpiecelen;
    this.maskgrid = Array(nrows).fill(null).map(() => Array(ncols).fill(0));
    this.seed = 0;
  }

  setSeed(seed: number): void {
    this.seed = seed;
  }

  // Seeded random number generator (same as in your HTML)
  private random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  private uniform(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  possibleconnections(mytiles: Tile[], allowpartials: boolean): DiagonalConnection[] {
    const pcs: DiagonalConnection[] = [];
    const neighbors = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    
    mytiles.forEach((v) => {
      if (v.hasconnections || allowpartials) {
        v.hasconnections = false;
        neighbors.forEach((n) => {
          const cpt: Tile = { x: v.x + n[0], y: v.y + n[1] };
          if (this.grid.istilevalid(cpt) && 
              !this.maskgrid[cpt.y][cpt.x] && 
              !mytiles.find(nv => nv.x === cpt.x && nv.y === cpt.y)) {
            
            const dc = new DiagonalConnection(v, cpt, !this.grid.istilevisited(cpt));
            if (this.grid.iscellempty(dc.cell)) {
              if (allowpartials || !this.grid.istilevisited(cpt)) {
                pcs.push(dc);
                v.hasconnections = true;
              }
            }
          }
        });
      }
    });
    return pcs;
  }

  createpiece(): void {
    const mytiles: Tile[] = [];
    const myconnections: DiagonalConnection[] = [];
    const targetPieceLen = Math.round(this.uniform(this.minpiecelen, this.maxpiecelen));
    
    const vi = this.grid.randomemptytile(() => this.random());
    vi.hasconnections = true;
    mytiles.push(vi);
    this.grid.visittile(vi);

    while (this.grid.nunvisited > 0 && mytiles.length < targetPieceLen) {
      const pcs = this.possibleconnections(mytiles, false);
      
      if (pcs.length === 0) {
        break;
      }

      const chosenConnection = pcs[Math.floor(this.uniform(0, pcs.length))];
      myconnections.push(chosenConnection);
      chosenConnection.p2.hasconnections = true;
      mytiles.push(chosenConnection.p2);
      this.grid.occupycell(chosenConnection.cell);
      this.grid.visittile(chosenConnection.p2);
    }

    if (mytiles.length >= this.minpiecelen) {
      this.pieces.push(myconnections);
    } else {
      myconnections.forEach((c) => {
        this.grid.liberatecell(c.cell);
      });
    }
  }

  fillholes(allowpartials: boolean): boolean {
    let growth = false;
    
    this.pieces.forEach((piece) => {
      const mytiles: Tile[] = [];
      
      // Rebuild tiles from connections
      piece.forEach((dc) => {
        if (!mytiles.find(t => t.x === dc.p1.x && t.y === dc.p1.y)) {
          mytiles.push({ ...dc.p1, hasconnections: true });
        }
        if (!mytiles.find(t => t.x === dc.p2.x && t.y === dc.p2.y)) {
          mytiles.push({ ...dc.p2, hasconnections: true });
        }
      });

      const pcs = this.possibleconnections(mytiles, allowpartials);
      
      if (pcs.length > 0) {
        const chosenConnection = pcs[Math.floor(this.uniform(0, pcs.length))];
        piece.push(chosenConnection);
        this.grid.occupycell(chosenConnection.cell);
        this.grid.visittile(chosenConnection.p2);
        growth = true;
      }
    });

    return growth;
  }

  static addarcs(con: DiagonalConnection, connections: DiagonalConnection[], arcs: Arc[], rad: number, frame: number, first: boolean): void {
    let newarc: Arc;
    
    switch (con.quad) {
      case 0:
        newarc = new Arc({ x: con.p1.x + 1, y: con.p1.y }, rad, frame, 1, 1);
        break;
      case 1:
        newarc = new Arc({ x: con.p1.x, y: con.p1.y - 1 }, rad, frame, 2, 1);
        break;
      case 2:
        newarc = new Arc({ x: con.p1.x - 1, y: con.p1.y }, rad, frame, 3, 1);
        break;
      case 3:
        newarc = new Arc({ x: con.p1.x, y: con.p1.y + 1 }, rad, frame, 0, 1);
        break;
      default:
        newarc = new Arc(con.p1, rad, frame, 0, 1);
    }
    arcs.push(newarc);
    
    if (con.p2_taken) {
      const p2quads = [(con.quad + 3) % 4, (con.quad + 4) % 4, (con.quad + 5) % 4];
      p2quads.forEach((q) => {
        const pct = DiagonalConnection.FromPointAndQuad(con.p2, q, true);
        const pcnt = DiagonalConnection.FromPointAndQuad(con.p2, q, false);
        if (connections.find(c => c.eq(pct))) {
          CircleFractalJigsaw.addarcs(pct, connections, arcs, rad, frame, false);
        } else if (connections.find(c => c.eq(pcnt))) {
          CircleFractalJigsaw.addarcs(pcnt, connections, arcs, rad, frame, false);
        } else {
          arcs.push(new Arc(con.p2, rad, frame, q, 0));
        }
      });
    } else {
      arcs.push(new Arc(con.p2, rad, frame, (con.quad + 2) % 4, 1));
    }

    switch (con.quad) {
      case 0:
        newarc = new Arc({ x: con.p1.x, y: con.p1.y - 1 }, rad, frame, 3, 1);
        break;
      case 1:
        newarc = new Arc({ x: con.p1.x - 1, y: con.p1.y }, rad, frame, 0, 1);
        break;
      case 2:
        newarc = new Arc({ x: con.p1.x, y: con.p1.y + 1 }, rad, frame, 1, 1);
        break;
      case 3:
        newarc = new Arc({ x: con.p1.x + 1, y: con.p1.y }, rad, frame, 2, 1);
        break;
      default:
        newarc = new Arc(con.p1, rad, frame, 0, 1);
    }
    arcs.push(newarc);

    if (first) {
      const p1quads = [(con.quad + 1) % 4, (con.quad + 2) % 4, (con.quad + 3) % 4];
      p1quads.forEach((q) => {
        const pct = DiagonalConnection.FromPointAndQuad(con.p1, q, true);
        const pcnt = DiagonalConnection.FromPointAndQuad(con.p1, q, false);
        if (connections.find(c => c.eq(pct))) {
          CircleFractalJigsaw.addarcs(pct, connections, arcs, rad, frame, false);
        } else if (connections.find(c => c.eq(pcnt))) {
          CircleFractalJigsaw.addarcs(pcnt, connections, arcs, rad, frame, false);
        } else {
          arcs.push(new Arc(con.p1, rad, frame, q, 0));
        }
      });
    }
  }

  multipaths(frame: number, crad: number, arcshape: number): string[] {
    const paths: string[] = [];
    this.pieces.forEach((p) => {
      const data: string[] = [];
      const arcs: Arc[] = [];
      if (p.length > 0) {
        CircleFractalJigsaw.addarcs(p[0], p, arcs, crad, frame, true);
        if (arcs.length > 0) {
          data.push(`M${arcs[0].sp.x},${arcs[0].sp.y} `);
          arcs.forEach((a) => {
            data.push(a.svg(arcshape));
          });
          data.push('Z');
          paths.push(data.join(''));
        }
      }
    });
    return paths;
  }

  exportSVG(frame: number, crad: number, arcshape: number): string {
    const width = this.ncols * 2 * crad + 2 * frame;
    const height = this.nrows * 2 * crad + 2 * frame;
    let data = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    this.pieces.forEach((p) => {
      const arcs: Arc[] = [];
      if (p.length > 0) {
        CircleFractalJigsaw.addarcs(p[0], p, arcs, crad, frame, true);
        if (arcs.length > 0) {
          data += `<path fill="none" stroke="black" stroke-width="0.5" d="M${arcs[0].sp.x},${arcs[0].sp.y} `;
          arcs.forEach((a) => {
            data += a.svg(arcshape);
          });
          data += 'Z"></path>';
        }
      }
    });
    
    data += "</svg>";
    return data;
  }

  exportSVGSinglePath(frame: number, crad: number, arcshape: number): string {
    const width = this.ncols * 2 * crad + 2 * frame;
    const height = this.nrows * 2 * crad + 2 * frame;
    let data = `<?xml version="1.0" encoding="utf-8" ?><svg baseProfile="full" height="${height}mm" version="1.1" viewBox="0 0 ${width} ${height}" width="${width}mm" xmlns="http://www.w3.org/2000/svg"><defs />`;
    
    // Create a single path for all pieces (like in the HTML version)
    let allarcs: Arc[] = [];
    let currentlocation = { x: -1, y: -1 };
    
    data += '<path fill="none" stroke="black" stroke-width="0.1" d="';
    
    this.pieces.forEach((p) => {
      const arcs: Arc[] = [];
      if (p.length > 0) {
        CircleFractalJigsaw.addarcs(p[0], p, arcs, crad, frame, true);
        arcs.forEach((a) => {
          // Check if this arc is already included
          const existingArc = allarcs.find(na => na.eq(a));
          if (!existingArc) {
            allarcs.push(a);
            if (!(a.sp.x === currentlocation.x && a.sp.y === currentlocation.y)) {
              data += `M${a.sp.x},${a.sp.y} `;
            }
            data += a.svg(arcshape);
            currentlocation = a.ep;
          }
        });
      }
    });
    
    data += '"></path>';
    data += "</svg>";
    return data;
  }

  generate(): void {
    while (this.grid.nunvisited) {
      this.createpiece();
    }
    this.regenerategrid();
  }

  npieces(): number {
    return this.pieces.length;
  }

  regenerategrid(): void {
    this.grid.reset();

    for (let i = 0; i < this.nrows; i++) {
      for (let j = 0; j < this.ncols; j++) {
        if (this.maskgrid[i][j]) {
          this.grid.occupycell({ x: j, y: i });
        }
      }
    }
    
    this.pieces.forEach((p) => {
      p.forEach((c) => {
        if (!this.grid.istilevisited(c.p1)) {
          this.grid.visittile(c.p1);
        }
        if (c.p2_taken) {
          if (!this.grid.istilevisited(c.p2)) {
            this.grid.visittile(c.p2);
          }
        }
        this.grid.occupycell(c.cell);
      });
    });
  }

  getPieceCount(): number {
    return this.pieces.length;
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.ncols, height: this.nrows };
  }
}

export { CircleFractalJigsaw };
export type { Tile, Cell, DiagonalConnection, Arc };