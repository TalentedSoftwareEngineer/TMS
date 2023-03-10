import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router, CanLoad} from '@angular/router';
import {IUser, IUserToken} from "../models/user";
import {StoreService} from "../services/store/store.service";
import {ApiService} from "../services/api/api.service";
import {LayoutService} from "../services/layout/layout.service";
import {MenuService} from "../services/menu/menu.service";
import {
  defaultAvatar,
  defaultDarkTheme,
  defaultLightTheme,
  defaultLogo
} from "../modules/client/default-ui-setting-values";


@Injectable({
  providedIn: 'root'
})
export class AuthLazyGuard implements CanLoad {

  private activeUser!: boolean;
  private token!: IUserToken;
  private user!: IUser

  constructor(private router: Router, private store: StoreService, private api: ApiService, private layoutService: LayoutService, private menuService: MenuService) {
    this.store.state$.subscribe(async (state) => {
      this.activeUser = !!state.user;
      this.token = state.token;
    });
  }

  public async canLoad() {
    // For more advanced checks, we can set 'data' to,
    // the app-routing.module and get it with next.data.role
    this.store.state$.subscribe(async (state) => {
      this.activeUser = !!state.user;
      this.user = state.user
      this.token = state.token
    });

    if (!!this.token) {
      await this.api.retrieveLoggedUserOb(this.token).subscribe((user) => {
        this.getUISettingFromUserInfo()
      })
      return true;
    } else {
      this.router.navigateByUrl('auth/login');
      return false;
    }
  }

  getUISettingFromUserInfo = () => {
    let user = this.store.getUser()
    let uiSettings = JSON.parse(user.ui_settings)

    if (!uiSettings)
      uiSettings = {}

    if (uiSettings.customLogoImg == undefined || uiSettings.customLogoImg == '') {
      uiSettings.customLogoImg = defaultLogo
    }

    if (uiSettings.customAvatar == undefined || uiSettings.customAvatar == '') {
      uiSettings.customAvatar = defaultAvatar
    }

    if (uiSettings.darkTheme == undefined) {
      uiSettings.darkTheme = defaultDarkTheme
    }

    if (uiSettings.lightTheme == undefined) {
      uiSettings.lightTheme = defaultLightTheme
    }

    if (uiSettings.colorScheme == undefined) {
      uiSettings.colorScheme = 'dark'
    }

    user.ui_settings = JSON.stringify(uiSettings)
    this.store.storeUser(user)

    this.setUIWithSettingValue(uiSettings)
  }

  setUIWithSettingValue = (uiSettings: any) => {
    this.layoutService.applyTheme(uiSettings.colorScheme=='dark' ? uiSettings.darkTheme.key : uiSettings.lightTheme.key,
      uiSettings.colorScheme=='dark' ? uiSettings.darkTheme.mode : uiSettings.lightTheme.mode,
      uiSettings.colorScheme=='dark' ? uiSettings.darkTheme.pace : uiSettings.lightTheme.pace)
  }

}
