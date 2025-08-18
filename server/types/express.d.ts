declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        isAdmin?: boolean;
        userId?: string;
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    token?: string;
    isAdmin?: boolean;
    user?: any;
  }
}

// Extend the DesignData interface to include material property
export interface DesignData {
  material?: string;
  size?: string;
  quantity?: number;
  designData?: any;
  [key: string]: any;
}

// Extend PuzzleConfiguration interface
export interface PuzzleConfiguration {
  material: string;
  size: string;
  quantity: number;
  totalPrice?: number;
  designData?: any;
  svgOutput?: string;
  svgData?: string;
  svgPreview?: string;
  svgLaser?: string;
}
