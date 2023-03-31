import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {ApiService} from "./services/api/api.service";
import {StoreService} from "./services/store/store.service";
import {LayoutService} from "./services/layout/layout.service";
import {MenuService} from "./services/menu/menu.service";
import {MessageService, ConfirmationService} from "primeng/api";
import { ClientComponent } from './modules/client/client.component';
import {ToastModule} from "primeng/toast";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {OverlayModule} from "@angular/cdk/overlay";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {StatusInterceptor, TokenInterceptor} from "./services/middlewares";
import { DashboardComponent } from './modules/client/dashboard/dashboard.component';
import {CardModule} from 'primeng/card';
import {EditorModule} from 'primeng/editor';
import {ButtonModule} from 'primeng/button';

@NgModule({
  declarations: [
    AppComponent,
    ClientComponent,
    // CPanelComponent,
    DashboardComponent,
    // ContactInformationModalComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ToastModule,
    FormsModule,
    OverlayModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CardModule,
    EditorModule,
    ButtonModule
  ],
  providers: [
    ApiService,
    StoreService,
    LayoutService,
    MenuService,
    MessageService,
    ConfirmationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: StatusInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
