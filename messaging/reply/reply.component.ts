import { Component, OnInit, Input, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FileUtilService } from 'src/app/core/utilities/file-util.service';
import { AppConfig } from 'src/app/shared/app-config';
import { MessageConstants } from 'src/app/shared/constants';
import { MessagingService } from 'src/app/core/services/messaging/messaging.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageSendModel, UserModel } from 'src/app/core/models/messaging/messaging.model';
import { UsersGetModel } from '../../../core/models/user/user.model';
import { Router } from '@angular/router';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { StorageKeys } from '../../../shared/storage-keys';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.css']
})
export class ReplyComponent implements OnInit {
  public Editor = DecoupledEditor;
  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  selecedUsers: UsersGetModel[] = [];
  selectUser: boolean = false;
  @Input() conversationId: number;
  @Input() subjectId: number;
  @Input() sender: UserModel;
  @Output() replied  = new EventEmitter();
  hiddenGrid: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('body') body: ElementRef;
  isLoading: boolean = false;
  uploadFiles: any[] = [];
  messageform: FormGroup;
  isApplicant: boolean;
  constructor(
    private toastr: ToastrService,
    private messageservice: MessagingService,
    private fileUtilService: FileUtilService,
    private router: Router,
  ) {
    let claim = JSON.parse(localStorage.getItem(StorageKeys.claims));
    this.isApplicant = JSON.parse(claim.IsApplicant);
  }

  ngOnInit() {
    this.messageform = new FormGroup({
      body: new FormControl('', Validators.required),
    })
  }
  SelectFiles(event: any) {
    if (this.fileUtilService.CheckCount(event.target.files.length + this.uploadFiles.length, AppConfig.maxCountFileUpload)) {
      for (var i = 0; i < event.target.files.length; i++) {
        var file = event.target.files[i];
        if (this.fileUtilService.CheckSize(file, AppConfig.maxSizeFileUpload)) {
          this.uploadFiles.push(file);
        }
        else {
          this.toastr.error(MessageConstants.FileSize, file.name);
        }
      }
    }
    else {
      this.toastr.error(MessageConstants.FileCount)
    }
  }

  Upload() {

    this.isLoading = true;
    var files = this.fileUtilService.ConvertFilesToFormData("files", this.uploadFiles);
    console.log(this.uploadFiles);


  }


  Remove(filename: string) {
    var index = this.uploadFiles.findIndex(file => file.name == filename);
    this.uploadFiles.splice(index, 1);

  }
  Clear() {
    //this.replied.emit(false);
  }
  Reply() {
    var model = new MessageSendModel();
    model.Body = this.messageform.value.body;
    model.RecipientIds = new Array<number>();
    model.RecipientIds[0] = this.sender.id;
    model.ShouldBeArchive = true;
    this.selecedUsers.forEach(u => { model.RecipientIds.push(u.userId) });
    model.RefrenceMessageId = this.conversationId;
    model.SubjectId = this.subjectId;
    var messageFormData = new FormData();
    messageFormData = this.fileUtilService.ConvertFilesToFormData("AttachmentFiles", this.uploadFiles);
    messageFormData = this.fileUtilService.ConvertModelToFormData(model, messageFormData, "");
    this.messageservice.SendMessage(messageFormData).subscribe(res => {
      this.toastr.success('پیام شما با موفقیت ارسال شد.');
      this.router.navigate(['/messaging']);
    });

  }

  //this.replied.emit(false);
  IsSelected(selectUser) {
    this.selectUser = selectUser;
  }

  GetSelecedUsers(selectedUser: UsersGetModel[]) {
    if ((this.isApplicant && (this.selecedUsers.length + selectedUser.length) < 1) || (!this.isApplicant && (this.selecedUsers.length + selectedUser.length) < 100)) {
      selectedUser.forEach(u => {
        if (this.selecedUsers.findIndex(user => user.userId == u.userId) == -1) {
          this.selecedUsers.push(u);
        }
      })
    }
    else { this.toastr.warning(MessageConstants.UnallowableMessageRecipientsCount); }

  }

  Removeuser(userId: number) {
    var index = this.selecedUsers.findIndex(u => u.userId == userId);
    this.selecedUsers.splice(index, 1);

  }
}
