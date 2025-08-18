// Advanced image editing utilities for FractalCraft
export interface ImageFilter {
  name: string;
  displayName: string;
  apply: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, intensity?: number) => void;
}

export interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ColorAdjustments {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
  hue: number;        // -180 to 180
  gamma: number;      // 0.1 to 3.0
}

export class ImageEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImageData: ImageData | null = null;
  private currentImageData: ImageData | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    this.ctx = ctx;
  }

  // Load image from file or URL
  async loadImage(source: File | string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Set canvas dimensions to match image
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          
          // Clear canvas and draw image
          this.ctx.clearRect(0, 0, img.width, img.height);
          this.ctx.drawImage(img, 0, 0);
          
          // Store original and current image data
          this.originalImageData = this.ctx.getImageData(0, 0, img.width, img.height);
          this.currentImageData = this.ctx.getImageData(0, 0, img.width, img.height);
          
          console.log('Image loaded successfully:', { width: img.width, height: img.height });
          resolve();
        } catch (error) {
          console.error('Error processing loaded image:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        reject(new Error('Failed to load image'));
      };
      
      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result) {
            img.src = result as string;
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(source);
      } else {
        // For URL sources, set crossOrigin if needed
        if (source.startsWith('http') && !source.startsWith(window.location.origin)) {
          img.crossOrigin = 'anonymous';
        }
        img.src = source;
      }
    });
  }

  // Reset to original image
  resetToOriginal(): void {
    if (this.originalImageData) {
      this.ctx.putImageData(this.originalImageData, 0, 0);
      this.currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Apply color adjustments
  applyColorAdjustments(adjustments: Partial<ColorAdjustments>): void {
    if (!this.currentImageData) return;

    const data = this.currentImageData.data;
    const {
      brightness = 0,
      contrast = 0,
      saturation = 0,
      hue = 0,
      gamma = 1
    } = adjustments;

    // Convert adjustments to working values
    const brightnessValue = brightness * 2.55; // Convert to 0-255 range
    const contrastValue = (contrast + 100) / 100; // Convert to multiplier
    const saturationValue = (saturation + 100) / 100;
    const hueValue = hue * Math.PI / 180; // Convert to radians

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply gamma correction
      r = Math.pow(r / 255, 1 / gamma) * 255;
      g = Math.pow(g / 255, 1 / gamma) * 255;
      b = Math.pow(b / 255, 1 / gamma) * 255;

      // Apply brightness
      r += brightnessValue;
      g += brightnessValue;
      b += brightnessValue;

      // Apply contrast
      r = (r - 128) * contrastValue + 128;
      g = (g - 128) * contrastValue + 128;
      b = (b - 128) * contrastValue + 128;

      // Convert RGB to HSV for saturation and hue adjustments
      const hsv = this.rgbToHsv(r, g, b);
      
      // Apply saturation
      hsv.s *= saturationValue;
      
      // Apply hue shift
      hsv.h += hueValue;
      if (hsv.h < 0) hsv.h += 2 * Math.PI;
      if (hsv.h > 2 * Math.PI) hsv.h -= 2 * Math.PI;

      // Convert back to RGB
      const rgb = this.hsvToRgb(hsv.h, hsv.s, hsv.v);

      // Clamp values
      data[i] = Math.max(0, Math.min(255, rgb.r));
      data[i + 1] = Math.max(0, Math.min(255, rgb.g));
      data[i + 2] = Math.max(0, Math.min(255, rgb.b));
    }

    this.ctx.putImageData(this.currentImageData, 0, 0);
  }

  // Apply blur filter
  applyBlur(radius: number): void {
    if (!this.currentImageData) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCtx.filter = `blur(${radius}px)`;
    tempCtx.drawImage(this.canvas, 0, 0);
    
    this.ctx.drawImage(tempCanvas, 0, 0);
    this.currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  // Apply sharpen filter
  applySharpen(intensity: number = 1): void {
    if (!this.currentImageData) return;

    const data = this.currentImageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const newData = new Uint8ClampedArray(data);

    // Sharpening kernel
    const kernel = [
      0, -intensity, 0,
      -intensity, 4 * intensity + 1, -intensity,
      0, -intensity, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIndex = (ky + 1) * 3 + (kx + 1);
              sum += data[pixelIndex] * kernel[kernelIndex];
            }
          }
          const pixelIndex = (y * width + x) * 4 + c;
          newData[pixelIndex] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    this.currentImageData = new ImageData(newData, width, height);
    this.ctx.putImageData(this.currentImageData, 0, 0);
  }

  // Apply edge detection
  applyEdgeDetection(): void {
    if (!this.currentImageData) return;

    const data = this.currentImageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const newData = new Uint8ClampedArray(data.length);

    // Sobel edge detection kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            
            gx += gray * sobelX[kernelIndex];
            gy += gray * sobelY[kernelIndex];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const pixelIndex = (y * width + x) * 4;
        
        newData[pixelIndex] = magnitude;     // R
        newData[pixelIndex + 1] = magnitude; // G
        newData[pixelIndex + 2] = magnitude; // B
        newData[pixelIndex + 3] = data[pixelIndex + 3]; // A
      }
    }

    this.currentImageData = new ImageData(newData, width, height);
    this.ctx.putImageData(this.currentImageData, 0, 0);
  }

  // Apply emboss effect
  applyEmboss(): void {
    if (!this.currentImageData) return;

    const data = this.currentImageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const newData = new Uint8ClampedArray(data);

    // Emboss kernel
    const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIndex = (ky + 1) * 3 + (kx + 1);
              sum += data[pixelIndex] * kernel[kernelIndex];
            }
          }
          const pixelIndex = (y * width + x) * 4 + c;
          newData[pixelIndex] = Math.max(0, Math.min(255, sum + 128));
        }
      }
    }

    this.currentImageData = new ImageData(newData, width, height);
    this.ctx.putImageData(this.currentImageData, 0, 0);
  }

  // Crop image
  cropImage(cropArea: CropArea): void {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;
    
    tempCtx.drawImage(
      this.canvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
    
    this.canvas.width = cropArea.width;
    this.canvas.height = cropArea.height;
    this.ctx.drawImage(tempCanvas, 0, 0);
    
    this.currentImageData = this.ctx.getImageData(0, 0, cropArea.width, cropArea.height);
  }

  // Apply transform
  applyTransform(transform: Partial<ImageTransform>): void {
    const {
      x = 0,
      y = 0,
      scale = 1,
      rotation = 0,
      flipX = false,
      flipY = false
    } = transform;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    tempCtx.drawImage(this.canvas, 0, 0);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    // Apply transformations
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(rotation * Math.PI / 180);
    this.ctx.scale(scale * (flipX ? -1 : 1), scale * (flipY ? -1 : 1));
    this.ctx.translate(-this.canvas.width / 2 + x, -this.canvas.height / 2 + y);

    this.ctx.drawImage(tempCanvas, 0, 0);
    this.ctx.restore();

    this.currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  // Convert to grayscale
  convertToGrayscale(): void {
    if (!this.currentImageData) return;

    const data = this.currentImageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
    }

    this.ctx.putImageData(this.currentImageData, 0, 0);
  }

  // Convert to sepia
  convertToSepia(): void {
    if (!this.currentImageData) return;

    const data = this.currentImageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);     // R
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); // G
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); // B
    }

    this.ctx.putImageData(this.currentImageData, 0, 0);
  }

  // Invert colors
  invertColors(): void {
    if (!this.currentImageData) return;

    const data = this.currentImageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];         // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
    }

    this.ctx.putImageData(this.currentImageData, 0, 0);
  }

  // Export image
  exportImage(format: 'png' | 'jpeg' | 'webp' = 'png', quality: number = 0.9): string {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  // Get image dimensions
  getDimensions(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  // Helper methods for color space conversion
  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    if (diff !== 0) {
      switch (max) {
        case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
      h /= 6;
    }

    return { h: h * 2 * Math.PI, s, v };
  }

  private hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    h = h / (2 * Math.PI); // Convert to 0-1 range
    
    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (h >= 1/6 && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (h >= 2/6 && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (h >= 3/6 && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (h >= 4/6 && h < 5/6) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return {
      r: (r + m) * 255,
      g: (g + m) * 255,
      b: (b + m) * 255
    };
  }
}

// Available filters
export const imageFilters: ImageFilter[] = [
  {
    name: 'grayscale',
    displayName: 'Ασπρόμαυρο',
    apply: (canvas, ctx) => {
      const editor = new ImageEditor(canvas);
      editor.convertToGrayscale();
    }
  },
  {
    name: 'sepia',
    displayName: 'Σέπια',
    apply: (canvas, ctx) => {
      const editor = new ImageEditor(canvas);
      editor.convertToSepia();
    }
  },
  {
    name: 'invert',
    displayName: 'Αντιστροφή Χρωμάτων',
    apply: (canvas, ctx) => {
      const editor = new ImageEditor(canvas);
      editor.invertColors();
    }
  },
  {
    name: 'blur',
    displayName: 'Θόλωμα',
    apply: (canvas, ctx, intensity = 2) => {
      const editor = new ImageEditor(canvas);
      editor.applyBlur(intensity);
    }
  },
  {
    name: 'sharpen',
    displayName: 'Όξυνση',
    apply: (canvas, ctx, intensity = 0.5) => {
      const editor = new ImageEditor(canvas);
      editor.applySharpen(intensity);
    }
  },
  {
    name: 'edge',
    displayName: 'Ανίχνευση Άκρων',
    apply: (canvas, ctx) => {
      const editor = new ImageEditor(canvas);
      editor.applyEdgeDetection();
    }
  },
  {
    name: 'emboss',
    displayName: 'Ανάγλυφο',
    apply: (canvas, ctx) => {
      const editor = new ImageEditor(canvas);
      editor.applyEmboss();
    }
  }
];