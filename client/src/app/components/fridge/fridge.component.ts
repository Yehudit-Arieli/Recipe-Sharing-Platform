
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fridge',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './fridge.component.html',
  styleUrls: ['./fridge.component.css']
})
export class FridgeComponent {
  /** String containing the ingredients typed by the user in the search box */
  ingredients: string = '';

  /**
   * Constructor for injecting the recipe service and router.
   * @param recipeService Service to manage recipe data and filters.
   * @param router Angular router for page navigation.
   */
  constructor(private recipeService: RecipeService, private router: Router) { }

  /**
   * Updates the recipe service with the current ingredient list
   * and navigates the user to the recipes page to view the results.
   */
  searchRecipes() {
    // Notify the service about the new ingredients to trigger filtering
    this.recipeService.updateIngredients(this.ingredients);

    // Redirect the user to the main recipes display
    this.router.navigate(['/recipes']);
  }
}