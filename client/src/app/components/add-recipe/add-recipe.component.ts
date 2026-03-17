
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-recipe.component.html',
  styleUrl: './add-recipe.component.css'
})
export class AddRecipeComponent implements OnInit {
  /** Core utilities injected using the modern inject() pattern */
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private router = inject(Router);

  /** Main form group for basic recipe details */
  recipeForm: FormGroup;
  /** Stores the selected image file and its preview URL */
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  /** Constants for LocalStorage keys to manage drafts */
  private readonly STORAGE_KEY = 'draft_recipe';
  private readonly INGREDIENTS_KEY = 'draft_ingredients';

  /** Dynamic list of ingredients initialized with an empty row */
  ingredientsList: any[] = [{ product_name: '', amount: null, unit: '' }];

  constructor() {
    // Defining form structure with essential validations
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      instructions: ['', Validators.required],
      prep_time: ['', [Validators.required, Validators.min(1)]],
      difficulty: ['', Validators.required],
      kosher_type: ['', Validators.required]
    });
  }

  /**
   * On init, restores drafts from LocalStorage and sets up auto-save logic.
   */
  ngOnInit() {
    // Restore general form fields from draft
    const savedDraft = localStorage.getItem(this.STORAGE_KEY);
    if (savedDraft) {
      this.recipeForm.patchValue(JSON.parse(savedDraft));
    }
    // Restore ingredients list from draft
    const savedIngredients = localStorage.getItem(this.INGREDIENTS_KEY);
    if (savedIngredients) {
      this.ingredientsList = JSON.parse(savedIngredients);
    }
    // Auto-save mechanism: saves to LocalStorage after 500ms of inactivity
    this.recipeForm.valueChanges.pipe(debounceTime(500)).subscribe(val => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(val));
    });
  }

  /** Saves current ingredients list to LocalStorage draft */
  saveIngredientsToDraft() {
    localStorage.setItem(this.INGREDIENTS_KEY, JSON.stringify(this.ingredientsList));
  }

  /** Adds a new blank ingredient row and updates the draft */
  addIngredient() {
    this.ingredientsList.push({ product_name: '', amount: null, unit: '' });
    this.saveIngredientsToDraft();
  }

  /** Removes a specific ingredient row and updates the draft */
  removeIngredient(index: number) {
    if (this.ingredientsList.length > 1) {
      this.ingredientsList.splice(index, 1);
      this.saveIngredientsToDraft();
    }
  }

  /** Handles image selection and generates a Base64 preview */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  /** Getter to check if at least one ingredient is fully and validly filled */
  get isIngredientsValid(): boolean {
    return this.ingredientsList.some(i =>
      i.product_name && i.product_name.trim() !== '' &&
      i.amount !== null && i.amount > 0 &&
      i.unit && i.unit !== ''
    );
  }

  /**
   * Submits the complete recipe data including the image file as FormData.
   */
  onSubmit() {
    // Filter out incomplete ingredient rows
    const validIngredients = this.ingredientsList.filter(i =>
      i.product_name && i.product_name.trim() !== '' &&
      i.amount !== null && i.amount > 0 &&
      i.unit && i.unit !== ''
    );

    const formData = new FormData();
    // Append general fields
    Object.keys(this.recipeForm.value).forEach(key => {
      formData.append(key, this.recipeForm.value[key]);
    });

    formData.append('ingredients', JSON.stringify(validIngredients));
    formData.append('image', this.selectedFile!);

    this.recipeService.addRecipe(formData).subscribe({
      next: () => {
        Swal.fire({ title: 'הצלחה!', text: 'המתכון נוסף', icon: 'success', timer: 2000, showConfirmButton: false });
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.INGREDIENTS_KEY);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ title: 'שגיאה', text: 'חלה שגיאה בשמירה', icon: 'error' });
      }
    });
  }
}