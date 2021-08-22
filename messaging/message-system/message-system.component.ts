import { Component, OnInit } from '@angular/core';
import { MessagingService } from '../../../core/services/messaging/messaging.service';
import { ActivatedRoute, Params } from '@angular/router';
import { SystemNotificationGetModel } from '../../../core/models/notification/notification.model';

@Component({
  selector: 'app-message-system',
  templateUrl: './message-system.component.html',
  styleUrls: ['./message-system.component.css']
})
export class MessageSystemComponent implements OnInit {
  id: number;
  systemMessage: SystemNotificationGetModel;

  constructor(
    private messageingservice: MessagingService,
    private activatedRoute: ActivatedRoute,
    
  ) { }

  ngOnInit() {

    this.activatedRoute.params.subscribe(
      (params: Params) => {
        this.GetNotificationMessage(+params.id);

      })

  }

  GetNotificationMessage(id) {
    this.messageingservice.GetNotificationMessage(id).subscribe(
      res => {
        this.systemMessage = res;

      }

    )
  }
}
