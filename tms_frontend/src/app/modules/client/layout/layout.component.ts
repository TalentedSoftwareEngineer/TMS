import {Component, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {LayoutService} from "../../../services/layout/layout.service";
import {IUser, IUserToken} from "../../../models/user";
import {LeftmenuComponent} from "../leftmenu/leftmenu.component";
import {Observable, of, Subscription} from "rxjs";
import {MenuService} from "../../../services/menu/menu.service";
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {NavigationEnd, Router} from "@angular/router";
import {filter, map, mergeMap, take, tap} from "rxjs/operators";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {

  token!: IUserToken;
  activeUser!: boolean;
  observuserCache!: Observable<IUser>;
  overlayMenuOpenSubscription: Subscription;

  menuOutsideClickListener: any;
  @ViewChild(LeftmenuComponent) appSidebar!: LeftmenuComponent;

  constructor(private menuService: MenuService, public layoutService: LayoutService, public renderer: Renderer2, public router: Router, private api: ApiService, private store: StoreService) {
    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', event => {
          const isOutsideClicked = !(this.appSidebar.el.nativeElement.isSameNode(event.target) || this.appSidebar.el.nativeElement.contains(event.target)
            || event.target.classList.contains('p-trigger') || event.target.parentNode.classList.contains('p-trigger'));

          if (isOutsideClicked) {
            this.layoutService.state.profileSidebarVisible = false;
            this.layoutService.state.overlayMenuActive = false;
            this.layoutService.state.staticMenuMobileActive = false;
            this.layoutService.state.menuHoverActive = false;
            this.menuService.reset();
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
            this.unblockBodyScroll();
          }
          else {
            if (this.layoutService.state.staticMenuMobileActive) {
              this.blockBodyScroll();
            }
          }
        });
      }
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.unblockBodyScroll();
      });
  }

  ngOnInit(): void {
    const subscription = this.store.state$.pipe(
      map(state => {
        return { token: state.token, user: state.user };
      }),
      take(1),
      mergeMap(({token, user}) => {
        this.token = token;
        this.activeUser = !!user;
        if ((!!this.token && !this.activeUser) || !this.observuserCache ) {
          this.observuserCache = this.api.retrieveLoggedUserOb(this.token)
          //return this.observuserCache;
        }
        //else {
        //  return throwError(new Error('Cached user -- No need to retrieve Logged User'));
        //}
        return this.observuserCache;
      }),
      mergeMap((curUser: any) => {
        let result = of([]);
        return result.pipe(tap(res => this.store.setPermissions(curUser.permissions)));
      }),
    );

    subscription.subscribe((_) => {
      // TODO - apply user's ui settings
    }, error => {
    });
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    }
    else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    }
    else {
      document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
        'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  get containerClass() {
    return {
      'layout-theme-light': this.layoutService.config.colorScheme === 'light',
      'layout-theme-dark': this.layoutService.config.colorScheme === 'dark',
      'layout-overlay': this.layoutService.config.menuMode === 'overlay',
      'layout-static': this.layoutService.config.menuMode === 'static',
      'layout-slim': this.layoutService.config.menuMode === 'slim',
      'layout-horizontal': this.layoutService.config.menuMode === 'horizontal',
      'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive && this.layoutService.config.menuMode === 'static',
      'layout-overlay-active': this.layoutService.state.overlayMenuActive,
      'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
      'p-input-filled': this.layoutService.config.inputStyle === 'filled',
      'p-ripple-disabled': !this.layoutService.config.ripple
    }
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
