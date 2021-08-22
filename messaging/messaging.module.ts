import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagingComponent } from './messaging.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MessagingRoutingModule } from './messaging-routing.module';
import { MessageComponent } from './message/message.component';
import { ComposeComponent } from './compose/compose.component';
import { ReplyComponent } from './reply/reply.component';
import { ForwardComponent } from './forward/forward.component';
import { MessagingService } from 'src/app/core/services/messaging/messaging.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PagingService } from 'src/app/core/client-services/paging.service';
import { SelectUserComponent} from './select-user/select-user.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MessageSystemComponent } from './message-system/message-system.component';
import { MdsAngularPersianDateTimePickerModule } from 'mds.angular.datetimepicker';

@NgModule({
  declarations: [MessagingComponent, MessageComponent, ComposeComponent, ReplyComponent, ForwardComponent, SelectUserComponent, MessageSystemComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgSelectModule,
    ReactiveFormsModule,
    MessagingRoutingModule,
    CKEditorModule,
    MdsAngularPersianDateTimePickerModule
  ],
  exports:[
    SelectUserComponent
  ],
  providers: [
    MessagingService,
    PagingService,
    ReactiveFormsModule,
  ]
})
export class MessagingModule { }
