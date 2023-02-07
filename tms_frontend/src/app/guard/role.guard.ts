import {Injectable} from '@angular/core';
import {
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  CanActivate,
  CanDeactivate
} from '@angular/router';
import {Observable} from 'rxjs';
import {pluck} from 'rxjs/operators';
import {ApiService} from "../services/api/api.service";
import {StoreService} from "../services/store/store.service";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanDeactivate<any>, CanLoad {
  private token!: string | null;

  constructor(
    private api: ApiService,
    public store: StoreService,
  ) {
    this.store.state$.pipe(
      pluck('token'),
    ).subscribe(token => this.token = (token) ? token.token : null);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const guiSection = route.data.guiSection ? route.data.guiSection : '';
    return true;
  }

  canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    // @ts-ignore
    const guiSection = route.data.guiSection ? route.data.guiSection : '';
    return true;
  }
}
