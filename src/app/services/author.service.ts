import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthorModel } from '../model/author-model';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  
 
  constructor(private http: HttpClient) { }

 public getUniversities(): any {

    return this.http.get(localStorage.getItem("serverURL") + "api/University/getUniversities")
  }

 public getFaculties(id: number) : any {
    return this.http.get(localStorage.getItem("serverURL") + "api/Faculty/getFaculties?universityId=" + id);
  }
 public addAuthor(authorObj: FormData) : any {
  let headers = new HttpHeaders();
  headers = headers.set('Content-Type', 'multipart/form-data');
    return this.http.post(localStorage.getItem("serverURL") + "api/Author/addAuthor",authorObj,{headers: this.getHeaderOptions()});
  }
  public getAuthors(pageNo: number,searchKey: string,isAscending: boolean,isArabic: boolean,sortColumn: string) : any {
    return this.http.get(localStorage.getItem("serverURL") + "api/Author/getAuthors?pageNo=" + pageNo + "&searchKey=" + searchKey + "&isAscending=" + isAscending + "&isArabic=" + isArabic + "&sortColumn=" +sortColumn);
  }

  getHeaderOptions = (): HttpHeaders => {
    const headers = new HttpHeaders();
    headers.set('Accept', 'application/json');
    headers.delete('Content-Type');
    return headers;
  }
}
