
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { Recipe } from '../../models/recipe.model';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent, RouterModule],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css'
})

export class RecipeListComponent implements OnInit, OnDestroy {
  private recipeService = inject(RecipeService);
  private authService = inject(AuthService);
  private subs = new Subscription();

  // Data & State
  recipes: Recipe[] = [];
  loading: boolean = true;
  currentUserRole: string = 'guest';

  // Filters & Search
  currentIngredients: string = '';
  currentSortOrder: string = '';
  currentSearchTerm: string = '';

  // UI State - Sidebar & Filter Sections
  isSidebarOpen = false;
  isKosherSectionOpen = true;
  isDifficultySectionOpen = false;
  isSortSectionOpen = false;

  // Filter Options
  kosherOptions = ['בשרי', 'חלבי', 'פרווה'];
  selectedKosherTypes: string[] = [];
  difficultyOptions = ['קל', 'בינוני', 'קשה'];
  selectedDifficulties: string[] = [];

  /**
   * Initializes the component by setting user roles and 
   * subscribing to search and ingredient filter changes.
   */
  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.currentUserRole = user?.role || 'guest';
    this.subs.add(
      this.recipeService.ingredientsQuery$.subscribe(ingredients => {
        this.currentIngredients = ingredients;
        if (ingredients) {
          this.loadRecipes();
        }
      })
    );

    this.subs.add(
      this.recipeService.searchQuery$.subscribe(term => {
        this.currentSearchTerm = term;
        this.loadRecipes();
      })
    );

    if (!this.currentIngredients) {
      this.loadRecipes();
    }
  }

  /**
   * Resets the refrigerator filter and reloads all recipes.
   */
  clearFridgeFilter() {
    this.currentIngredients = '';
    this.recipeService.updateIngredients('');
    this.recipes = [];
    this.loadRecipes();
  }

  /**
   * Unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Fetches recipes from the server based on current filters, sorting, and search terms.
   */
  loadRecipes() {
    this.loading = true;

    const sortBy = this.currentSortOrder ? 'prep_time' : 'id';
    const order = this.currentSortOrder || 'asc';

    this.recipeService.getRecipes(
      this.selectedKosherTypes,
      this.selectedDifficulties,
      sortBy,
      order,
      this.currentSearchTerm,
      this.currentIngredients
    ).subscribe({
      next: (data: any) => {
        let results = data.recipes || data;

        if (!this.currentIngredients) {
          results = results.map((r: Recipe) => ({
            ...r,
            missing_ingredients: []
          }));
        }

        this.recipes = results;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  // UI Toggle Methods
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  toggleKosherSection() { this.isKosherSectionOpen = !this.isKosherSectionOpen; }
  toggleDifficultySection() { this.isDifficultySectionOpen = !this.isDifficultySectionOpen; }
  toggleSortSection() { this.isSortSectionOpen = !this.isSortSectionOpen; }

  /**
   * Toggles kosher type filter selection.
   */
  onKosherChange(type: string) {
    if (this.selectedKosherTypes.includes(type)) {
      this.selectedKosherTypes = this.selectedKosherTypes.filter(t => t !== type);
    } else {
      this.selectedKosherTypes.push(type);
    }
    this.loadRecipes();
  }

  /**
   * Toggles difficulty level filter selection.
   */
  onDifficultyChange(level: string) {
    if (this.selectedDifficulties.includes(level)) {
      this.selectedDifficulties = this.selectedDifficulties.filter(l => l !== level);
    } else {
      this.selectedDifficulties.push(level);
    }
    this.loadRecipes();
  }

  /**
   * Updates sort order. Toggles between sorting and default if same order is clicked.
   */
  onSortChange(order: string) {
    this.currentSortOrder = (this.currentSortOrder === order) ? '' : order;
    this.loadRecipes();
  }

  /**
   * Handles recipe deletion with a stylish confirmation dialog.
   * @param recipeId The ID of the recipe to delete.
   */
  handleDelete(recipeId: number) {
    Swal.fire({
      title: 'האם את בטובה?',
      text: "לא תוכל לשחזר את המתכון לאחר המחיקה!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'orange',
      confirmButtonText: 'כן, מחק!',
      cancelButtonText: 'ביטול',
      reverseButtons: true
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.recipeService.deleteRecipe(recipeId).subscribe({
          next: () => {
            this.recipes = this.recipes.filter(r => r.id !== recipeId);
            Swal.fire({
              title: 'נמחק!',
              text: 'המתכון הוסר בהצלחה.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire('שגיאה!', 'השרת ענה: ' + (err.error?.message || 'שגיאה לא ידועה'), 'error');
          }
        });
      }
    });
  }
}