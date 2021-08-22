import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { MessagingService } from 'src/app/core/services/messaging/messaging.service';
import { MessageGetModel, MessageSubjectGetModel, MessageSearchModel, UpdateMessageInfoModel, MessageOperationType, UnReadMessagesCountGetModel } from 'src/app/core/models/messaging/messaging.model';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { PagingResultModel, PagingModel } from 'src/app/core/models/shared/paging.model';
import { ToastrService } from 'ngx-toastr';
import { MessageConstants } from 'src/app/shared/constants';
import { StorageKeys } from '../../shared/storage-keys';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';
import { PagerService } from 'src/app/core/client-services/pager.service';
import { DateUtilService } from '../../core/utilities/date-util.service';
@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements OnInit {


  messageSearchResult: MessageGetModel[] = [];
  Messages: PagingResultModel<MessageGetModel> = <any>{};
  pagingModel: PagingModel = <any>{};
  pager: any = {};
  pagedItems: any[];
  recordCount: number = 0;
  @ViewChild('pageSize') pageSize: ElementRef;
  subjects: MessageSubjectGetModel[] = [];
  messageSearchForm: FormGroup;
  constPageSize: number = 30;
  isSelected: boolean = false;
  search: boolean = false;
  defultPageSize: number = 10;
  pageCount: number;
  title: string;
  messages: PagingResultModel<MessageGetModel> = <any>{};
  unReadMessagesCount: number;
  messageBoxType: number;
  systemicMessages: PagingResultModel<MessageGetModel>;
  @ViewChild('fromDate_mdsDateTimePicker') fromDate_mdsDateTimePicker;
  @ViewChild('toDate_mdsDateTimePicker') toDate_mdsDateTimePicker;
  constructor(
    private fb: FormBuilder,
    private pagerService: PagerService,
    private messageingservice: MessagingService,
    private spinner: NgxSpinnerService,
    private toster: ToastrService,
    private titleService: Title,
    private dateUtilService: DateUtilService) {
    this.titleService.setTitle("پیام ها");
  }

  ngOnInit() {
    this.pagingModel = { page: 1, pageSize: (this.pageSize.nativeElement.value === undefined ? this.defultPageSize : this.pageSize.nativeElement.value), accending: true, orderBy: 'Name' }
    this.pageCount = this.pageSize.nativeElement.value;
    this.messageSearchForm = this.CreatemessageSearchForm();
    this.UnReadMessagesCount();

    this.messageBoxType=1;
    this.GetMessages();
    this.GetSubjects();
  }

  UnReadMessagesCount(): any {
    this.messageingservice.UnReadMessagesCount().subscribe(res => {
      this.unReadMessagesCount = res.count;
    });
  }
 
  CreatemessageSearchForm(): FormGroup {
    return this.fb.group({
      body: new FormControl(''),
      subjectId: new FormControl('0'),
      fromDate: new FormControl(''),
      toDate: new FormControl(''),
      MessagePersonType: new FormControl('1', Validators.required),
      ReceiverOrSenderName:new FormControl(''),
      unRead: new FormControl(false),
      MessageBoxType: new FormControl('1'),
    });
  }
  
  GetSubjects(): any {
    this.messageingservice.GetMessageSubject().subscribe(
      res => {
        this.subjects = res;
      }
    );
  }

  SetMessageBoxType(value: number) {
    this.messageSearchForm.patchValue({ 'MessageBoxType': value });
    this.messageBoxType=value;
    this.messages.results = [];
    this.GetMessages();
  }

  SystemicNotifications(pagingModel: PagingModel) {
    this.messageingservice.SystemicNotifications(pagingModel).subscribe(
      res => {
        this.spinner.hide();
        this.messages.results = [];
        this.messages.totalNumberOfRecords=0;
        res.results.forEach(m =>{ 
          m.body = m.body.substr(0, 100);
          m.sendDate= this.dateUtilService.ConvertStringToDatePicker(m.sendDate);
        });
        this.systemicMessages = res;
        this.IsShowOptions();
        this.recordCount = this.systemicMessages.totalNumberOfRecords;
        this.pagedItems = this.systemicMessages.results;
        this.SetPageSystem(this.systemicMessages.pageNumber);
      },
      error => {
        this.spinner.hide();
        this.systemicMessages.results = [];
        this.messages.results = [];
        this.IsShowOptions();
        this.systemicMessages.totalNumberOfRecords = 0;
      }
    );
  }

  GetMessages(page: number = 1): any {

    var fromDate = '';
    var toDate = '';
    if (this.fromDate_mdsDateTimePicker != undefined) {
      var fromDate = this.dateUtilService.ConvertStringPersianToDate(this.fromDate_mdsDateTimePicker.myControl.value);
      var toDate = this.dateUtilService.ConvertStringPersianToDate(this.toDate_mdsDateTimePicker.myControl.value);
    }

    //check date
    if (fromDate == 'Invalid date' || toDate == 'Invalid date') {
      this.toster.warning(MessageConstants.DateFormatInvalid);
      return false;
    }	

    this.spinner.show();
    var messageSearchParametr = new MessageSearchModel();
    messageSearchParametr.body = this.messageSearchForm.get('body').value;
    messageSearchParametr.subjectId = this.messageSearchForm.get('subjectId').value;
    messageSearchParametr.UnRead = this.messageSearchForm.get('unRead').value;
    messageSearchParametr.ReceiverOrSenderName = this.messageSearchForm.get('ReceiverOrSenderName').value;
    messageSearchParametr.MessagePersonType = this.messageSearchForm.get('MessagePersonType').value;
    messageSearchParametr.fromDate = fromDate != '' ? fromDate : '';
    messageSearchParametr.toDate = toDate != '' ? toDate : '';
    messageSearchParametr.MessageBoxType = this.messageSearchForm.get('MessageBoxType').value;
    messageSearchParametr.paging = new PagingModel();
    messageSearchParametr.paging.accending = false;
    messageSearchParametr.paging.orderBy = 'id';
    messageSearchParametr.paging.pageSize = this.pageSize.nativeElement.value;
    messageSearchParametr.paging.page = page;

    switch (this.messageBoxType) {
      case 1:
      case 2:
      case 3:
        this.messageingservice.GetMessages(messageSearchParametr).subscribe(
          res => {
            this.spinner.hide();
            this.systemicMessages=null;
            res.results.forEach(m => m.body= m.body.substr(0, 100));
            this.messages = res;
            this.IsShowOptions();
            this.recordCount = this.messages.totalNumberOfRecords;
            this.pagedItems = this.messages.results;
            this.SetPage(page);
                },
                error => {
                  this.spinner.hide();
                  this.messages.results = [];
                  this.systemicMessages.results=[];
                  this.IsShowOptions();
                  this.messages.totalNumberOfRecords = 0;
                }
            );
        break;
      case 4:
        this.SystemicNotifications(messageSearchParametr.paging);
        break;
    }
  }


  PagingCounter(i: number) {
    return new Array(i);
  }

  IsShowOptions() {
    if (this.messages.results.findIndex(m => m.select == true) != -1) {
      this.isSelected = true;
    } else {
      this.isSelected = false;
    }    
  }

  SetPage(page: number) {
    this.pager = this.pagerService.getPager(this.messages.totalNumberOfRecords, page, this.pageSize.nativeElement.value);
    this.pagedItems = this.messages.results.slice(this.pager.startIndex, this.pager.endIndex + 1);
    this.pageCount = this.pageSize.nativeElement.value;
  }

  SetPageSystem(page: number) {
    this.pager = this.pagerService.getPager(this.systemicMessages.totalNumberOfRecords, page, this.pageSize.nativeElement.value);
    this.pagedItems = this.systemicMessages.results.slice(this.pager.startIndex, this.pager.endIndex + 1);
    this.pageCount = this.pageSize.nativeElement.value;
  }

  SelectAll(selectAll)
  {
    if (selectAll) {
      this.messages.results.forEach(m => m.select = true);
      this.isSelected = true;
    } else {
      this.messages.results.forEach(m => m.select = false);
      this.isSelected = false;
    }
    
  }

  Delete() {
    var model = new UpdateMessageInfoModel();
    model.operationType = MessageOperationType.Delete;
    model.ids = [];
    this.messages.results.filter(m => {
      if (m.select == true)
        model.ids.push(m.id);
    });
    this.messageingservice.UpdateMessages(model).subscribe(
      res => {
        this.toster.success(MessageConstants.Delete);
        this.GetMessages();
    }
      );
  }
  Archive() {
    var model = new UpdateMessageInfoModel();
    model.operationType = MessageOperationType.Archive;
    model.ids = [];
    this.messages.results.filter(m => {
      if (m.select == true)
        model.ids.push(m.id);
    }); this.messageingservice.UpdateMessages(model).subscribe(
      res => {     
        this.toster.success(MessageConstants.Succeed);
        this.GetMessages();
    }
    );
  }
  UnArchive() {
    var model = new UpdateMessageInfoModel();
    model.operationType = MessageOperationType.UnArchive;
    model.ids = [];
    this.messages.results.filter(m => {
      if (m.select == true)
        model.ids.push(m.id);
    });
    this.messageingservice.UpdateMessages(model).subscribe(
      res=> {
        this.toster.success(MessageConstants.Succeed);
        this.GetMessages();
    }
    );
  }
  UnRead() {
    var model = new UpdateMessageInfoModel();
    model.operationType = MessageOperationType.UnRead;
    model.ids = [];
    this.messages.results.filter(m => {
      if (m.select == true)
        model.ids.push(m.id);
    });
    this.messageingservice.UpdateMessages(model).subscribe(
      res=> {
        this.toster.success(MessageConstants.Succeed);
        this.GetMessages();
        this.UnReadMessagesCount();
    }
    );
  }

  SetMessageBoxName(messageBoxType: number) {
    if (messageBoxType == 1)
      sessionStorage.setItem(StorageKeys.messageBoxName, 'ورودی');
    else if (messageBoxType == 2)
      sessionStorage.setItem(StorageKeys.messageBoxName, 'خروجی');
    else if(messageBoxType == 3) sessionStorage.setItem(StorageKeys.messageBoxName, 'آرشیو');
    else sessionStorage.setItem(StorageKeys.messageBoxName, 'پیام های سیستمی');
  }
}
