import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { HttpClient, HttpEventType, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { FormControl, Validators, FormGroup, FormGroupDirective } from '@angular/forms';
import { MaterialService } from 'src/app/services/material.service';
import { FileUploadModel } from 'src/app/model/file-upload-model';
import { catchError, last, map, tap, startWith } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { SaveResult } from 'src/app/enums/save-result.enum';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'define-material',
  templateUrl: './define-material.component.html',
  styleUrls: ['./define-material.component.css']
})
export class DefineMaterialComponent implements OnInit {

  @Input() textFile = 'Upload File';
  @Input() textImage = 'Upload Cover Page';
  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'file';
  /** Target URL for file uploading. */
  @Input() target = 'https://file.io';
  /** File extension that accepted, same as 'accept' of <input type="file" />. 
      By the default, it's set to 'image/*'. */
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  public files: Array<FileUploadModel> = [];
  public images: Array<FileUploadModel> = [];
  public url: any;
  public subjectLst = [];
  public universityLst = [];
  public facultyLst = [];
  public stageLst = [];
  public authorLst = [];
  public isArabic: boolean = true;

  public materialGroup = new FormGroup({
    subjectControl: new FormControl('', [Validators.required]),
    universityControl: new FormControl('', [Validators.required]),
    facultyControl: new FormControl({ value: '', disabled: true }, [Validators.required]),
    stageControl: new FormControl('', [Validators.required]),
    authorControl: new FormControl({ value: '', disabled: true }, [Validators.required]),
    directionControl: new FormControl('', [Validators.required]),
    arabicNameControl: new FormControl('', [Validators.required]),
    englishNameControl: new FormControl('', [Validators.required])
  });


  public filteredSubject: Observable<any>;
  public filteredUniversity: Observable<any>;
  public filteredFaculty: Observable<any>;
  public filteredStage: Observable<any>;
  public filteredAuthor: Observable<any>;
  public image: any;
  public file: any;
  public directionLst = [{

    id: 1,
    arName: 'من الشمال الى اليمين',
    enName: 'Left To Right'

  },
  {
    id: 2,
    arName: 'من اليمين الى الشمال',
    enName: 'Right To Left'
  }
  ];

  private facultyId: any = '';
  private subjectId: any = '';
  private stageId: any = '';
  private authorId: any = '';
  public disableSave: boolean = false;

  constructor(private _http: HttpClient, private service: MaterialService, private _snackBar: MatSnackBar) {


  }

  ngOnInit(): void {
    debugger;
    this.files = [];
    this.images = [];
    this.universityLst = [];
    this.facultyLst = [];
    this.stageLst = [];
    this.subjectLst = [];
    this.authorLst = [];
    this.facultyId = '';
    this.stageId = '';
    this.subjectId = '';
    this.authorId = '';
    this.image = '';
    this.url = '';
    this.file = '';
    this.service.getUniversities().subscribe(data => {
      debugger;
      this.universityLst = data.results;

      this.filteredUniversity = this.materialGroup.get('universityControl').valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.name),
          map(name => this._filterUniversity(name))
        );
    });
    this.mapFacultyLst();

    this.service.getSubjects().subscribe(data => {
      debugger;
      this.subjectLst = data;

      this.filteredSubject = this.materialGroup.get('subjectControl').valueChanges
        .pipe(
          startWith(''),
          map(value => value ? value.name : value),
          map(name => this._filterSubject(name))
        );
    });

    this.service.getStages().subscribe(data => {
      debugger;
      this.stageLst = data;
      this.mapStageLst();
    });
  }

  private _filterUniversity(name: string): any {
    debugger;
    if (!name) {
      this.universityLst.slice();
      this.materialGroup.get('facultyControl').reset();
      this.materialGroup.get('facultyControl').disable();
      this.materialGroup.get('authorControl').disable();
      this.materialGroup.get('authorControl').reset();
      this.facultyLst = [];
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

  onImageClick() {
    const fileUpload = document.getElementById('imageUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      debugger;
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.images.push({
          data: file, state: 'in',
          inProgress: false, progress: 0, canRetry: false, canCancel: true
        });
      }
      this.uploadImages();
    };
    fileUpload.click();
  }

  private uploadImages() {
    debugger;
    const fileUpload = document.getElementById('imageUpload') as HTMLInputElement;
    fileUpload.value = '';

    this.images.forEach(file => {
      this.uploadImage(file);
    });
  }

  private uploadImage(image: FileUploadModel) {
    debugger;
    const fd = new FormData();
    fd.append(this.param, image.data);

    const req = new HttpRequest('POST', this.target, fd, {
      reportProgress: true
    });

    image.inProgress = true;
    image.sub = this._http.request(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            image.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      tap(message => { }),
      last(),
      catchError((error: HttpErrorResponse) => {
        image.inProgress = false;
        image.canRetry = true;
        return of(`${image.data.name} upload failed.`);
      })
    )
      .subscribe(
        (event: any) => {
          if (typeof (event) === 'object') {
            // this.removeFileFromArray(file);
            this.complete.emit(event.body);
          }
        }
      );
  }

  public cancelFile(file: FileUploadModel) {
    file.sub.unsubscribe();
    this.removeFileFromArray(file);
  }

  public cancelImage(image: FileUploadModel) {
    image.sub.unsubscribe();
    this.removeImageFromArray(image);
  }

  public retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  public retryImage(image: FileUploadModel) {
    this.uploadImage(image);
    image.canRetry = false;
  }

  private uploadFile(file: FileUploadModel) {
    debugger;
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
    }
  }

  private removeImageFromArray(image: FileUploadModel) {
    const index = this.images.indexOf(image);
    if (index > -1) {
      this.images.splice(index, 1);
      this.url = "";
    }
  }

  public onSelectFile(event) {
    debugger;
    this.files = [];

    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      this.file = event.target.files[0];
      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        // this.url = event.target.result;
      }
    }
  }

  public onSelectImage(event) {
    debugger;
    this.images = [];

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
    this.materialGroup.get('facultyControl').reset();
    this.materialGroup.get('facultyControl').disable();
    this.materialGroup.get('authorControl').disable();
    this.materialGroup.get('authorControl').reset();
    this.facultyLst = [];
    this.stageLst = [];
    this.authorLst = [];
    this.materialGroup.get('facultyControl').setValue('');
    this.materialGroup.get('authorControl').setValue('');
    this.mapFacultyLst();
    this.mapStageLst();
    this.mapAuthorLst();
    if (id) {
      this.service.getFaculties(id).subscribe(data => {
        debugger;
        this.facultyLst = data.results;
        this.mapFacultyLst();
        this.materialGroup.get('facultyControl').enable();
      });
    }
  }

  private mapFacultyLst(): void {
    this.filteredFaculty = this.materialGroup.get('facultyControl').valueChanges
      .pipe(
        startWith(''),
        map(value => value ? value.name : value),
        map(name => name ? this._filterFaculty(name) : this.facultyLst.slice())
      );
  }

  public changeFaculty(id): void {
    this.materialGroup.get('authorControl').disable();
    this.materialGroup.get('authorControl').reset();
    this.stageLst = [];
    this.authorLst = [];
    this.materialGroup.get('authorControl').setValue('');
    this.mapStageLst();
    this.mapAuthorLst();

    if (id) {
      this.facultyId = id;
      this.service.getAuthorBySpecificFaculty(id).subscribe(data => {
        debugger;
        this.authorLst = data;
        this.mapAuthorLst();
        this.materialGroup.get('authorControl').enable();
      });
    }
    else {
      this.facultyId = '';
    }
  }

  private mapAuthorLst(): void {
    this.filteredAuthor = this.materialGroup.get('authorControl').valueChanges
      .pipe(
        startWith(''),
        map(value => value ? value.name : value),
        map(name => name ? this._filterAuthor(name) : this.authorLst.slice())
      );
  }

  private _filterAuthor(name: string): any {
    debugger;
    const filterValue = name.toLowerCase();
    return this.authorLst.filter(option => (option.arabicName.toLowerCase().indexOf(filterValue) >= 0 || option.englishName.toLowerCase().indexOf(filterValue) >= 0));
  }

  private mapStageLst(): void {
    this.filteredStage = this.materialGroup.get('stageControl').valueChanges
      .pipe(
        startWith(''),
        map(value => value ? value.name : value),
        map(name => name ? this._filterStage(name) : this.stageLst.slice())
      );
  }

  private _filterStage(name: string): any {
    debugger;
    const filterValue = name.toLowerCase();
    return this.stageLst.filter(option => (option.arabicName.toLowerCase().indexOf(filterValue) >= 0 || option.englishName.toLowerCase().indexOf(filterValue) >= 0));
  }

  private _filterSubject(name: string): any {
    debugger;
    const filterValue = name.toLowerCase();
    return this.subjectLst.filter(option => (option.arabicName.toLowerCase().indexOf(filterValue) >= 0 || option.englishName.toLowerCase().indexOf(filterValue) >= 0));
  }

  public changeSubject(id): void {
    if (id) {
      this.subjectId = id;
    }
    else {
      this.subjectId = '';
    }
  }

  public changeStage(id): void {
    if (id) {
      this.stageId = id;
    }
    else {
      this.stageId = '';
    }
  }

  public changeAuthor(id): void {

    if (id) {
      this.authorId = id;
    }
    else {
      this.authorId = '';
    }
  }

  public save(): void {
    this.disableSave = true;
    const formData = new FormData();
    formData.append('arabicName', this.materialGroup.get('arabicNameControl').value);
    formData.append('englishName', this.materialGroup.get('englishNameControl').value);
    formData.append('facultyId', this.facultyId);
    formData.append('subjectId', this.subjectId);
    formData.append('authorId', this.authorId);
    formData.append('stageId', this.stageId);
    formData.append('textDirectionId', this.materialGroup.get('directionControl').value);

    if (this.file) {
      formData.append('formFile', this.file);
    }
    if (this.image) {
      formData.append('formImage', this.image);
    }

    this.service.addMaterial(formData).subscribe(data => {
      debugger;
      this.disableSave = false;
      switch (data) {
        case SaveResult.success:
          this.materialGroup.reset();
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
    var arregex = /^[a-z ]/;
    if (!arregex.test(event.key)) {
      event.preventDefault();
    }

  }

}
