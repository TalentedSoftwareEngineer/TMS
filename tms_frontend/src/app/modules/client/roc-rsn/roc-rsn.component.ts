import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { StoreService } from 'src/app/services/store/store.service';
import { tap } from "rxjs/operators";
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { PAGE_NO_PERMISSION_MSG } from '../../constants';

@Component({
  selector: 'app-roc-rsn',
  templateUrl: './roc-rsn.component.html',
  styleUrls: ['./roc-rsn.component.scss']
})
export class RocRsnComponent implements OnInit {

  entityOptions: any[] = [];
  selectEntity: string = '';

  notifications: any[] = [];
  hdi_notifications: any[] = [];

  actionType: any;

  constructor(
    public api: ApiService,
    public store: StoreService,
    public router: Router,
    private messageService: MessageService
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

    if(this.store.getUser().permissions?.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }
    
    // this.store.state$.subscribe(async (state)=> {

    // })

    this.getRespOrgEntitiesList();
    this.initState();
  }

  initState = () => {
    this.notifications = [
      {
        tfn_status: 'Pending',
        event: 'New Request',
        event_tooltip: 'Waiting for approval by losing Resp Org',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Port Processing',
        event: 'TFN approved by losing Resp Org',
        event_tooltip: 'Awaiting for API update',
        bGaining: null,
        bLosing: false
      },
      {
        tfn_status: 'Ported',
        event: 'TFN approved by losing Resp Org',
        event_tooltip: 'Losing Resp Org approved the TFN',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Ported',
        event: 'Approved by NPA nightly Sync Job',
        event_tooltip: 'TFN approved by daily sync with SMS/800',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Ported',
        event: 'Rejected by API MRO',
        event_tooltip: 'Gaining Resp Org already has ownership of the requested number',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Declined',
        event: 'TFN declined by Resp Org',
        event_tooltip: 'Losing resporg declined the request',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Declined',
        event: 'Declined by NPA nightly sync Job',
        event_tooltip: 'When New RO is not equal to NPA table Company_ID and TFN is in 0,8,9 ie OPEN',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Declined',
        event: 'Auto Declined by Submitter (16)',
        event_tooltip: 'When submitter rejects or removes a TFN from the request.',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Declined',
        event: 'When entire Request is cancelled by Submitter (16)',
        event_tooltip: 'Request is canceled by Submitter.',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Declined',
        event: 'TFN is declined when LOA attachment is not faxed in prior to Due Date of the request',
        event_tooltip: 'Overdue service declines such requests when LOA fax was not received.',
        bGaining: false,
        bLosing: null
      },
      {
        tfn_status: 'Declined',
        event: 'Missing required LOA',
        event_tooltip: 'Auto-declined by losing Resp Org due to not receiving required LOA with the new request.',
        bGaining: false,
        bLosing: null
      },
      {
        tfn_status: 'Expired',
        event: 'System expires the request post expiry date',
        event_tooltip: 'No Action is taken untill expiration date.',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Port Failed',
        event: 'Notification is sent when TFN port has failed',
        event_tooltip: 'No Action is taken untill expiration date.',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Overdue',
        event: 'Post Due Date',
        event_tooltip: 'TFN status updated from Pending to Overdue by the ROC system process.',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Due Date Approval',
        event: 'Losing Resp Org holds the processing',
        event_tooltip: '',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Gaining Resp Org adds additional document to a request via WSI',
        event: 'WSI method AddDocument() was used to attach a document',
        event_tooltip: '',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Waiting',
        event: 'Future dated request',
        event_tooltip: 'Request was marked to be processed in a future.',
        bGaining: false,
        bLosing: null
      },
    ];

    this.hdi_notifications = [
      {
        tfn_status: 'Ported',
        event: 'TFN Approved by HD',
        event_tooltip: 'Help Desk approved the TFN.',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Ported',
        event: 'Approved by nightly Sync Job',
        event_tooltip: 'TFN approved by daily file execution.',
        bGaining: false,
        bLosing: false
      },
      {
        tfn_status: 'Port Failed',
        event: 'Port Failed',
        event_tooltip: 'If RSP-MRO returned an unhandled exception.',
        bGaining: false,
        bLosing: null
      },
    ];
  }

  onChangeEntity = () => {
    this.initState();

    this.api.retrieveSubscription({
      entity: this.selectEntity
    }).subscribe(res=> {
      if(res.code != 1) {
        this.actionType = 'update'
        this.notifications = [
          {
            tfn_status: 'Pending',
            event: 'New Request',
            event_tooltip: 'Waiting for approval by losing Resp Org',
            bGaining: res.newRequest.processOutgoing == 'Y',
            bLosing: res.newRequest.processIncoming == 'Y',
          },
          {
            tfn_status: 'Port Processing',
            event: 'TFN approved by losing Resp Org',
            event_tooltip: 'Awaiting for API update',
            bGaining: null,
            bLosing: res.tfnApprovedByLosingRespOrg.processIncoming == 'Y',
          },
          {
            tfn_status: 'Ported',
            event: 'TFN approved by losing Resp Org',
            event_tooltip: 'Losing Resp Org approved the TFN',
            bGaining: res.tfnApprovedByLosingRespOrgPorted.processOutgoing == 'Y',
            bLosing: res.tfnApprovedByLosingRespOrgPorted.processIncoming == 'Y',
          },
          {
            tfn_status: 'Ported',
            event: 'Approved by NPA nightly Sync Job',
            event_tooltip: 'TFN approved by daily sync with SMS/800',
            bGaining: res.approvedByNightlySync.processOutgoing == 'Y',
            bLosing: res.approvedByNightlySync.processIncoming == 'Y'
          },
          {
            tfn_status: 'Ported',
            event: 'Rejected by API MRO',
            event_tooltip: 'Gaining Resp Org already has ownership of the requested number',
            bGaining: res.rejectedByMRO.processOutgoing == 'Y',
            bLosing: res.rejectedByMRO.processIncoming == 'Y'
          },
          {
            tfn_status: 'Declined',
            event: 'TFN declined by Resp Org',
            event_tooltip: 'Losing resporg declined the request',
            bGaining: res.tfnDeclinedByResporg.processOutgoing == 'Y',
            bLosing: res.tfnDeclinedByResporg.processIncoming == 'Y'
          },
          {
            tfn_status: 'Declined',
            event: 'Declined by NPA nightly sync Job',
            event_tooltip: 'When New RO is not equal to NPA table Company_ID and TFN is in 0,8,9 ie OPEN',
            bGaining: res.declinedByNightlySync.processOutgoing == 'Y',
            bLosing: res.declinedByNightlySync.processIncoming == 'Y'
          },
          {
            tfn_status: 'Declined',
            event: 'Auto Declined by Submitter (16)',
            event_tooltip: 'When submitter rejects or removes a TFN from the request.',
            bGaining: res.autoDeclinedBySubmitter.processOutgoing == 'Y',
            bLosing: res.autoDeclinedBySubmitter.processIncoming == 'Y'
          },
          {
            tfn_status: 'Declined',
            event: 'When entire Request is cancelled by Submitter (16)',
            event_tooltip: 'Request is canceled by Submitter.',
            bGaining: res.userCancelledRequest.processOutgoing == 'Y',
            bLosing: res.userCancelledRequest.processIncoming == 'Y'
          },
          {
            tfn_status: 'Declined',
            event: 'TFN is declined when LOA attachment is not faxed in prior to Due Date of the request',
            event_tooltip: 'Overdue service declines such requests when LOA fax was not received.',
            bGaining: res.tfnIsDeclinedLoaAttachmentMissing.processOutgoing == 'Y',
            bLosing: null
          },
          {
            tfn_status: 'Declined',
            event: 'Missing required LOA',
            event_tooltip: 'Auto-declined by losing Resp Org due to not receiving required LOA with the new request.',
            bGaining: res.missingRequiredLoa.processOutgoing == 'Y',
            bLosing: null
          },
          {
            tfn_status: 'Expired',
            event: 'System expires the request post expiry date',
            event_tooltip: 'No Action is taken untill expiration date.',
            bGaining: res.systemExpires.processOutgoing == 'Y',
            bLosing: res.systemExpires.processIncoming == 'Y'
          },
          {
            tfn_status: 'Port Failed',
            event: 'Notification is sent when TFN port has failed',
            event_tooltip: 'No Action is taken untill expiration date.',
            bGaining: res.notificationSentwhenPortFailed.processOutgoing == 'Y',
            bLosing: res.notificationSentwhenPortFailed.processIncoming == 'Y'
          },
          {
            tfn_status: 'Overdue',
            event: 'Post Due Date',
            event_tooltip: 'TFN status updated from Pending to Overdue by the ROC system process.',
            bGaining: res.postDueDate.processOutgoing == 'Y',
            bLosing: res.postDueDate.processIncoming == 'Y'
          },
          {
            tfn_status: 'Due Date Approval',
            event: 'Losing Resp Org holds the processing',
            event_tooltip: '',
            bGaining: res.losingRespOrgHolds.processOutgoing == 'Y',
            bLosing: res.losingRespOrgHolds.processIncoming == 'Y'
          },
          {
            tfn_status: 'Gaining Resp Org adds additional document to a request via WSI',
            event: 'WSI method AddDocument() was used to attach a document',
            event_tooltip: '',
            bGaining: res.wsiAddDocument.processOutgoing == 'Y',
            bLosing: res.wsiAddDocument.processIncoming == 'Y'
          },
          {
            tfn_status: 'Waiting',
            event: 'Future dated request',
            event_tooltip: 'Request was marked to be processed in a future.',
            bGaining: res.futureDatedRequest.processOutgoing == 'Y',
            bLosing: null
          },
        ];
    
        this.hdi_notifications = [
          {
            tfn_status: 'Ported',
            event: 'TFN Approved by HD',
            event_tooltip: 'Help Desk approved the TFN.',
            bGaining: res.tfnApprovedByHelpDesk.processHDIGaining == 'Y',
            bLosing: res.tfnApprovedByHelpDesk.processHDILosing == 'Y'
          },
          {
            tfn_status: 'Ported',
            event: 'Approved by nightly Sync Job',
            event_tooltip: 'TFN approved by daily file execution.',
            bGaining: res.approvedByNightlySyncHDI.processHDIGaining == 'Y',
            bLosing: res.approvedByNightlySyncHDI.processHDILosing == 'Y'
          },
          {
            tfn_status: 'Port Failed',
            event: 'Port Failed',
            event_tooltip: 'If RSP-MRO returned an unhandled exception.',
            bGaining: res.notificationSentwhenPortFailedHDI.processHDIGaining == 'Y',
            bLosing: null
          },
        ];
      } else {
        this.actionType = 'create'
      }
    });
  }

  getRespOrgEntitiesList = async () => {
    // await this.api.getRespOrgEntitiesList()
    // .pipe(tap(async (res: any[]) => {
    //   this.entityOptions = res.map(item=>({name: item.respOrgEntity, value: item.respOrgEntity}));
    //   this.selectEntity = res[0].respOrgEntity;
    // })).toPromise();

    this.entityOptions = this.store.getEntities();
    this.entityOptions.sort((firstItem: any, secondItem: any): any => {
      if(firstItem.name > secondItem.name)
        return 1;
      if(firstItem.name < secondItem.name)
        return -1;

      return 0
    });
    this.selectEntity = this.entityOptions[0].value;
  }

  onSave = () => {
    let data = {
      entity: this.selectEntity,
      newRequest: {processOutgoing: this.notifications[0].bGaining ? 'Y' : 'N', processIncoming: this.notifications[0].bLosing ? 'Y' : 'N'},
      tfnApprovedByLosingRespOrgPorted: {processOutgoing: this.notifications[2].bGaining ? 'Y' : 'N', processIncoming: this.notifications[2].bLosing ? 'Y' : 'N'},
      tfnApprovedByLosingRespOrg: {processIncoming: this.notifications[1].bLosing ? 'Y' : 'N'},
      approvedByNightlySync: {processOutgoing: this.notifications[3].bGaining ? 'Y' : 'N', processIncoming: this.notifications[3].bLosing ? 'Y' : 'N'},
      rejectedByMRO: {processOutgoing: this.notifications[4].bGaining ? 'Y' : 'N', processIncoming: this.notifications[4].bLosing ? 'Y' : 'N'},
      autoDeclinedBySubmitter: {processOutgoing: this.notifications[7].bGaining ? 'Y' : 'N', processIncoming: this.notifications[7].bLosing ? 'Y' : 'N'},
      declinedByNightlySync: {processOutgoing: this.notifications[6].bGaining ? 'Y' : 'N', processIncoming: this.notifications[6].bLosing ? 'Y' : 'N'},
      missingRequiredLoa: {processOutgoing: this.notifications[10].bGaining ? 'Y' : 'N'},
      tfnDeclinedByResporg: {processOutgoing: this.notifications[5].bGaining ? 'Y' : 'N', processIncoming: this.notifications[5].bLosing ? 'Y' : 'N'},
      tfnIsDeclinedLoaAttachmentMissing: {processOutgoing: this.notifications[9].bGaining ? 'Y' : 'N'},
      userCancelledRequest: {processOutgoing: this.notifications[8].bGaining ? 'Y' : 'N', processIncoming: this.notifications[8].bLosing ? 'Y' : 'N'},
      systemExpires: {processOutgoing: this.notifications[11].bGaining ? 'Y' : 'N', processIncoming: this.notifications[11].bLosing ? 'Y' : 'N'},
      notificationSentwhenPortFailed: {processOutgoing: this.notifications[12].bGaining ? 'Y' : 'N', processIncoming: this.notifications[12].bLosing ? 'Y' : 'N'},
      postDueDate: {processOutgoing: this.notifications[13].bGaining ? 'Y' : 'N', processIncoming: this.notifications[13].bLosing ? 'Y' : 'N'},
      losingRespOrgHolds: {processOutgoing: this.notifications[14].bGaining ? 'Y' : 'N', processIncoming: this.notifications[14].bLosing ? 'Y' : 'N'},
      wsiAddDocument: {processOutgoing: this.notifications[15].bGaining ? 'Y' : 'N', processIncoming: this.notifications[15].bLosing ? 'Y' : 'N'},
      futureDatedRequest: {processOutgoing: this.notifications[16].bGaining ? 'Y' : 'N'},
      tfnApprovedByHelpDesk: {processHDIGaining: this.hdi_notifications[0].bGaining ? 'Y' : 'N', processHDILosing: this.hdi_notifications[0].bLosing ? 'Y' : 'N'},
      approvedByNightlySyncHDI: {processHDIGaining: this.hdi_notifications[1].bGaining ? 'Y' : 'N', processHDILosing: this.hdi_notifications[1].bLosing ? 'Y' : 'N'},
      notificationSentwhenPortFailedHDI: {processHDIGaining: this.hdi_notifications[2].bGaining ? 'Y' : 'N'},
    }

    if(this.actionType == 'create') {
      this.api.createSubscription(data).subscribe(res=> {
        console.log('res', res);
      });
    } else if(this.actionType == 'update') {
      this.api.updateSubscription(data).subscribe(res=> {
        console.log('res', res);
      });
    }

    this.initState();
  }

  onCancel = () => {
    this.initState();
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
