/**
 * Represents a single ingredient within a recipe.
 */
export interface Ingredient {
  product_name: string;
  amount: number;
  unit: string;
}

/**
 * Represents the full structure of a Recipe object.
 */
export interface Recipe {
  id: number;
  title: string;
  description: string;
  instructions: string;
  ingredients: Ingredient[];
  /** Preparation time in minutes */
  prep_time: number;
  kosher_type: string;
  difficulty: string;
  original_image_path?: string;
  variation_paths?: string[];
  missing_ingredients?: string[];
  match_percent?: number;
}