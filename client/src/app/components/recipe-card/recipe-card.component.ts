
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css'
})
export class RecipeCardComponent {
  /** The recipe object to be displayed in the card */
  @Input() recipe!: Recipe;

  /** The role of the current user (used to show/hide admin actions) */
  @Input() userRole: string = 'guest';

  /** Event emitted when the delete button is clicked, passing the recipe ID */
  @Output() deleteEvent = new EventEmitter<number>();

  /** State for showing/hiding the list of missing ingredients */
  showMissing: boolean = false;

  /**
   * Getter that returns the full image URL.
   * Prepends the API base URL to the relative image path.
   */
  get imageUrl(): string {
    if (!this.recipe.original_image_path) return '';
    return 'http://localhost:5000/' + this.recipe.original_image_path;
  }

  /**
   * Handles the delete button click.
   * Prevents event bubbling to the card container and emits the recipe ID.
   */
  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.deleteEvent.emit(this.recipe.id);
  }
}
