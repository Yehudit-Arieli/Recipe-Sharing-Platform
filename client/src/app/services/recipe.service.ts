
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/recipes';
  private searchSubject = new BehaviorSubject<string>('');
  searchQuery$ = this.searchSubject.asObservable();
  private ingredientsSubject = new BehaviorSubject<string>('');
  ingredientsQuery$ = this.ingredientsSubject.asObservable();

  updateSearchTerm(term: string) {
    this.searchSubject.next(term);
  }

  updateIngredients(ingredients: string) {
    this.ingredientsSubject.next(ingredients);
  }

  /**
  * Returns Authorization headers using the stored auth token.
  */
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
  * Fetches recipes with support for filtering, sorting, and searching.
  */
  getRecipes(
    kosherTypes: string[] = [],
    difficulties: string[] = [],
    sortBy: string = 'id',
    order: string = 'asc',
    searchTerm: string = '',
    ingredients: string = ''
  ): Observable<Recipe[]> {
    let params = new HttpParams();
    if (kosherTypes.length > 0) params = params.set('kosher', kosherTypes.join(','));
    if (difficulties.length > 0) params = params.set('difficulty', difficulties.join(','));
    if (searchTerm) params = params.set('search', searchTerm);
    if (ingredients) params = params.set('ingredients', ingredients);
    params = params.set('sort_by', sortBy);
    params = params.set('order', order);
    return this.http.get<{ success: boolean, recipes: Recipe[] }>(this.apiUrl, { params }).pipe(
      map(response => response.recipes || [])
    );
  }

  /**
  * Fetches a single recipe by its ID.
  */
  getRecipeById(id: number | string): Observable<Recipe> {
    return this.http.get<{ success: boolean, recipe: Recipe }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.recipe)
    );
  }

  /**
  * Adds a new recipe.
  * Uses FormData to support multipart requests (image uploads).
  */
  addRecipe(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { headers: this.getAuthHeaders() });
  }

  /**
  * Deletes a recipe by its ID.
  */
  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
