import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {IUser, IUserToken} from "../../models/user";
import {TMSUserType} from "../../modules/constants";
import { GuiVisibility } from '../../models/gui';

export const DBKEYS = {THEME: 'tYp95ymECHOESt', TOKEN: 'tYp95ymECHOESk', CURRENT_RO: ''};

export type IAppTheme = 'theme-light' | 'theme-dark';

export interface IContactInformation {
  name: string,
  number: string,
  notes: string,
}
export interface AppState {
  user: IUser;
  token: IUserToken;
  theme: IAppTheme;
  password: string;
  isMobile: boolean;
  isLoginFailed: boolean;
  permissions: [];
  guiVisibility: GuiVisibility[];
  userType: TMSUserType;
  currentRo: string|undefined;
  openContactInformationModal: boolean;
  contactInformation: IContactInformation;
  cadState: any;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private localdb: Storage = window.localStorage;

  // Initial state in BehaviorSubject's constructor
  private readonly subject!: BehaviorSubject<AppState>;

  // Shared Customer Balance State
  private balance: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // Exposed observable$ store stream
  readonly state$: Observable<AppState>;

  // Getter of the last store value emitted
  private get store(): AppState {
    return this.subject.getValue();
  }

  // Push new state into the observable
  private set store(val: AppState) {
    this.subject.next(val);
  }

  private set themeMode(theme: IAppTheme) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme);
  }

  private get themeMode(): IAppTheme {
    if (document.body.classList.contains('theme-dark'))
      return 'theme-dark';
    return 'theme-light';
  }

  private filterSubject = new Subject<any>();
  filterObservable$ = this.filterSubject.asObservable();

  constructor(private breakpointsObs: BreakpointObserver) {
    // @ts-ignore
    const token = JSON.parse(this.localdb.getItem(DBKEYS.TOKEN)) as IUserToken || null;
    const theme = (this.localdb.getItem(DBKEYS.THEME) as IAppTheme);

    if (theme) this.themeMode = theme;

    this.subject = new BehaviorSubject<AppState>({
      // @ts-ignore
      user: null,
      theme,
      token,
      // @ts-ignore
      password: null,
      isMobile: false,
      isLoginFailed: false,
      permissions: [],
      guiVisibility: [],
      currentRo: '',
      openContactInformationModal: false,
      contactInformation: {name: '', number: '', notes: ''}
    });
    this.state$ = this.subject.asObservable();

    breakpointsObs.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      this.storeIsMobile(result.matches);
    });
  }

  public toggleTheme(theme: IAppTheme): IAppTheme {
    this.themeMode = theme;
    this.localdb.setItem(DBKEYS.THEME, theme);
    this.store = { ...this.store, theme };
    return theme;
  }

  public retrieveTokenId(): string {
    // @ts-ignore
    const userToken = JSON.parse(this.localdb.getItem(DBKEYS.TOKEN)) as IUserToken;
    if (userToken == null) {
      return '';
    }
    return userToken.token;
  }

  public storeToken(token: IUserToken) {
    this.localdb.setItem(DBKEYS.TOKEN, JSON.stringify(token));
    this.store = {...this.store, token};
  }

  public removeToken() {
    this.localdb.removeItem(DBKEYS.TOKEN);
    // @ts-ignore
    this.store = {...this.store, token: null};
  }

  public removeUser() {
    // @ts-ignore
    this.store = {...this.store, user: null, guiVisibility: null, userType: TMSUserType.normalUser};
  }

  public storeUser(user: IUser) {
    this.store = { ...this.store, user };
  }

  public getUser() {
    return this.store.user
  }

  public getPassword() {
    return this.store.password
  }

  public storePassword(password: string) {
    this.store = {...this.store, password};
  }

  public storeIsMobile(isMobile: boolean) {
    this.store = {...this.store, isMobile};
  }

  public setIsLoginFailed(isLoginFailed: boolean) {
    this.store = { ...this.store, isLoginFailed: isLoginFailed }
  }

  public setPermissions(permissions: []) {
    this.store = { ...this.store, permissions: permissions }
  }

  public getPermissions() {
    return this.store.permissions;
  }

  public getGuiVisibility() {
    return this.store.guiVisibility
  }

  public getUserType() {
    return this.store.userType
  }

  public storeCurrentRo(currentRo: string) {
    this.localdb.setItem(DBKEYS.CURRENT_RO, currentRo);
    this.store = {...this.store, currentRo};
  }

  public getCurrentRo() {
    return this.store.currentRo
  }

  public getEntities() {
    let entities: any = [];
    this.store.user.ro.split(',').map(item=>(item.slice(0, 2))).forEach(item=>{
      if(!Boolean(entities.find((finded: any)=>finded.value==item)))
        entities.push({name: item, value: item});
    });
    return entities;
  }

  public removeCurrentRo() {
    this.localdb.removeItem(DBKEYS.CURRENT_RO);
    this.store = {...this.store, currentRo: undefined};
  }

  public storeContactInformation(contactInformation: IContactInformation) {
    this.store = {...this.store, contactInformation};
  }

  public getContactInformation() {
    return this.store.contactInformation;
  }

  public storeCadState(cadState: any) {
    this.store = {...this.store, cadState};
  }

  public getCadState() {
    return this.store.cadState;
  }

}
