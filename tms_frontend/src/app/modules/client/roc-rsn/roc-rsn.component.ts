import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { StoreService } from 'src/app/services/store/store.service';
import { tap } from "rxjs/operators";
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

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
    public store: StoreService,
    public router: Router,
    private messageService: MessageService
  ) { }

  async ngOnInit() {
    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.RSN)) {
      } else {
        // no permission
        this.showWarn("You have no permission for this page")
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

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
  }

  onChangeIn = () => {
  }

  onSave = () => {

  }

  onCancel = () => {

  }

  showWarn = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Warning', detail: msg });
  }
  showError = (msg: string, summary: string) => {
    this.messageService.add({ key: 'tst', severity: 'error', summary: summary, detail: msg });
  }
  showSuccess = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: msg });
  };
  showInfo = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: msg });
  };

}
