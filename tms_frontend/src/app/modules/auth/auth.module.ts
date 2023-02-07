import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import {AuthRoutingModule} from "./auth-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PasswordModule} from "primeng/password";
import {BlockUIModule} from "primeng/blockui";
import {ButtonModule} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {RippleModule} from "primeng/ripple";



@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    AuthRoutingModule,
    CommonModule,
    ButtonModule,
    RippleModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    BlockUIModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
