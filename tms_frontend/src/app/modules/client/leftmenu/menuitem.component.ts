import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {LayoutService} from "../../../services/layout/layout.service";
import {MenuService} from "../../../services/menu/menu.service";

@Component({
  selector: '[app-menuitem]',
  template: `
		<ng-container>
      <div *ngIf="root && item.hidden !== true" class="layout-menuitem-root-text" [ngClass]="{'root_link': (item.link && !item.items)}" (click)="onClickRoot($event, item.link)">{{item.label}}</div>
			<a *ngIf="(!item.link || item.items) && item.hidden !== true" [attr.href]="item.url" (click)="itemClick($event)"
			   [ngClass]="item.class" [attr.target]="item.target" tabindex="0" pRipple>
				<i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
				<span class="layout-menuitem-text">{{item.label}}</span>
				<i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items"></i>
			</a>
			<a *ngIf="(item.link && !item.items) && item.hidden !== true" (click)="itemClick($event)" [ngClass]="item.class"
        [routerLink]="item.link" routerLinkActive="active-route" [routerLinkActiveOptions]="item.routerLinkOptions||{exact: true}"
        [fragment]="item.fragment" [queryParamsHandling]="item.queryParamsHandling" [preserveFragment]="item.preserveFragment"
        [skipLocationChange]="item.skipLocationChange" [replaceUrl]="item.replaceUrl" [state]="item.state" [queryParams]="item.queryParams"
        [attr.target]="item.target" tabindex="0" pRipple
      >
				<i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
				<span class="layout-menuitem-text">{{item.label}}</span>
				<i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items"></i>
			</a>
			<ul *ngIf="item.items && item.hidden !== true" [@children]="submenuAnimation">
				<ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
					<li app-menuitem [item]="child" [index]="i" [parentKey]="key" ></li>
				</ng-template>
			</ul>
		</ng-container>
    `,
  host: {
    '[class.layout-root-menuitem]': 'root',
    '[class.active-menuitem]': 'active'
  },
  animations: [
    trigger('children', [
      state('collapsed', style({
        height: '0'
      })),
      state('expanded', style({
        height: '*'
      })),
      state('hidden', style({
        display: 'none'
      })),
      state('visible', style({
        display: 'block'
      })),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppMenuitemComponent implements OnInit, OnDestroy {

  @Input() item: any;

  @Input() index!: number;

  @Input() root!: boolean;

  @Input() parentKey!: string;

  // active = false;
  active = true;

  menuSourceSubscription: Subscription;

  menuResetSubscription: Subscription;

  key: string = "";

  constructor(public layoutService: LayoutService, private cd: ChangeDetectorRef, public router: Router, private menuService: MenuService) {
    this.menuSourceSubscription = this.menuService.menuSource$.subscribe(value => {
      Promise.resolve(null).then(() => {
        if (value.routeEvent) {
          // this.active = (value.key === this.key || value.key.startsWith(this.key + '-')) ? true : false;
        }
        else {
          if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
            // this.active = false;
          }
        }
      });
    });

    this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
      // this.active = false;
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(params => {
        if (this.item.routerLink) {
          this.updateActiveStateFromRoute();
        }
      });
  }

  ngOnInit() {
    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

    if (this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }
  }

  updateActiveStateFromRoute() {
    // let activeRoute = this.router.isActive(this.item.link, { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' });
    let activeRoute = this.router.isActive(this.item.link, true);

    if (activeRoute) {
      this.menuService.onMenuStateChange({ key: this.key, routeEvent: true });
    }
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // execute command
    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (this.item.items) {
      // this.active = !this.active;

      if (this.root && this.active) {
        this.layoutService.onOverlaySubmenuOpen();
      }
    }
    else {
      if (this.layoutService.isMobile()) {
        this.layoutService.state.staticMenuMobileActive = false;
      } else {
        this.layoutService.onMenuToggle()
      }
    }

    this.menuService.onMenuStateChange({ key: this.key });
  }

  get submenuAnimation() {
    if (this.layoutService.isDesktop() && this.layoutService.isSlim())
      return this.active ? 'hidden' : 'visible';
    else
      return this.root ? 'expanded' : (this.active ? 'expanded' : 'collapsed');
  }

  onClickRoot = (event: any, root_link: string) => {
    if(root_link != undefined) {
      this.router.navigate([root_link]);
    }
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}
