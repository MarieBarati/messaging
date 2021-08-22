import { Component, OnInit, Pipe, PipeTransform, ViewChild, ElementRef, EventEmitter, Output, Input } from '@angular/core';
import { AppConfig } from 'src/app/shared/app-config';
import { MessageConstants } from 'src/app/shared/constants';
import { ToastrService } from 'ngx-toastr';
import { MessageSubjectGetModel, MessageSendModel } from 'src/app/core/models/messaging/messaging.model';
import { FormGroup } from '@angular/forms';
import { Subject, concat } from 'rxjs';
import { UsersGetModel, DepartmentsGetModel, RoleGetModel, MessagingUserGroupModel, UsersearchParameterModel, GetUserDepartmentsAndRecipientMsgModel, GetPostTypeModel } from 'src/app/core/models/user/user.model';
import { PagingResultModel } from 'src/app/core/models/shared/paging.model';
import { OrderBy } from 'src/app/core/models/basis/basis.model';
import { UserService } from 'src/app/core/services/user/user.service';
import { PagingService } from 'src/app/core/client-services/paging.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StorageKeys } from '../../../shared/storage-keys';


@Component({
  selector: 'app-select-user',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.css']
})
export class SelectUserComponent implements OnInit {
postName: Subject<string> = new Subject<string>();
  departmentName: Subject<string> = new Subject<string>();
  userSearchResult: UsersGetModel[] = [];
  recivergroup: MessagingUserGroupModel[] = [];
  limit: number = 65;
  user: PagingResultModel<UsersGetModel> = <any>{};
  sortArray: Array<any> = <any>[
    { item: 'userId', orderBy: OrderBy.ascending },
  ]
  ascending: boolean = true;
  @Output() selecteduser = new EventEmitter(); 
  @Output() users = new EventEmitter(); 
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('name') name: ElementRef;
  @ViewChild('lastName') lastName: ElementRef;
  userSearchForm: FormGroup;
  count: number = 8;
  constPageSize: number = 8;
  organizationCharts: DepartmentsGetModel[] = [];
  posts: RoleGetModel[] = [];
  selectedAllUser: boolean = false;
  searchBtnDisable: boolean = true;
  showBtn: boolean = false;
  searching: boolean = false;
  selectedPostId: number;
  selectedorganizationChartId: number;
  hiddenGrid: boolean = false;
  subjects: MessageSubjectGetModel[] = [];
  uploadFiles: any[] = [];
  isApplicant: boolean;
  constructor(
    private usersService: UserService,
    private pagingService: PagingService,
    private toastr: ToastrService
  )
  {

    let claim = JSON.parse(localStorage.getItem(StorageKeys.claims));
    this.isApplicant = JSON.parse(claim.IsApplicant);
  }

  ngOnInit() {
    this.GetPosts(0, " ");
    this.GetDepartments(" ")
  }



  GetPosts(organizationChartId: number, value: any): any {
    if (organizationChartId != null) {
      let model = new GetPostTypeModel();
      model.organizationChartId = organizationChartId;
      model.name = value;
      model.isApplicant = this.isApplicant;
      this.usersService.GetPostByOrganizationChartId(model).subscribe(res => {
        this.posts = res;

      });
    }
  }

  GetDepartments(value: any): any {
    let model = new GetUserDepartmentsAndRecipientMsgModel();
    model.name = value;
    model.isApplicant = this.isApplicant;
    this.usersService.GetDepartmentsAndRecipientMsg(model).subscribe(res => {
      this.organizationCharts = res;
    });
  }

  SearchePostName(value: any) {
    if (this.postName.observers.length === 0) {
      this.postName.pipe(debounceTime(AppConfig.searchDelayLongTime), distinctUntilChanged())
        .subscribe(c => {
          this.GetPosts(this.selectedorganizationChartId || 0,value);
        });
    }
    this.postName.next(value);
  }
  SearcheDepartmentName(value: any) {
    if (this.departmentName.observers.length === 0) {
      this.departmentName.pipe(debounceTime(AppConfig.searchDelayLongTime), distinctUntilChanged())
        .subscribe(c => {
          this.GetDepartments(value);
        });
    }
    this.departmentName.next(value);
  }
  IsSearchBtnDisable(value: string) {
    console.log('value', value)
    if (value == 'organizationChart') {
      if (this.selectedorganizationChartId != null) {
        this.searchBtnDisable = false;
        this.GetPosts(this.selectedorganizationChartId,' ');
      }
      if (this.selectedorganizationChartId == null || this.selectedorganizationChartId == 0) {
        this.searchBtnDisable = false;
        this.GetPosts(0, ' ');
      }
    } else if (value == 'post') {
      if (this.selectedPostId != null && this.selectedPostId != 0) {
        this.searchBtnDisable = false;
      }
    }
  }
 
  GetUsers(page: number = 1) {

    var userSearchParameter = new UsersearchParameterModel();
    userSearchParameter.lastName = this.lastName.nativeElement.value;
    userSearchParameter.name = this.name.nativeElement.value;
    userSearchParameter.OrganizationChartId = this.selectedorganizationChartId || 0;
    userSearchParameter.postTypeId = this.selectedPostId || 0;
    userSearchParameter.userName = '';
    userSearchParameter.nationalCode = '';
    userSearchParameter.hasOnlyActivePost = true;
    userSearchParameter.postStatus = 0;
    userSearchParameter.userType = 0;
    userSearchParameter.searchInMessaging = true;
    userSearchParameter.IsApplicant = this.isApplicant;
    if (userSearchParameter.lastName == '' &&
      userSearchParameter.name == '' &&
      userSearchParameter.postTypeId == 0 &&
      userSearchParameter.OrganizationChartId == 0) {
      this.toastr.warning(MessageConstants.FormIsEmptyForSearch);
    }
    else {
      this.searching = true;
      this.usersService.GetUsers(userSearchParameter).subscribe(
        res => {
        this.searching = false;
        this.userSearchResult = res.results;
        this.userSearchResult.forEach(user => {
          user.departmentName == null ? user.departmentName = '' : user.departmentName;
          user.postName == null ? user.postName = '' : user.postName;
          user.roleName == null ? user.roleName = '' : user.roleName;

        });
        this.Paging(1);
      },
        error => {
          this.searching = false;
        this.userSearchResult = [];
      }
    ) }
    
  }


  PagingCounter(i: number) {

    return new Array(i);
  }
  Sort(sortBy: any) {
    var order = this.sortArray.find(c => c.item == sortBy.item);
    order.orderBy == OrderBy.ascending ? order.orderBy = OrderBy.descending : order.orderBy = OrderBy.ascending;
    this.user = this.pagingService.Sort(this.count, sortBy.item, order.orderBy, this.userSearchResult);
  }

  Paging(page = 1) {
    console.log(page, this.count, this.userSearchResult);
    this.user = this.pagingService.Paging(page, this.count, this.userSearchResult);
  }
  Close() {
    this.users.emit(this.userSearchResult.filter(u => u.selected == true));
    this.selecteduser.emit(false); 
  }
  SelectAll(selectAll) {
    if (selectAll) {
      this.userSearchResult.forEach(u => u.selected = true);
    } else {
      this.userSearchResult.forEach(u => u.selected = false);
    }

  }
  SelectUser(userId: number, select: boolean) {
    this.IsShowBtn();
    if (select==true) {
      this.userSearchResult.find(u => u.userId == userId).selected = true;
    } else {
      this.userSearchResult.find(u => u.userId == userId).selected = false;
    }
  
  }
  IsShowBtn() {
    this.userSearchResult.find(u => u.selected == true) ? this.showBtn = true : this.showBtn = false;
    }
  Select() {
    
    this.users.emit(this.userSearchResult.filter(u => u.selected == true));  
    this.selecteduser.emit(false);  

  }
}
