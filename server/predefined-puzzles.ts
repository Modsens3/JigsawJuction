import { InsertPredefinedPuzzle } from "@shared/schema";

export const PREDEFINED_PUZZLES: InsertPredefinedPuzzle[] = [
  // ΣΤΡΟΓΓΥΛΑ PUZZLE
  {
    name: "Στρογγυλό Εύκολο",
    description: "Στρογγυλό puzzle με 100 κομμάτια - ιδανικό για αρχάριους",
    type: "round",
    difficulty: "easy",
    pieces: 100,
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 25.00,
    featured: 1,
  },
  {
    name: "Στρογγυλό Μέτριο",
    description: "Στρογγυλό puzzle με 300 κομμάτια - για εμπειρογνώμονες",
    type: "round",
    difficulty: "medium",
    pieces: 300,
    imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 35.00,
    featured: 1,
  },
  {
    name: "Στρογγυλό Δύσκολο",
    description: "Στρογγυλό puzzle με 500 κομμάτια - πρόκληση για ειδικούς",
    type: "round",
    difficulty: "hard",
    pieces: 500,
    imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 45.00,
    featured: 0,
  },
  {
    name: "Στρογγυλό Πολύ Δύσκολο",
    description: "Στρογγυλό puzzle με 1000 κομμάτια - για μάστερες",
    type: "round",
    difficulty: "very_hard",
    pieces: 1000,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 65.00,
    featured: 0,
  },

  // ΟΚΤΑΓΩΝΑ PUZZLE
  {
    name: "Οκτάγωνο Εύκολο",
    description: "Οκτάγωνο puzzle με 150 κομμάτια - μοναδικό σχήμα",
    type: "octagon",
    difficulty: "easy",
    pieces: 150,
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 28.00,
    featured: 1,
  },
  {
    name: "Οκτάγωνο Μέτριο",
    description: "Οκτάγωνο puzzle με 400 κομμάτια - γεωμετρικό κάλλος",
    type: "octagon",
    difficulty: "medium",
    pieces: 400,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 38.00,
    featured: 0,
  },
  {
    name: "Οκτάγωνο Δύσκολο",
    description: "Οκτάγωνο puzzle με 600 κομμάτια - προηγμένο επίπεδο",
    type: "octagon",
    difficulty: "hard",
    pieces: 600,
    imageUrl: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 48.00,
    featured: 0,
  },
  {
    name: "Οκτάγωνο Πολύ Δύσκολο",
    description: "Οκτάγωνο puzzle με 1200 κομμάτια - υπέρτατη πρόκληση",
    type: "octagon",
    difficulty: "very_hard",
    pieces: 1200,
    imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 70.00,
    featured: 0,
  },

  // ΤΕΤΡΑΓΩΝΑ PUZZLE
  {
    name: "Τετράγωνο Εύκολο",
    description: "Τετράγωνο puzzle με 200 κομμάτια - κλασικό σχήμα",
    type: "square",
    difficulty: "easy",
    pieces: 200,
    imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 22.00,
    featured: 1,
  },
  {
    name: "Τετράγωνο Μέτριο",
    description: "Τετράγωνο puzzle με 500 κομμάτια - παραδοσιακό",
    type: "square",
    difficulty: "medium",
    pieces: 500,
    imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 32.00,
    featured: 0,
  },
  {
    name: "Τετράγωνο Δύσκολο",
    description: "Τετράγωνο puzzle με 750 κομμάτια - για εμπειρογνώμονες",
    type: "square",
    difficulty: "hard",
    pieces: 750,
    imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 42.00,
    featured: 0,
  },
  {
    name: "Τετράγωνο Πολύ Δύσκολο",
    description: "Τετράγωνο puzzle με 1500 κομμάτια - υπέρτατη δοκιμασία",
    type: "square",
    difficulty: "very_hard",
    pieces: 1500,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    basePrice: 60.00,
    featured: 0,
  },
];

export const PUZZLE_TYPES = {
  ROUND: "round",
  OCTAGON: "octagon", 
  SQUARE: "square",
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  VERY_HARD: "very_hard",
} as const;

export const DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.EASY]: "Εύκολο",
  [DIFFICULTY_LEVELS.MEDIUM]: "Μέτριο",
  [DIFFICULTY_LEVELS.HARD]: "Δύσκολο",
  [DIFFICULTY_LEVELS.VERY_HARD]: "Πολύ Δύσκολο",
} as const;

export const TYPE_LABELS = {
  [PUZZLE_TYPES.ROUND]: "Στρογγυλό",
  [PUZZLE_TYPES.OCTAGON]: "Οκτάγωνο",
  [PUZZLE_TYPES.SQUARE]: "Τετράγωνο",
} as const;
