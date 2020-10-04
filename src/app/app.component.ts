import { Component } from '@angular/core';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public languageLst: any = [{

    id: 1,
    name: 'Arabic'
  }, {
    id: 2,
    name: 'English'
  }];
  public languageId: number;

  public navEnum = {
 
        defineAuthor: 1,
        viewAuthors: 2,
        defineMaterial: 3,
        viewMaterial: 4
  };

  public navId: number; 

  constructor(private router: Router) {
    this.navId = this.navEnum.defineAuthor;
    // localStorage.setItem("serverURL","http://ebookteam-001-site1.itempurl.com/");
     localStorage.setItem("serverURL","http://localhost:2200/");
 
    if (!localStorage.getItem("isArabic")) {
      localStorage.setItem("isArabic", "true");   
      this.languageId = this.languageLst[0].id;
    }  
    else
    {
      this.languageId = localStorage.getItem("isArabic") == "true" ? this.languageLst[0].id : this.languageLst[this.languageLst.length - 1].id
    }
    this.router.navigate(['/define-author']);
  }

  public changeLanguage(id) {
    debugger;
    localStorage.removeItem("isArabic");
    localStorage.setItem("isArabic", id == 1 ? "true" : "false");
    location.reload();
  }

}
