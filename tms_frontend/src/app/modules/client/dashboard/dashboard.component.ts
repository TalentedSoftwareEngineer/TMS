import { Component, OnInit } from '@angular/core';
import { tap } from "rxjs/operators";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { SUPER_ADMIN_ID } from '../../constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  editNewsEvent: string = '';
  isSuperAdmin: boolean = false;

  isNewsEventEditing: boolean = false;

  constructor(
    public api: ApiService,
    public store: StoreService,
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

    this.isSuperAdmin = this.store.getUser().id == SUPER_ADMIN_ID;
    this.getConfigNewsEvent();
  }

  getConfigNewsEvent = async () => {
    await this.api.getConfigNewsEvent().pipe(tap(res=>{
      console.log('res', res);
      this.editNewsEvent = res.news_event;
    })).toPromise();
  }

  onEditNewsEvent = async () => {
    await this.api.updateConfigNewsEvent({
      value: this.editNewsEvent
    }).pipe(tap(res=>{
      console.log('res', res);
    })).toPromise();
  }

}
