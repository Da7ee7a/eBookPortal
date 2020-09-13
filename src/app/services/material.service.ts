import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  
  constructor(private http: HttpClient) { }

 public getUniversities(): any {

    return this.http.get(localStorage.getItem("serverURL") + "api/University/getUniversities")
  }

 public getFaculties(id: number) : any {
    return this.http.get(localStorage.getItem("serverURL") + "api/Faculty/getFaculties?universityId=" + id);
  }
 public addMaterial(materialObj: FormData) : any {
  let headers = new HttpHeaders();
  headers = headers.set('Content-Type', 'multipart/form-data');
    return this.http.post(localStorage.getItem("serverURL") + "api/Material/addMaterial",materialObj,{headers: this.getHeaderOptions()});
  }
  public getMaterials(pageNo: number,searchKey: string,isAscending: boolean,isArabic: boolean,sortColumn: string,dateFrom: any,dateTo: any) : any {
    dateFrom = new Date(dateFrom).toLocaleDateString();
    dateTo = new Date(dateTo).toLocaleDateString();
    return this.http.get(localStorage.getItem("serverURL") + "api/Material/getMaterialView?pageNo=" + pageNo + "&searchKey=" + searchKey + "&isAscending=" + isAscending + "&isArabic=" + isArabic + "&sortColumn=" +sortColumn + "&dateFrom=" + dateFrom + "&dateTo=" +dateTo);
  }

  public getStages() : any {
    return this.http.get(localStorage.getItem("serverURL") + "api/Stage/getAllStages");
  }

  public getAuthorBySpecificFaculty(facultyId: any) : any {
    return this.http.get(localStorage.getItem("serverURL") + "api/Author/getAuthorBySpecificFaculty?facultyId=" + facultyId);
  }
  public getSubjects() : any{
    return this.http.get(localStorage.getItem("serverURL") + "api/Material/getSubjects");

  }
  getHeaderOptions = (): HttpHeaders => {
    const headers = new HttpHeaders();
    headers.set('Accept', 'application/json');
    headers.delete('Content-Type');
    return headers;
  }
}
