import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ViewChild } from '@angular/core';
import { AuthorModel } from './../../model/author-model';
import { from, Subscription, Observable } from 'rxjs';
import { HttpRequest, HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { catchError, last, map, tap, startWith, min, max } from 'rxjs/operators';
import { AuthorService } from './../../services/author.service';
import { FormControl, Validators, FormGroup, FormGroupDirective } from '@angular/forms';
import { SaveResult } from './../../enums/save-result.enum';
import { FileUploadModel } from './../../model/file-upload-model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AuthorComponent implements OnInit {

  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'file';
  /** Target URL for file uploading. */
  @Input() target = 'https://file.io';
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();

  public files: Array<FileUploadModel> = [];
  public url: any
  public universityLst = [];
  public facultyLst = [];
  public isArabic: boolean = true;
  public filteredUniversity: Observable<any>;
  public filteredFaculty: Observable<any>;
  public image: any;
  public disableSave: boolean = false;

  public authorGroup = new FormGroup({
    universityControl: new FormControl(''),
    facultyControl: new FormControl({ value: '', disabled: true }),
    arabicNameControl: new FormControl('', [Validators.required,Validators.minLength(2), Validators.maxLength(70), this.noWhitespaceValidator]),
    englishNameControl: new FormControl('', [Validators.required,Validators.minLength(2), Validators.maxLength(70), this.noWhitespaceValidator])
  });

  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  constructor(private _http: HttpClient, public authorObj: AuthorModel, private service: AuthorService, private _snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    debugger;
    this.authorObj.facultyId = '';
    this.files = [];
    this.facultyLst = [];
    this.image = '';
    this.url = '';
    this.service.getUniversities().subscribe(data => {
      debugger;

      this.universityLst = data.results;

      this.filteredUniversity = this.authorGroup.get('universityControl').valueChanges
        .pipe(
          startWith(''),
          map(value => value ? value.name : value),
          map(name => this._filterUniversity(name))
        );
    });
    this.mapFacultyLst();
  }

  private _filterUniversity(name: string): any {
    debugger;
    if (!name) {
      this.universityLst.slice();
      this.authorGroup.get('facultyControl').reset();
      this.authorGroup.get('facultyControl').disable();
      this.facultyLst = [];
      this.mapFacultyLst();
    }
    const filterValue = name.toLowerCase();
    return this.universityLst.filter(option => (option.arabicName.toLowerCase().indexOf(filterValue) >= 0 || option.englishName.toLowerCase().indexOf(filterValue) >= 0));
  }

  private _filterFaculty(name: string): any {
    debugger;
    const filterValue = name.toLowerCase();
    return this.facultyLst.filter(option => (option.arabicName.toLowerCase().indexOf(filterValue) >= 0 || option.englishName.toLowerCase().indexOf(filterValue) >= 0));
  }

  onClick() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      debugger;
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({
          data: file, state: 'in',
          inProgress: false, progress: 0, canRetry: false, canCancel: true
        });
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }

  cancelFile(file: FileUploadModel) {
    file.sub.unsubscribe();
    this.removeFileFromArray(file);
  }

  retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  private uploadFile(file: FileUploadModel) {
    debugger;
    this.disableSave = true;
    const fd = new FormData();
    fd.append(this.param, file.data);

    const req = new HttpRequest('POST', this.target, fd, {
      reportProgress: true
    });

    file.inProgress = true;
    file.sub = this._http.request(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      tap(message => { }),
      last(),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        file.canRetry = true;
        return of(`${file.data.name} upload failed.`);
      })
    )
      .subscribe(
        (event: any) => {
          if (typeof (event) === 'object') {
            // this.removeFileFromArray(file);
            this.disableSave = false;
            this.complete.emit(event.body);
          }
        }
      );
  }

  private uploadFiles() {
    debugger;
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.value = '';

    this.files.forEach(file => {
      this.uploadFile(file);
    });
  }

  private removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
      this.url = "";
    }
  }

  public onSelectFile(event) {
    debugger;
    this.files = [];
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      this.image = event.target.files[0];
      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        this.url = event.target.result;
      }
    }
  }

  public changeUniversity(id): void {
    debugger;
    this.authorObj.facultyId = '';
    if (id) {
      this.service.getFaculties(id).subscribe(data => {
        debugger;
        this.facultyLst = data.results;
        this.mapFacultyLst();
        this.authorGroup.get('facultyControl').enable();
      });
    }
    else {
      this.authorGroup.get('facultyControl').disable();
      this.authorGroup.get('facultyControl').reset();
      this.facultyLst = [];
      this.mapFacultyLst();
    }
  }

  private mapFacultyLst(): void {
    this.filteredFaculty = this.authorGroup.get('facultyControl').valueChanges
      .pipe(
        startWith(''),
        map(value => value ? value.name : value),
        map(name => name ? this._filterFaculty(name) : this.facultyLst.slice())
      );
  }

  public changeFaculty(id): void {
    if (id) {
      this.authorObj.facultyId = id;
    }
    else {
      this.authorObj.facultyId = '';
    }

  }

  public save(): void {
    debugger;
    this.disableSave = true;
    const formData = new FormData();
    formData.append('arabicName', this.authorGroup.get('arabicNameControl').value);
    formData.append('englishName', this.authorGroup.get('englishNameControl').value);
    formData.append('facultyId', this.authorObj.facultyId);

    if (this.image) {
      formData.append('formImage', this.image);
    }
    this.service.addAuthor(formData).subscribe(data => {
      debugger;
      this.disableSave = false;
      switch (data) {
        case SaveResult.success:
          this._snackBar.open('Saved successfully', 'success', {
            duration: 6000,
            panelClass: ['blue-snackbar']
          });
          this.formGroupDirective.resetForm();
          this.ngOnInit();
          break;
        case SaveResult.fail:
          this._snackBar.open('An error occured please try again', 'fail', {
            duration: 6000,
            panelClass: ['red-snackbar']
          });
          break;

        default:
          this._snackBar.open('An error occured please try again', 'fail', {
            duration: 6000,
            panelClass: ['red-snackbar']
          });
          break;
      }
    });
  }

  public allowArabicCharactersOnly(event) {
    var arregex = /[\u0600-\u06FF ]/;
    if (!arregex.test(event.key)) {
      event.preventDefault();
    }
  }

  public allowEnglishCharactersOnly(event) {
    var arregex = /^[a-z | A-Z ]/ ;
    if (!arregex.test(event.key)) {
      event.preventDefault();
    }

  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}


