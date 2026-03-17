
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.css'
})

export class RecipeDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  recipe: Recipe | null = null;
  currentImageIndex: number = 0;
  serverUrl = 'http://localhost:5000/';

  /**
   * Initializes the component by fetching the recipe ID from the route 
   * and loading its details from the service.
   */
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.recipeService.getRecipeById(id).subscribe({
        next: (data) => {
          this.recipe = data;
        },
        error: (err) => console.error('שגיאה בטעינת המתכון:', err)
      });
    }
  }

  /**
   * Combines the main recipe image and all variation paths into a single array.
   * Handles both JSON string and array formats for variation_paths.
   */
  get allImages(): string[] {
    if (!this.recipe) return [];
    const mainImage = this.recipe.original_image_path || '';
    let variations: string[] = [];

    if (this.recipe.variation_paths) {
      variations = typeof this.recipe.variation_paths === 'string'
        ? JSON.parse(this.recipe.variation_paths)
        : this.recipe.variation_paths;
    }
    return [mainImage, ...variations].filter(path => path !== '');
  }

  /**
   * Constructs the full URL for the currently selected image in the gallery.
   */
  get fullImageUrl(): string {
    const currentPath = this.allImages[this.currentImageIndex];
    if (!currentPath) return '';
    return currentPath.startsWith('uploads') ? this.serverUrl + currentPath : currentPath;
  }

   /**
    * Navigates to the next image in the gallery.
    */
    nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.allImages.length;
  }

  /**
   * Navigates to the previous image in the gallery.
   */
  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.allImages.length) % this.allImages.length;
  }

  /**
   * Navigates back to the previous page.
   */
  goBack() {
    window.history.back();
  }
}