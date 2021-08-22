import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppConfig } from 'src/app/shared/app-config';
import { FileUtilService } from 'src/app/core/utilities/file-util.service';
import { MessageConstants } from 'src/app/shared/constants';
import { ToastrService } from 'ngx-toastr';
import { MessagingService } from 'src/app/core/services/messaging/messaging.service';
import { MessageSubjectGetModel, MessageSendModel } from 'src/app/core/models/messaging/messaging.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { UsersGetModel, DepartmentsGetModel, RoleGetModel, MessagingUserGroupModel } from 'src/app/core/models/user/user.model';
import { PagingResultModel } from 'src/app/core/models/shared/paging.model';
import { OrderBy } from 'src/app/core/models/basis/basis.model';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UserService } from 'src/app/core/services/user/user.service';
import { PagingService } from 'src/app/core/client-services/paging.service';
import { Router } from '@angular/router';
import { RegexUtil } from '../../../core/utilities/regex-util';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { StorageKeys } from '../../../shared/storage-keys';



@Component({
    selector: 'app-compose',
    templateUrl: './compose.component.html',
    styleUrls: ['./compose.component.css']
})
export class ComposeComponent implements OnInit {

  public Editor = DecoupledEditor;
  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
    public isLoading = false;
    recivergroup: MessagingUserGroupModel[] = [];
    limit: number = 28;
  selecedUsers: UsersGetModel[] = [];
    selectUser: boolean;
    ascending: boolean = true;
    @ViewChild('fileInput') fileInput: ElementRef;
    @ViewChild('body') body: ElementRef;
    hiddenGrid: boolean = false;
    subjects: MessageSubjectGetModel[] = [];
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
        this.GetSubjects();
        this.selecedUsers = new Array<UsersGetModel>();
        this.messageform = new FormGroup({
          subjectId: new FormControl(0, [Validators.required]),
            body: new FormControl('', Validators.required),
        })
    }
    GetSubjects(): any {
        this.messageservice.GetMessageSubject().subscribe(
            res => {
                this.subjects = res;
            }
        );
    }
    IsSelected(selectUser) {
        this.selectUser = selectUser;
    }

  GetSelecedUsers(selectedUser: UsersGetModel[]) {
    if ((this.isApplicant && (this.selecedUsers.length + selectedUser.length) <= 1) || (!this.isApplicant && (this.selecedUsers.length + selectedUser.length) <= 100)) {
      selectedUser.forEach(u => {
        if (this.selecedUsers.findIndex(user => user.userId == u.userId) == -1) {
          this.selecedUsers.push(u);
        }
      })
    }
    else { this.toastr.warning(MessageConstants.UnallowableMessageRecipientsCount);}
    }
    
    SelectFiles(event: any) {
        if (this.fileUtilService.CheckCount(event.target.files.length + this.uploadFiles.length, AppConfig.maxCountFileUpload)) {
            for (var i = 0; i < event.target.files.length; i++) {
                var file = event.target.files[i];
                if (this.fileUtilService.CheckSize(file, AppConfig.maxMessageSizeFileUpload)) {
                    this.uploadFiles.push(file);
                }
                else {
                    this.toastr.error(MessageConstants.InvalidMessageFileSize);
                }
            }
        }
        else {
            this.toastr.error(MessageConstants.FileCount)
        }
    }

    Upload() {
        this.isLoading = true;
    }

    Send() {
        var model = new MessageSendModel();
        model.RecipientIds = new Array<number>();
        this.selecedUsers.forEach(u => { model.RecipientIds.push(u.userId) });
        model.Body = this.messageform.get('body').value;
        model.ShouldBeArchive = false;
        model.RefrenceMessageId = 0;
        model.SubjectId = this.messageform.get('subjectId').value;
        var messageFormData = new FormData();
        messageFormData = this.fileUtilService.ConvertFilesToFormData("AttachmentFiles", this.uploadFiles);
        messageFormData = this.fileUtilService.ConvertModelToFormData(model, messageFormData, "");
        this.messageservice.SendMessage(messageFormData).subscribe(res => {
          this.toastr.success('پیام شما با موفقیت ارسال شد.');
          this.router.navigate(['/messaging'])
        });
    }

    Remove(filename: string) {
        var index = this.uploadFiles.findIndex(file => file.name == filename);
        this.uploadFiles.splice(index, 1);

    }
    Removeuser(userId: number) {
        var index = this.selecedUsers.findIndex(u => u.userId == userId);
        this.selecedUsers.splice(index, 1);
    }
}
