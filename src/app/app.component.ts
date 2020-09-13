import { Component } from '@angular/core';


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

  constructor() {

    localStorage.setItem("serverURL","http://ebookteam-001-site1.itempurl.com/");
    
    if (!localStorage.getItem("isArabic")) {
      localStorage.setItem("isArabic", "true");   
      this.languageId = this.languageLst[0].id;
    }  
    else
    {
      this.languageId = localStorage.getItem("isArabic") == "true" ? this.languageLst[0].id : this.languageLst[this.languageLst.length - 1].id
    }
  }

  public changeLanguage(id) {
    debugger;
    localStorage.removeItem("isArabic");
    localStorage.setItem("isArabic", id == 1 ? "true" : "false");
    location.reload();
  }

}
