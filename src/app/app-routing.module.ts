import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorComponent } from './author/author/author.component';
import { AuthorviewComponent } from './author/authorlst/authorview/authorview.component';
import { DefineMaterialComponent } from './material/definematerial/define-material/define-material.component';
import { NotfoundComponent } from './errorpage/notfound/notfound.component';
import { MaterialViewComponent } from './materialview/material-view/material-view.component';

const routes: Routes = [
  {path: '404', component: NotfoundComponent},
  // {path: '**', redirectTo: '/404'},
  { path: 'define-author', component: AuthorComponent },
  { path: 'view-Authors', component: AuthorviewComponent },
  { path: 'define-material', component: DefineMaterialComponent },
  { path: 'view-materials', component: MaterialViewComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes,{onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
