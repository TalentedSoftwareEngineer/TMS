import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {LayoutService} from "../../../services/layout/layout.service";
import {MenuItem, MessageService, ConfirmationService, ConfirmEventType} from "primeng/api";
import {IUser} from "../../../models/user";
import {ROUTES} from "../../../app.routes";
import {closePanels} from "../../../helper/utils";
import {defaultDarkTheme, defaultLightTheme, defaultAvatar, defaultLogo} from "../default-ui-setting-values";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  @ViewChild('filterInput') filterInput!: ElementRef
  title: any                  // title of project
  userId!: number              // user id
  colorScheme = 'dark'     // theme mode (dark, light)
  user!: IUser                 // user information
  avatar = defaultAvatar                 // avatar image data(base64)
  logoImg = defaultLogo                // logo image data(base64)

  isSorted = false
  balance = 0;

  placeholder = "loading";

  menuItems!: MenuItem[];

  userInfo = {
    name: '',
    avatarName: '',
    email: '',
    role: 'Administrator',
  }

  ros: any[] = [];
  input_ro: any = ''
  // input_ro: any = {name: 'All', value: ALL_FILTER_VALUE}

  constructor(
    private route: Router,
    private routerdata: ActivatedRoute,
    public store: StoreService,
    private api: ApiService,
    private messageService: MessageService,
    public layoutService: LayoutService,
    private confirmationService: ConfirmationService
  ) {
    this.title = route.url

    this.title = this.title.replace(/\//g, '')
    this.title = this.title.toUpperCase()
  }

  async ngOnInit() {
    await new Promise<void>(resolve => {
      const mainUserInterval = setInterval(() => {
        if (this.store.getUser()) {
          clearInterval(mainUserInterval);
          resolve();
        }
      }, 100);
    });

    this.routerdata.data.subscribe(d => {
      this.title = d.title
      this.title = this.title.replace(/\//g, '')
      this.title = this.title.toUpperCase()
    })

    // set theme mode and logo image
    this.store.state$.subscribe(async (state) => {
      if (state.token) {
        this.userId = state.token.user_id
      }

      if (state.token && state.user && state.permissions) {
        this.user = state.user

        this.userInfo.name = this.user.first_name + ' ' + this.user.last_name
        if (this.user.first_name.length>0)
          this.userInfo.avatarName = this.user.first_name.substr(0, 1);
        if (this.user.last_name.length>0)
          this.userInfo.avatarName += this.user.last_name.substr(0, 1);
        this.userInfo.email = this.user.email

        let uiSettings = JSON.parse(state.user.ui_settings)

        // if the ui setting information of the user exists
        if (uiSettings) {
          // set custom logo image
          if (uiSettings.customLogoImg != undefined)
            this.logoImg = uiSettings.customLogoImg

          // set custom avatar
          if (uiSettings.customAvatar != undefined)
            this.avatar = uiSettings.customAvatar

          if (uiSettings.colorScheme)
            this.colorScheme = uiSettings.colorScheme
        }

        this.menuItems = [
          {
            label: 'Account Settings', icon: 'pi pi-fw pi-user-edit', routerLink: '/service/account/'
          },
          // {
          //   label: 'Account Settings', icon: 'pi pi-fw pi-cog', routerLink: '/service/user/edit/' + this.userId
          // },
          // {
          //   label: 'Billing Settings', icon: 'pi pi-fw pi-wallet', routerLink: '/service/billing/settings'
          // },
          {
            label: this.colorScheme=='dark' ? 'Light Mode' : 'Dark Mode', icon: 'pi pi-fw pi-send', command: (event) => {this.toggleMode()}
          },
          {
            separator: true
          },
          {
            label: 'Sign Out', icon: 'pi pi-fw pi-sign-out', command: (event) => { this.onSignout(); }
          },
        ];
      }
    })

    this.getRos();
    this.getContactInformation();
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  getRos = () => {
    let loggedUser_ros = this.store.getUser().ro.split(',');
    loggedUser_ros.sort();
    this.ros = loggedUser_ros.map((item, index)=>{
      return this.createData(
        item,
        index
      );
    });

    this.input_ro = this.createData(loggedUser_ros[0], 0);
    this.store.storeCurrentRo(loggedUser_ros[0]);
  }

  getContactInformation = () => {
    this.api.getContactInformationApi().subscribe(res=>{
      this.store.storeContactInformation({
        name: res.contact_name,
        number: res.contact_number,
        notes: ''
      });
    });
  }

  toggleMode() {
    this.colorScheme = this.colorScheme=='dark' ? 'light' : 'dark'

    this.menuItems = [
      {
        label: 'Account Settings', icon: 'pi pi-fw pi-user-edit', routerLink: '/service/account/'+this.userId
      },
      // {
      //   label: 'Account Settings', icon: 'pi pi-fw pi-cog', routerLink: '/service/user/edit/' + this.userId
      // },
      // {
      //   label: 'Billing Settings', icon: 'pi pi-fw pi-wallet', routerLink: '/service/billing'
      // },
      {
        label: this.colorScheme=='dark' ? 'Light Mode' : 'Dark Mode', icon: 'pi pi-fw pi-send', command: (event) => {this.toggleMode()}
      },
      {
        separator: true
      },
      {
        label: 'Sign Out', icon: 'pi pi-fw pi-sign-out', command: (event) => { this.onSignout(); }
      },
    ];

    let uiSettings = JSON.parse(this.store.getUser().ui_settings)
    if (uiSettings == null) {
      uiSettings = {}
    }

    uiSettings.colorScheme = this.colorScheme

    let dark = defaultDarkTheme
    if (uiSettings.darkTheme != undefined) {
      dark = uiSettings.darkTheme
    }

    let light = defaultLightTheme
    if (uiSettings.lightTheme != undefined) {
      light = uiSettings.lightTheme
    }

    this.applyTheme(this.colorScheme=='dark' ? dark : light)

    this.user.ui_settings = JSON.stringify(uiSettings);
    this.store.storeUser(this.user);
    try {
      //ksh
      this.api.updateUserUISettings(this.user.id, {
        ui_settings: this.user.ui_settings
      }).subscribe(res=>{

      });
    } catch (e) {
    }
  }

  applyTheme(theme: any) {
    this.layoutService.applyTheme(theme.key, theme.mode, theme.pace)
  }

  get isAdmin() {
    //return false;
    return (this.user && this.user.id==1)
  }

  /**
   * this is called when the user clicks sign out button
   */
  onSignout = () => {
    // this.api.logout()
    //   .subscribe((res: any) => {
    //     this.store.removeToken();
    //     this.store.removeUser();

    //     this.route.navigateByUrl(ROUTES.login);
    //   }, (err: any) => {
    //     this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error?.message });
    //   });

    this.store.removeCurrentRo();

    this.store.removeToken();
    this.store.removeUser();

    this.route.navigateByUrl(ROUTES.login);
  }

  /**
   * this is called when the user clicks the quick page icon
   */
  onClickQuickPage = () => {
    closePanels()
  }

  showSuccess = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: msg });
  }

  onRoChange = (event: any) => {
    let seleted_ro = event.value;

    this.confirmationService.confirm({
      message: 'You are about to change your Acting As Resp Org. Would you like to continue?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.storeCurrentRo(seleted_ro.name);
        // setTimeout(() => {
        //   location.reload();
        // }, 300)
      },
      reject: (type: any) => {
        switch(type) {
          case ConfirmEventType.REJECT:
            break;
          case ConfirmEventType.CANCEL:
            break;
        }
      }
    });
  }
}
