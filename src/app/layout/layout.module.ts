import 'jquery-slimscroll';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsDropdownModule, TooltipModule } from 'ngx-bootstrap';

import { ROUTES } from './layout.routes';

import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ChatSidebarComponent } from './chat-sidebar/chat-sidebar.component';
import { ChatMessageComponent } from './chat-sidebar/chat-message/chat-message.component';
import { SearchPipe } from './pipes/search.pipe';
import { NotificationsLoadDirective } from './notifications/notifications-load.directive';
import { NotificationsComponent } from './notifications/notifications.component';
import { Notificacion } from './notifications/notificacion/notificacion.component';
import { Autorizacion } from './notifications/autorizacion/autorizacion.component';

import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import {HelperComponent} from './helper/helper.component';
import {NewWidgetModule} from './new-widget/widget.module';
import {HelperService} from './helper/helper.service';
import { UtilsModule } from './utils/utils.module';
import { AlertaPipe } from 'app/pipes/alerta.pipe';
import { SharedAlertasModule } from 'app/shared_modules/shared_aletras.module';

@NgModule({
  imports: [
    CommonModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    ROUTES,
    FormsModule,
    LoadingBarRouterModule,
    NewWidgetModule,
    UtilsModule,
    SharedAlertasModule
  ],
  declarations: [
    LayoutComponent,
    SidebarComponent,
    NavbarComponent,
    ChatSidebarComponent,
    SearchPipe,
    NotificationsComponent,
    NotificationsLoadDirective,
    Notificacion,
    Autorizacion,
    ChatMessageComponent,
    HelperComponent
  ],
  providers: [
    HelperService
  ]
})
export class LayoutModule {
}
