import { Component, OnInit } from '@angular/core';
import { MessagingService } from 'src/app/core/services/messaging/messaging.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MessageDetailGetMode, UpdateMessageInfoModel, MessageOperationType, MessageFileModel } from 'src/app/core/models/messaging/messaging.model';
import { FileUtilService } from 'src/app/core/utilities/file-util.service';
import { ToastrService } from 'ngx-toastr';
import { MessageConstants } from 'src/app/shared/constants';
import { StorageKeys } from 'src/app/shared/storage-keys';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  messageRecipientId: number;
  messageId: number;
  forward: boolean = false;
  reply: boolean = false;
  replyBtn: boolean = true;
  forwardBtn: boolean = true;
  openRecipientList: boolean[] = [];
  messageDetails: MessageDetailGetMode[] = [];
  currentUserId: any;
  messageBoxName: string ;

  constructor(
    private fileUtilService: FileUtilService,
    private messageingservice: MessagingService,
    private activatedRoute: ActivatedRoute,
    private router:Router,
    private toaster: ToastrService,
    private titleService: Title) {
    titleService.setTitle("پیام ها");
  }

  ngOnInit() {
    this.currentUserId = JSON.parse(localStorage.getItem(StorageKeys.claims)).UserId;
    this.messageBoxName = sessionStorage.getItem(StorageKeys.messageBoxName);
  
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        this.GetMessageDetails(params.messageId);
      })
  }
  GetMessageDetails(messageId: number): any {
    this.messageingservice.GetMessageDetails(messageId).subscribe(
      res => {
        this.messageDetails = res.reverse();

        for (let i = 0; i < this.messageDetails.length; i++) {
          this.openRecipientList[i] = false;
        }
        this.messageDetails.forEach(message => {
          message.sender.id == this.currentUserId ? message.sender.name = 'من': '';
          message.recipients.forEach(r => {
            r.id == this.currentUserId ? r.name = 'من': '';
          });
          if (message.attachementFiles.length > 0) {
            message.attachementFiles.forEach(file => {
              file.src= this.GetImageOfFile(file.contentType, file.file);
            });
          }
          
        }); 
      } );
  }

  Download(file: MessageFileModel) {
    this.fileUtilService.GetLinkFile(file.file, file.contentType, file.name);
  }

  GetImageOfFile(contentType: number, file: string): string {
    if (contentType != 1 && contentType != 2) {
      return this.fileUtilService.GetImageOfFile(contentType);
      } else {
      return "data:image/jpeg;base64,"+file;
      }
  }

  Replied(reply) {
    this.reply = reply;
    this.GetMessageDetails(this.messageId);
  }
  Forwarded(forward) {
    this.forward = forward;
    this.GetMessageDetails(this.messageId);
  }

  Action(action: number) {
    this.replyBtn = false;
    this.forwardBtn = false;

    if (action == 1) {
      this.reply = true;
      this.forward = false;

    } else {
      this.reply = false;
      this.forward = true;
    }
  }
  Delete(messageId: number) {
    var model = new UpdateMessageInfoModel();
    model.operationType = MessageOperationType.Delete;
    model.ids = [];
    model.ids.push(messageId);
    this.messageingservice.UpdateMessages(model).subscribe(
      res => {
        this.toaster.success(MessageConstants.Delete);
        this.router.navigate(['/messaging']);
      }
    );
  }
  Archive(messageId: number) {
    var model = new UpdateMessageInfoModel();
    model.operationType = MessageOperationType.Archive;
    model.ids = [];
    model.ids.push(messageId);
    this.messageingservice.UpdateMessages(model).subscribe(
      res => {
        this.toaster.success(MessageConstants.Succeed);
        this.router.navigate(['/messaging'])
        //this.GetMessageDetails(this.messageId);
      }
    );
  }

  UnArchive(messageId: number) {
  var model = new UpdateMessageInfoModel();
  model.operationType = MessageOperationType.UnArchive;
  model.ids = [];
    model.ids.push(messageId);
  this.messageingservice.UpdateMessages(model).subscribe(
    res => {
      this.toaster.success(MessageConstants.Succeed);
      //this.GetMessageDetails(this.messageId);
    }
  );
  }

  UnRead(messageId: number) {
    var model = new UpdateMessageInfoModel();
    model.operationType = MessageOperationType.UnRead;
    model.ids = [];
    model.ids.push(messageId);
    this.messageingservice.UpdateMessages(model).subscribe(
      res => {
        this.toaster.success(MessageConstants.Succeed);
      }
    );
  }
}
