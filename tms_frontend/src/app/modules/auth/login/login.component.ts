import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MessageService} from "primeng/api";
import {ROUTES} from "../../../app.routes";
import {Router} from "@angular/router";
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import { defaultDarkTheme, defaultLightTheme } from '../../client/default-ui-setting-values';
import { LayoutService } from 'src/app/services/layout/layout.service';
import { IUser } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit  {

  private localdb: Storage = window.localStorage;
  public submitted = false;
  loginForm!: FormGroup

  blockContent = false

  colorScheme = 'dark'     // theme mode (dark, light)
  user!: IUser                 // user information
  // @ViewChild('ref_colorSchemeMode') refColorSchemeMode!: ElementRef;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private api: ApiService,
              private store: StoreService,
              public layoutService: LayoutService, 
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.localdb.clear()
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberedIf: [false],
    });

  }

  ngAfterViewInit() {
    // this.refColorSchemeMode.nativeElement.click();
  }

  get f() {
    return this.loginForm.controls;
  }

  showWarn = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Warning', detail: msg });
  }
  showError = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: msg });
  }
  showSuccess = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: msg });
  };

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.blockContent = true

    this.submitted = true;
    this.api.login({ username: this.f.username.value, password: this.f.password.value }, this.f.rememberedIf.value).subscribe(async res => {
      this.blockContent = false

      if (res) {
        this.store.storePassword(this.f.password.value);
        await this.router.navigate([ROUTES.dashboard]);
      }

      this.showSuccess("User logged in successfully");
      this.submitted = false;
    }, (err: any) => {
      this.blockContent = false
      this.submitted = false;

      if (err.error?.error) {
        // @ts-ignore
        this.showWarn(err.error.error?.message);
        return;
      } else {
        this.showWarn(err?.message);
      }
    });
    // this.submitted = false;
  }

  toggleMode() {
    this.colorScheme = this.colorScheme=='dark' ? 'light' : 'dark'

    let dark = defaultDarkTheme
    let light = defaultLightTheme

    if(this.colorScheme=='dark') {
      this.layoutService.applyTheme(dark.key, dark.mode, dark.pace)
    } else {
      this.layoutService.applyTheme(light.key, light.mode, light.pace)
    }
  }

}
