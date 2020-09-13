import { Component, OnInit, ViewChild, EventEmitter, Output, OnChanges, Input } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MaterialService } from 'src/app/services/material.service';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-material-view',
  templateUrl: './material-view.component.html',
  styleUrls: ['./material-view.component.css']
})
export class MaterialViewComponent implements OnInit {


  @Output() dateChange: EventEmitter<MatDatepickerInputEvent<any>>
  public dataSource = [];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() someInput: string;
 

  public searchKey: string = "";
  public isAscending: boolean = true;
  public sortColumn: string = "name";
  public isArabic: boolean = true;
  public pageNo: number = 1;
  public totalPages: number = 0;
  public pageSize: number = 0;
  public pageIndex: number = 0;
  public displayedColumns = ['name', 'universityName', 'facultyName','subjectName','stageName','noOfViews'];
  public dateFromControl = new FormControl(new Date());
  public dateToControl = new FormControl(new Date());
  constructor(private service: MaterialService) { }

  ngOnInit(): void {
    this.isArabic = localStorage.getItem("isArabic") == "true";
    this.getMaterials(1, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  }
  

  ngAfterViewInit(): void {
    this.paginator.pageIndex = 0;
  }

  public customSort(sortObj): void {
    this.isAscending = sortObj.direction == "asc";
    this.sortColumn = sortObj.active;
    this.getMaterials(this.pageNo, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  }

  private getMaterials(pageNo: number, searchKey: string, isAscending: boolean, isArabic: boolean, sortColumn: string): void {
    debugger;
    this.dataSource = [];
    this.service.getMaterials(pageNo, searchKey, isAscending, isArabic, sortColumn,this.dateFromControl.value,this.dateToControl.value).subscribe(data => {
      debugger;
      this.dataSource = data.materials;
      this.pageSize = data.pageSize;
      this.totalPages = data.totalPages;
    });
  }


  public doFilter = (value: string) => {
    this.searchKey = value.trim().toLocaleLowerCase();
    this.getMaterials(this.pageNo, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  }

  public pageChanged(pageObj): void {
    debugger;
    this.pageIndex = pageObj.pageIndex;
    this.pageNo = pageObj.pageIndex + 1;
    this.getMaterials(this.pageNo, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  }

  public changeDate(){
    debugger;
    if (!this.dateFromControl.value) {
      this.dateFromControl.setValue(new Date());
    }
    if (!this.dateToControl.value) {
      this.dateToControl.setValue(new Date());
    }
    this.getMaterials(this.pageNo, this.searchKey, this.isAscending, this.isArabic, this.sortColumn);
  } 

}
