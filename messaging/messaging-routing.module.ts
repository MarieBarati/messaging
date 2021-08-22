import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MessagingComponent } from './messaging.component';
import { MessageComponent } from './message/message.component';
import { ComposeComponent } from './compose/compose.component';
import { MessageSystemComponent } from './message-system/message-system.component';

const messagingRoutes: Routes = [

  { path: '', component: MessagingComponent },
  { path: 'compose', component: ComposeComponent },
  { path: ':messageId', component: MessageComponent },
  { path: ':id/systemMessage', component: MessageSystemComponent },
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(messagingRoutes),
  ],
  exports: [RouterModule]
})
export class MessagingRoutingModule { }
