import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AuthorService } from 'src/app/services/author.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'authorview',
  templateUrl: './authorview.component.html',
  styleUrls: ['./authorview.component.css']
})
export class AuthorviewComponent implements OnInit, AfterViewInit {

  public dataSource = [];
  @ViewChild(MatSort) sort: MatSort;
  // @ViewChild('sortAuthor') sortAuthor: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public searchKey: string = "";
  public isAscending: boolean = true;
  public sortColumn: string = "englishName"
  public isArabic: boolean = true;
  public pageNo: number = 1;
  public totalPages: number = 0;
  public pageSize: number = 0;
  public pageIndex: number = 0;
  public displayedColumns = ['englishName', 'arabicName', 'universityName', 'facultyName'];
  constructor(private service: AuthorService) { }

  ngOnInit(): void {
    this.isArabic = localStorage.getItem("isArabic") == "true";
    this.getAuthors(1, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  }

  ngAfterViewInit(): void {
    this.paginator.pageIndex = 0;
    //this.sortAuthor.sort = this.sort;
  }

  public customSort(sortObj): void {
    this.isAscending = sortObj.direction == "asc";
    this.sortColumn = sortObj.active;
    this.getAuthors(this.pageNo, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  }

  private getAuthors(pageNo: number, searchKey: string, isAscending: boolean, isArabic: boolean, sortColumn: string): void {

    this.service.getAuthors(pageNo, searchKey, isAscending, isArabic, sortColumn).subscribe(data => {
      debugger;
      this.dataSource = data.authors;
      this.pageSize = data.pageSize;
      this.totalPages = data.totalPages;
    });
  }


  public doFilter = (value: string) => {
    this.pageNo = 1;
    this.searchKey = value.trim().toLocaleLowerCase();
    this.getAuthors(this.pageNo, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  }

  public pageChanged(pageObj): void {
    debugger;
    this.pageIndex = pageObj.pageIndex;
    this.pageNo = pageObj.pageIndex + 1;
    this.getAuthors(this.pageNo, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  }

}
