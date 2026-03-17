
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, RecipeCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private recipeService = inject(RecipeService);
  private router = inject(Router);

  /** Array to hold the initial set of recipes for the home page */
  allRecipes: any[] = [];

  /** List of filenames for the main hero slider */
  heroImages = ['hero1.jpg', 'hero2.jpg', 'hero3.jpg', 'hero4.jpg', 'hero5.jpg'];

  /** Current active index for the hero section slider */
  currentIndex: number = 0;

  /** Current active index for the featured recipes carousel */
  featuredIndex: number = 0;

  /** Flag to toggle the "Our Story" full text visibility */
  showFullStory: boolean = false;

  /**
   * Initializes the component by fetching the first 7 recipes
   * to display in the "You might like" section.
   */
  ngOnInit() {
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => {
        this.allRecipes = recipes.slice(0, 7);
      },
      error: (err) => console.error('שגיאה בטעינת מתכונים:', err)
    });
  }

  /** Navigates to the next image in the hero slider */
  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.heroImages.length;
  }

  /** Navigates to the previous image in the hero slider */
  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.heroImages.length) % this.heroImages.length;
  }

  /** Moves the featured recipes carousel one step forward */
  nextFeatured() {
    if (this.featuredIndex >= this.allRecipes.length - 4) {
      this.featuredIndex = 0;
    } else {
      this.featuredIndex++;
    }
  }

  /** Moves the featured recipes carousel one step backward */
  prevFeatured() {
    if (this.featuredIndex <= 0) {
      this.featuredIndex = this.allRecipes.length - 4;
    } else {
      this.featuredIndex--;
    }
  }

  /** Navigates to the full recipes list page */
  goToRecipes() { this.router.navigate(['/recipes']); }

  /**
   * Navigates to the details page of a specific recipe.
   * @param id The unique ID of the recipe.
   */
  goToDetails(id: any) { this.router.navigate(['/recipe-details', id]); }

  /** Toggles the visibility of the full 'About Us' story */
  toggleStory() {
    this.showFullStory = !this.showFullStory; // הופך את המצב בכל לחיצה
  }
}