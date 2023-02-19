import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { tap } from "rxjs/operators";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {IUser, ICompany, IRole, ISomosUser} from "../../../models/user";
import {defaultDarkTheme, defaultLightTheme, defaultAvatar, defaultLogo} from "../default-ui-setting-values";
import { LayoutService } from 'src/app/services/layout/layout.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { SUPER_ADMIN_ID, TMSUserType } from '../../constants';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  @ViewChild('customLogo')
  customLogoRef!: ElementRef;
  @ViewChild('customAvatar')
  customAvatarRef!: ElementRef;

  user: any = {};
  accountTabIndex: number = 0;
  //user items
  input_username: string|number|undefined|null = ''
  input_company_id: any = ''
  input_role_id: any = ''
  input_email: string|number|undefined|null = ''
  input_first_name: string|number|undefined|null = ''
  input_last_name: string|number|undefined|null = ''
  input_old_password: string|number|undefined|null = ''
  input_password: string|number|undefined|null = ''
  input_confirm_password: string|number|undefined|null = ''
  input_somos_id: any = ''
  input_country: string|number|undefined|null = ''
  input_address: string|number|undefined|null = ''
  input_province: string|number|undefined|null = ''
  input_city: string|number|undefined|null = ''
  input_zip_code: string|number|undefined|null = ''
  input_tel1: string|number|undefined|null = ''
  input_tel2: string|number|undefined|null = ''
  input_mobile: string|number|undefined|null = ''
  input_fax: string|number|undefined|null = ''
  input_contact_name: string|number|undefined|null = ''
  input_contact_number: string|number|undefined|null = ''

  companies: any[] = []
  roles: any[] = []
  sms_users: any[] = []
  required = true;
  logged_user: any;

  logoImg: string = defaultLogo;
  avatar: string = defaultAvatar;
  selectedDarkTheme = defaultDarkTheme
  selectedLightTheme = defaultLightTheme

  darkThemes = [
    // { pace: 'yellow', label: 'Bootstrap Blue', mode: 'dark', key: 'bootstrap4-dark-blue'},
    // { pace: 'yellow', label: 'Bootstrap Purple', mode: 'dark', key: 'bootstrap4-dark-purple'},
    { pace: 'yellow', label: 'Material Design Indigo', mode: 'dark', key: 'md-dark-indigo'},
    { pace: 'yellow', label: 'Material Design Deep Purple', mode: 'dark', key: 'md-dark-deeppurple'},
    // { pace: 'yellow', label: 'Vela Blue', mode: 'dark', key: 'vela-blue'},
    // { pace: 'yellow', label: 'Vela Green', mode: 'dark', key: 'vela-green'},
    // { pace: 'yellow', label: 'Vela Orange', mode: 'dark', key: 'vela-orange'},
    // { pace: 'yellow', label: 'Vela Purple', mode: 'dark', key: 'vela-purple'},
    // { pace: 'yellow', label: 'Arya Blue', mode: 'dark', key: 'arya-blue'},
    // { pace: 'yellow', label: 'Arya Green', mode: 'dark', key: 'arya-green'},
    // { pace: 'yellow', label: 'Arya Orange', mode: 'dark', key: 'arya-orange'},
    // { pace: 'yellow', label: 'Arya Purple', mode: 'dark', key: 'arya-purple'},
    // { pace: 'yellow', label: 'Lara Blue', mode: 'dark', key: 'lara-dark-blue'},
    // { pace: 'yellow', label: 'Lara Indigo', mode: 'dark', key: 'lara-dark-indigo'},
    // { pace: 'yellow', label: 'Lara Purple', mode: 'dark', key: 'lara-dark-purple'},
    // { pace: 'yellow', label: 'Lara Teal', mode: 'dark', key: 'lara-dark-teal'},
  ]

  lightThemes = [
    // { pace: 'blue', label: 'Bootstrap Blue', mode: 'light', key: 'bootstrap4-light-blue'},
    // { pace: 'blue', label: 'Bootstrap Purple', mode: 'light', key: 'bootstrap4-light-purple'},
    { pace: 'blue', label: 'Material Design Indigo', mode: 'light', key: 'md-light-indigo'},
    { pace: 'blue', label: 'Material Design Deep Purple', mode: 'light', key: 'md-light-deeppurple'},
    // { pace: 'blue', label: 'Tailwind', mode: 'light', key: 'tailwind-light'},
    // { pace: 'blue', label: 'Fluent', mode: 'light', key: 'fluent-light'},
    // { pace: 'blue', label: 'Saga Blue', mode: 'light', key: 'saga-blue'},
    // { pace: 'blue', label: 'Saga Green', mode: 'light', key: 'saga-green'},
    // { pace: 'blue', label: 'Saga Orange', mode: 'light', key: 'saga-orange'},
    // { pace: 'blue', label: 'Saga Purple', mode: 'light', key: 'saga-purple'},
    // { pace: 'blue', label: 'Lara Blue', mode: 'light', key: 'lara-light-blue'},
    // { pace: 'blue', label: 'Lara Indigo', mode: 'light', key: 'lara-light-indigo'},
    // { pace: 'blue', label: 'Lara Purple', mode: 'light', key: 'lara-light-purple'},
    // { pace: 'blue', label: 'Lara Teal', mode: 'light', key: 'lara-light-teal'},
  ]

  menuTypes = [
    { label: 'Static', key: 'static' },
    // { label: 'Slim', key: 'slim' },
    { label: 'Overlay', key: 'overlay' },
  ]
  selectedMenuType: any

  previewThemeId: any
  isThemePreview = false
  previewMenuId: any
  isMenuPreview = false
  blockContent = false

  constructor(
    public api: ApiService,
    public store: StoreService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public layoutService: LayoutService,
    private menuService: MenuService,
  ) { }

  async ngOnInit() {
    await new Promise<void>(resolve => {
      let mainUserInterval = setInterval(() => {
        if (this.store.getUser()) {
          clearInterval(mainUserInterval)

          resolve()
        }
      }, 100)
    })

    this.logged_user = this.store.getUser();

    this.api.getUser(this.logged_user.id).subscribe(async res => {
      this.input_username = res.username;
      this.input_company_id = {name: res.company?.name, value: res.company?.id};
      this.input_role_id = {name: res.role?.name, value: res.role?.id};
      this.input_email = res.email;
      this.input_first_name = res.first_name;
      this.input_last_name = res.last_name;
      this.input_somos_id = {name: res.somosUser?.username, value: res.somosUser?.id};
      this.input_country = res.userInfo?.country;
      this.input_address = res.userInfo?.address;
      this.input_province = res.userInfo?.province;
      this.input_city = res.userInfo?.city;
      this.input_zip_code = res.userInfo?.zip_code;
      this.input_tel1 = res.userInfo?.tel1;
      this.input_tel2 = res.userInfo?.tel2;
      this.input_mobile = res.userInfo?.mobile;
      this.input_fax = res.userInfo?.fax!=null?res.userInfo?.fax:'';
      this.input_contact_name = res.userInfo?.contact_name!=null?res.userInfo?.contact_name:'';
      this.input_contact_number = res.userInfo?.contact_number!=null?res.userInfo?.contact_number:'';
    })

    this.initUser();
    this.getCompaniesList();
    this.getRolesList();
    this.getSMSUserList();
  }

  initUser() {
    this.api.getUser(this.store.getUser().id).subscribe(async res => {
      this.user = res;

      this.store.state$.subscribe(async (state) => {
        if (state.token && state.user) {
          await this.getUISettings()
        }
      });

    });
  }

  /**
   * get ui settings from user information
   */
  getUISettings = async () => {
    if (this.user.ui_settings) {
      let uiSettings = JSON.parse(this.user.ui_settings)
      if (uiSettings.customLogoImg != undefined) {
        this.logoImg = uiSettings.customLogoImg
      }

      if (uiSettings.customAvatar != undefined) {
        this.avatar = uiSettings.customAvatar
      }

      // if (uiSettings.menuType != undefined) {
      //   this.selectedMenuType = uiSettings.menuType
      // }

      if (uiSettings.darkTheme != undefined) {
        this.selectedDarkTheme = uiSettings.darkTheme
      }

      if (uiSettings.lightTheme != undefined) {
        this.selectedLightTheme = uiSettings.lightTheme
      }

    } else {
      // this.applySettings()
    }

    this.customLogoRef.nativeElement.value = ''
    this.customAvatarRef.nativeElement.value = ''
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  getCompaniesList = async () => {
    try {
      await this.api.getCompaniesListForFilter()
        .pipe(tap(async (companiesRes: ICompany[]) => {
          this.companies = companiesRes.map(item=>{
            return this.createData(
              item.name,
              item.id
            );
          });
        })).toPromise();
    } catch (e) {
    }
  }

  getRolesList = async () => {
    try {
      await this.api.getRolesListForFilter()
        .pipe(tap(async (rolesRes: IRole[]) => {
          this.roles = rolesRes.map(item=>{
            return this.createData(
              item.name,
              item.id
            );
          });
        })).toPromise();
    } catch (e) {
    }
  }

  getSMSUserList = async () => {
    try {
      await this.api.getSMSUserListForFilter()
        .pipe(tap(async (SMSUsersRes: ISomosUser[]) => {
          this.sms_users = SMSUsersRes.map(item=>{
            return this.createData(
              item.username,
              item.id
            );
          });
        })).toPromise();
    } catch (e) {
    }
  }

  onMainUpdate = async () => {
    let username = this.input_username;
    let company_id = this.input_company_id?.value;
    let role_id = this.input_role_id?.value;
    let email = this.input_email;
    let first_name = this.input_first_name;
    let last_name = this.input_last_name;

    if(username==''||email==''||first_name==''||last_name=='') {
      return;
    }

    await this.api.updateUserMain(this.logged_user.id, {
      username: username,
      email: email,
      first_name: first_name,
      last_name: last_name,
      company_id: company_id,
      role_id: role_id
    }).pipe(tap(res=>{
      this.showSuccess('Successfully Updated!');
    })).toPromise();
  }

  mainReset = () => {
    this.api.getUser(this.logged_user.id).subscribe(async res => {
      this.input_username = res.username;
      this.input_company_id = {name: res.company?.name, value: res.company?.id};
      this.input_role_id = {name: res.role?.name, value: res.role?.id};
      this.input_email = res.email;
      this.input_first_name = res.first_name;
      this.input_last_name = res.last_name;
    })
  }

  onPasswordUpdate = async () => {
    let password = this.input_password;
    let old_password = this.input_old_password;
    if(password=='') {
      return;
    }
    if(password != this.input_confirm_password) {
      this.showInfo('Please confirm password');
      return;
    }
    await this.api.updateUserPassword(this.logged_user.id, {
      old_password: old_password,
      new_password: password
    }).pipe(tap(res=>{
      this.showSuccess('Successfully Updated!');
    })).toPromise();
  }

  passwordReset = () => {
    this.input_old_password = ''
    this.input_password = ''
    this.input_confirm_password = ''
  }

  onSomosUpdate = async () => {
    let somos_id = this.input_somos_id?.value;

    await this.api.updateUserSomos(this.logged_user.id, {
      somos_id: somos_id
    }).pipe(tap(res=>{
      this.showSuccess('Successfully Updated!');
    })).toPromise();
  }

  somosReset = () => {
    this.api.getUser(this.logged_user.id).subscribe(async res => {
      this.input_somos_id = {name: res.somosUser?.username, value: res.somosUser?.id};
    })
  }

  onAdditionalUpdate = async () => {
    let country = this.input_country;
    let address = this.input_address;
    let province = this.input_province;
    let city = this.input_city;
    let zip_code = this.input_zip_code;
    let tel1 = this.input_tel1?.toString();
    let tel2 = this.input_tel2?.toString();
    let mobile = this.input_mobile?.toString();
    let fax = this.input_fax?.toString();
    let contact_name = this.input_contact_name;
    let contact_number = this.input_contact_number?.toString();

    await this.api.updateUserAdditional(this.logged_user.id, {
      country: country,
      address: address,
      province: province,
      city: city,
      zip_code: zip_code,
      tel1: tel1,
      tel2: tel2,
      mobile: mobile,
      fax: fax,
      contact_name: contact_name,
      contact_number: contact_number,
    }).pipe(tap(res=>{
      this.showSuccess('Successfully Updated!');
    })).toPromise();
  }

  AdditionalReset = () => {
    this.api.getUser(this.logged_user.id).subscribe(async res => {
      this.input_country = res.userInfo?.country;
      this.input_address = res.userInfo?.address;
      this.input_province = res.userInfo?.province;
      this.input_city = res.userInfo?.city;
      this.input_zip_code = res.userInfo?.zip_code;
      this.input_tel1 = res.userInfo?.tel1;
      this.input_tel2 = res.userInfo?.tel2;
      this.input_mobile = res.userInfo?.mobile;
      this.input_fax = res.userInfo?.fax!=null?res.userInfo?.fax:'';
      this.input_contact_name = res.userInfo?.contact_name!=null?res.userInfo?.contact_name:'';
      this.input_contact_number = res.userInfo?.contact_number!=null?res.userInfo?.contact_number:'';
    })
  }

  /**
   * this is called when the user change the custom logo
   * @param ev logo file input field
   */
  onChangeCustomLogoImg(ev: any) {
    var reader = new FileReader()
    let pThis: any = this

    reader.onload = function () {
      pThis.logoImg = reader.result
    }

    // check the width/height of the image
    var _URL = window.URL || window.webkitURL
    var file = ev.target.files[0]
    var img = new Image();
    var objectUrl = _URL.createObjectURL(file)
    img.onload = function (event) {
      const loadedImage: any = event.currentTarget
      let width = parseFloat(loadedImage.width)
      let height = parseFloat(loadedImage.height)

      _URL.revokeObjectURL(objectUrl)

      // Enable that for preserving a fixed image rate
      //let rate = width / height
      //if (0.9 < rate && rate < 4) {
        if (width > 200 || height > 100) {
          pThis.showError('Please select the image that width and height are less than 200px')
          pThis.customLogoRef.nativeElement.value = ''

        } else {
          reader.readAsDataURL(file)
        }

      //} else {
      //  pThis.toastr.error('Please select the image with the almost same width and height', '', {positionClass: 'toast-top-right'})
      //  pThis.customLogoRef.nativeElement.value = ''
      //}
    }
    img.src = objectUrl

  }

  /**
   * this is called at Logo Remove button on UI Settings tab
   */
  onClickRemoveLogo = () => {
    this.logoImg = ''
    this.customLogoRef.nativeElement.value = ''
  }

  /**
   * this is called when the user change the avatar
   * @param ev avatar file input field
   */
  onChangeAvatar(ev: any) {
    var reader = new FileReader()
    let pThis: any = this

    reader.onload = function (event) {

      pThis.avatar = reader.result
    }

    // check the width/height of the image
    var _URL = window.URL || window.webkitURL
    var file = ev.target.files[0]
    var img = new Image();
    var objectUrl = _URL.createObjectURL(file)
    img.onload = function (event) {
      const loadedImage: any = event.currentTarget
      let width = parseFloat(loadedImage.width)
      let height = parseFloat(loadedImage.height)


      _URL.revokeObjectURL(objectUrl)

      let rate = width / height
      if (0.9 < rate && rate < 1.1) {
        if (width > 100 || height > 100) {
          pThis.showError('Please select the image that width and height are less than 200px');
          pThis.customAvatarRef.nativeElement.value = ''

        } else {
          reader.readAsDataURL(file)
        }

      } else {
        pThis.showError('Please select the image with the almost same width and height');
        pThis.customAvatarRef.nativeElement.value = ''
      }
    }
    img.src = objectUrl
  }

  /**
   * this is called at Avatar Remove button on UI Settings tab
   */
  onClickRemoveAvatar = () => {
    this.avatar = ''
    this.customAvatarRef.nativeElement.value = ''
  }

  applyMenu = async () => {
    if (this.isMenuPreview)
      return

    let menu = this.getCurrentMenuType()
    if (menu == this.selectedMenuType.key)
      return

    this.isMenuPreview = true
    this.layoutService.config.menuMode = this.selectedMenuType.key;
    if (this.layoutService.isSlim()) {
      this.menuService.reset();
    }

    this.previewMenuId = setTimeout( () => {
      this.restoreMenu()
    }, 10000)

    this.showSuccess("Menu will be restored within 10 seconds")
  }

  getCurrentMenuType() {
    let uiSettings = JSON.parse(this.store.getUser().ui_settings)
    if (uiSettings == null) {
      uiSettings = {}
    }

    let menu = 'static'
    if (uiSettings.menuType)
      menu = uiSettings.menuType

    return menu
  }

  restoreMenu = async () => {
    this.layoutService.config.menuMode = this.getCurrentMenuType();
    if (this.layoutService.isSlim()) {
      this.menuService.reset();
    }

    this.isMenuPreview = false
  }

  applyTheme = async (mode: string) => {
    if (this.isThemePreview)
      return

    this.isThemePreview = true
    await this.layoutService.applyTheme(mode=='dark' ? this.selectedDarkTheme.key : this.selectedLightTheme.key,
      mode=='dark' ? this.selectedDarkTheme.mode : this.selectedLightTheme.mode,
      mode=='dark' ? this.selectedDarkTheme.pace : this.selectedLightTheme.pace)

    this.previewThemeId = setTimeout(() => {
      this.restoreTheme()
    }, 5000)

    this.showSuccess("Theme will be restored within 5 seconds")
  }

  restoreTheme = async() => {
    let theme = this.getCurrentTheme()
    await this.layoutService.applyTheme(theme.key, theme.mode, theme.pace)
    this.isThemePreview = false
  }

  getCurrentTheme() {
    let uiSettings = JSON.parse(this.store.getUser().ui_settings)
    if (uiSettings == null) {
      uiSettings = {}
    }

    let darkTheme = defaultDarkTheme
    if (uiSettings.darkTheme) {
      darkTheme = uiSettings.darkTheme
    }

    let lightTheme = defaultLightTheme
    if (uiSettings.lightTheme) {
      lightTheme = uiSettings.lightTheme
    }

    let scheme = 'dark'
    if (uiSettings.colorScheme)
      scheme = uiSettings.colorScheme

    return scheme=='dark' ? darkTheme : lightTheme
  }

  /**
   * save ui settings into the session storage and update user information
   */
  applySettings = () => {
    // next, update the ui setting of the user
    let uiSettings = JSON.parse(this.user.ui_settings)

    if (this.store.getUser() && this.user.id == this.store.getUser().id) {
      uiSettings = JSON.parse(this.store.getUser().ui_settings)
    }

    if (uiSettings == null) {
      uiSettings = {}
    }

    // images
    uiSettings.customLogoImg = this.logoImg

    // save avatar
    uiSettings.customAvatar = this.avatar

    // uiSettings.menuType = this.selectedMenuType
    uiSettings.darkTheme = this.selectedDarkTheme
    uiSettings.lightTheme = this.selectedLightTheme

    let scheme = 'dark'
    if (uiSettings.colorScheme)
      scheme = uiSettings.colorScheme
    else
      uiSettings.colorScheme = scheme

    // apply the setting values to UI if the user is just the user
    if (this.store.getUser() && this.user.id == this.store.getUser().id) {
      this.setUIWithSettingValue(scheme);

      // save the user into store
      const curUser = this.store.getUser();
      curUser.uiSettings = JSON.stringify(uiSettings);
      this.store.storeUser(curUser);
    }

    // save the user into store
    this.user.ui_settings = JSON.stringify(uiSettings);

    this.blockContent = true
    // call the user update api
    try {
      //ksh
      this.api.updateUserUISettings(this.user.id, {
        ui_settings: this.user.ui_settings
      }).subscribe(res=>{
        this.blockContent = false
        this.showSuccess('UI settings successfully updated.')
      }, error => {
        this.blockContent = false
      });
    } catch (e) {
      this.blockContent = false
    }
  }

  /**
 * set ui with setting value
 */
  setUIWithSettingValue = (scheme: string) => {
    this.layoutService.applyTheme(scheme=='dark' ? this.selectedDarkTheme.key : this.selectedLightTheme.key,
      scheme=='dark' ? this.selectedDarkTheme.mode : this.selectedLightTheme.mode,
      scheme=='dark' ? this.selectedDarkTheme.pace : this.selectedLightTheme.pace)
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
  showInfo = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: msg });
  };

}
