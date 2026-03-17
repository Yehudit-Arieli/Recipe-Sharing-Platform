import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AddRecipeComponent } from './components/add-recipe/add-recipe.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AuthGuard } from './guards/auth.guard';
import { RecipeDetailsComponent } from './components/recipe-details/recipe-details.component';
import { FridgeComponent } from './components/fridge/fridge.component';
export const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'home' },
  { path: 'open-fridge', component: FridgeComponent, title: 'open-fridge' },
  { path: 'login', component: AuthComponent, title: 'login' },
  { path: 'register', component: AuthComponent },
  { path: 'recipes', component: RecipeListComponent, title: 'recipes' },
  { path: 'recipe-details/:id', component: RecipeDetailsComponent, title: 'recipe-details' },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], title: 'profile' },
  { path: 'add-recipe', component: AddRecipeComponent, canActivate: [AuthGuard], title: 'add-recipe' },
  { path: 'admin-panel', component: AdminPanelComponent, canActivate: [AuthGuard], title: 'admin-panel' },
  { path: '**', redirectTo: 'home' }
];
