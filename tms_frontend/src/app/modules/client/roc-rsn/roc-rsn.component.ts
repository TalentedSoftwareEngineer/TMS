import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { StoreService } from 'src/app/services/store/store.service';
import { tap } from "rxjs/operators";

@Component({
  selector: 'app-roc-rsn',
  templateUrl: './roc-rsn.component.html',
  styleUrls: ['./roc-rsn.component.scss']
})
export class RocRsnComponent implements OnInit {

  entityOptions: any[] = [];
  selectEntity: string = '';

  notifications: any[] = [];
  checkAllProcessOutgoing: boolean = false;
  checkAllProcessIncoming: boolean = false;
  selectedProcessOutgoings: any[] = [];
  selectedProcessIncomings: any[] = [];

  selectedProcessHDIGainings: any[] = [];
  selectedProcessHDILosings: any[] = [];

  constructor(
    public api: ApiService,
    public store: StoreService
  ) { }

  async ngOnInit() {
    this.getRespOrgEntitiesList();
    this.notifications = [
      {
        tfn_status: 'Pending',
        event: 'New Request',
        event_tooltip: 'Waiting for approval by losing Resp Org',
        process_outgoing: 'Process Outgoing (Gaining)',
        process_incoming: 'Process Incoming (Losing)'
      },
      {
        tfn_status: 'Port Processing',
        event: 'TFN approved by losing Resp Org',
        event_tooltip: 'Awaiting for API update	',
        process_outgoing: 'Process Outgoing (Gaining)',
        process_incoming: 'Process Incoming (Losing)'
      }
    ]
  }

  onChangeEntity = () => {

  }

  getRespOrgEntitiesList = async () => {
    try {
      await this.api.getRespOrgEntitiesList()
        .pipe(tap(async (res: any[]) => {
          this.entityOptions = res.map(item=>({name: item.respOrgEntity, value: item.respOrgEntity}));
          this.selectEntity = res[0].respOrgEntity;
        })).toPromise();
    } catch (e) {
    }
  }

  onChangeOut = () => {
    console.log('selectedProcessOutgoings', this.selectedProcessOutgoings);
  }

  onChangeIn = () => {
    console.log('selectedProcessIncomings', this.selectedProcessIncomings);
  }

  onSave = () => {

  }

  onCancel = () => {
    
  }

}
