import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService, ConfirmEventType, MessageService} from 'primeng/api';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/store/store.service';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { tap } from "rxjs/operators";
import { ApiService } from 'src/app/services/api/api.service';
import {
  OCA_NUM_TYPE_RANDOM,
  OCA_NUM_TYPE_WILDCARD,
  WILDCARDNUM_REG_EXP,
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_WILDCARD,
  TFNPA_WILDCAD_REG_EXP,
  INVALID_NUM_TYPE_COMMON,
  INVALID_NUM_TYPE_NPA,
  INVALID_NUM_TYPE_CONS,
  INVALID_NUM_TYPE_AMP,
  OCA_NUM_TYPE_SPECIFIC,
  SPECIFICNUM_REG_EXP,
  SVC_ORDR_NUM_REG_EXP,
  TIME_REG_EXP, 
  ROWS_PER_PAGE_OPTIONS, 
  SUPER_ADMIN_ROLE_ID, 
  PAGE_NO_PERMISSION_MSG, 
  rowsPerPageOptions,
  RECORD_PAGE_ACTION_CREATE
} from '../../constants';
import {Table} from "primeng/table";
import moment from "moment";
import {closeEventSource, SseClient} from "angular-sse-client";
import {environment} from "../../../../environments/environment";
import { IUser } from 'src/app/models/user';
import * as gFunc from 'src/app/utils/utils';
import Cookies from "universal-cookie";

@Component({
  selector: 'app-reserved-number-list',
  templateUrl: './reserved-number-list.component.html',
  styleUrls: ['./reserved-number-list.component.scss']
})
export class ReservedNumberListComponent implements OnInit, OnDestroy {

  gConst = {
    OCA_NUM_TYPE_RANDOM,
    OCA_NUM_TYPE_WILDCARD,
    WILDCARDNUM_REG_EXP,
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_WILDCARD,
    TFNPA_WILDCAD_REG_EXP,
    INVALID_NUM_TYPE_COMMON,
    INVALID_NUM_TYPE_NPA,
    INVALID_NUM_TYPE_CONS,
    INVALID_NUM_TYPE_AMP,
    OCA_NUM_TYPE_SPECIFIC,
    SPECIFICNUM_REG_EXP,
    SVC_ORDR_NUM_REG_EXP,
    TIME_REG_EXP,
    RECORD_PAGE_ACTION_CREATE
  }

  @ViewChild('reservedNumberListTable') reservedNumberListTable!: Table;

  //Reserved Number List Table
  reservedNumbers: any[] = [];
  selectedReservedNumbers: any[] = [];
  reservedNumberListLoading: boolean = false;

  flagOpenActivateModal: boolean = false;
  templates: any[] = [];
  inputTemplate: any;
  inputServiceOrderNum: string = '';
  validSvcOrdrNum: boolean = true;
  inputNumTermLine: string = '';
  validNumTermLine: boolean = true;
  inputEffDate: any = null;
  validEffDate: boolean = true;
  minEffDate: Date = new Date();
  inputNow: boolean = false;


  pageSize = 10;
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sortActive = 'sub_dt_tm'
  sortDirection = 'DESC'
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any = rowsPerPageOptions

  progressingReq: any[] = [];
  completedReq: any[] = [];

  viewedResult: any;

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  @ViewChild('numbersTable') numbersTable!: Table;

  flagOpenModal: boolean = false;
  numberList: any[] = [];
  filterNumberList: any[] = [];
  inputNumListFilterKey: string = '';
  resultTotal: number = -1;
  numberListLoading: boolean = false;

  isSuperAdmin: boolean = false;
  userOptions: any[] = [];
  selectUser: string|number = '';

  streamdata_id: string = '/'+Math.floor(Math.random()*999999);

  constructor(
    private store: StoreService,
    private sseClient: SseClient,
    private confirmationService: ConfirmationService,
    public router: Router,
    private messageService: MessageService,
    private api: ApiService
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

    this.store.state$.subscribe(async (state)=> {
      if(state.user?.permissions?.includes(PERMISSIONS.RESERVE_NUMBER_LIST)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }

      this.isSuperAdmin = state.user.role_id == SUPER_ADMIN_ROLE_ID;
    })

    this.getTemplate()
    await this.getReservedNumberList();

    await this.getData();
    this.getUsersList();

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id+this.streamdata_id, { keepAlive: true }).subscribe(data => {
      if(data.page=='MNA') {
        if(data.status.toUpperCase()=='IN PROGRESS') {
          let progressingReqIndex = this.progressingReq.findIndex(req=>req.req.id==data.req.id);
          if(progressingReqIndex==-1) {
            this.progressingReq.push(data);
          } else {
            this.progressingReq.splice(progressingReqIndex, 1, data);
          }
        } else {
          if(data.total == data.failed + data.completed) {
            // Remove progressingReq Item
            let progressingReqIndex = this.progressingReq.findIndex(req=>req.req.id==data.req.id);
            if(progressingReqIndex != -1) {
              this.progressingReq.splice(progressingReqIndex, 1);
            }
            //Add completedReq Item
            let completedReqItem = this.completedReq.find(req=>req.req.id==data.req.id);
            if(completedReqItem==undefined) {
              this.completedReq.push(data);
            }
            // Alert
            if(data.completed==0) {
              this.showError(`${data.req.message.slice(0, 69)}`, `Failed`);
            } else if(data.failed==0) {
              this.showSuccess('Success!');
            } else {
              this.showInfo('Completed!');
            }
          }
        }
      }
    })
  }

  ngOnDestroy(): void {
    closeEventSource(environment.stream_uri+"/"+this.store.getUser()?.id+this.streamdata_id)
  }

  async getTemplate() {
    await this.api.getTemplateList(this.store.getCurrentRo()!, '')
      .pipe(tap( res => {
        // this.templates = [ { tmplName:"" }]
        this.templates = this.templates.concat(res)
      })).toPromise();
  }

  async getReservedNumberList() {
    await this.api.getReservedNumberList(this.store.getCurrentRo()!)
      .pipe(tap( res => {
        this.reservedNumbers = [ ]
        this.reservedNumbers = this.reservedNumbers.concat(res)
      })).toPromise();
  }

  onInputReservedNumListFilterKey(event: any) {
    let query = event.target.value
    this.reservedNumberListTable.filterGlobal(query.replace(/\W/g, ''), 'contains');
  }

  /**
   * this is called when the focus of date field is lost
   */
  onDateFieldFocusOut = () => {
    let effDate = this.inputEffDate;
    if (this.inputNow || effDate !== null)
      this.validEffDate = true;
    else
      this.validEffDate = false;
  }

  /**
   * this is called when the focus of numTermLine field is lost
   */
  onNumTermLineFieldFocusOut = () => {
    let line = this.inputNumTermLine;
    let lineReg = /\d{1-4}/g

    if (!lineReg.test(line)) {
      if (parseInt(line)>0)
        this.validNumTermLine = true;
      else
        this.validNumTermLine = false;
    } else {
      this.validNumTermLine = false;
    }
  }

    /**
   * this is called when the focus of service order field is lost
   */
  onSvcOrderFieldFocusOut = () => {
    let svcOrdrNumReg = this.gConst.SVC_ORDR_NUM_REG_EXP
    if (this.inputServiceOrderNum != null && !svcOrdrNumReg.test(this.inputServiceOrderNum)) {
      this.validSvcOrdrNum = false;
    } else {
      this.validSvcOrdrNum = true;
    }
  }

  onSpare = () => {
    let selected =  ""
    this.selectedReservedNumbers.forEach((item) => {
      selected += item.num + ","
    })
    selected = selected.substring(0, selected.length-1)
    this.router.navigateByUrl(`${ROUTES.sysAutoAdmin.multiDialNumSpare}?numbers=${selected}`);
  }

  onActivate = () => {
    this.flagOpenActivateModal = true;
  }

  closeActivateModal = () => {
    this.clearActiveModalInputs();
    this.flagOpenActivateModal = false;
  }

  onModalActivate = () => {
    this.onNumTermLineFieldFocusOut()
    this.onSvcOrderFieldFocusOut()
    this.onDateFieldFocusOut()

    if (!this.validSvcOrdrNum || !this.validNumTermLine || !this.validEffDate)
      return

    if (this.store.getContactInformation()?.name === "" || this.store.getContactInformation()?.number === "") {
      this.showWarn("Please input Contact Information")
      return;
    }

    if (this.inputTemplate==null || this.inputTemplate.tmplName==null) {
      this.showWarn("Please select template")
      return;
    }

    // form is valid
    let body: any = {
      ro: this.store.getCurrentRo(),
      numList: [],
      templateName: this.inputTemplate.tmplName,
      serviceOrder: this.inputServiceOrderNum,
      numTermLine: Number(this.inputNumTermLine),
      contactName: this.store.getContactInformation()?.name,
      contactNumber: this.store.getContactInformation()?.number.replace(/\-/g, ""),
    }

    this.selectedReservedNumbers.forEach((item) => {
      body.numList.push(item.num)
    })

    let effDateTime = ""
    if (this.inputNow)
      effDateTime = "NOW"
    else if (this.inputEffDate!=null) {
      // let d = new Date(this.inputEffDate).getTime()
      // effDateTime = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'
      effDateTime = gFunc.fromCTTimeToUTCStr(new Date(this.inputEffDate))
    }

    body.effDtTm = effDateTime
    console.log(body)

    this.api.submitMna(body).subscribe(res=>{
      if(res.success)
        this.onModalCancel()

        setTimeout(()=>{
          this.sortActive = 'sub_dt_tm'
          this.sortDirection = 'DESC'
          this.getData();
        }, 100)
    });
  }

  onModalCancel = () => {
    this.closeActivateModal()
  }

  clearActiveModalInputs = () => {
    this.inputTemplate = '';
    this.inputServiceOrderNum = '';
    this.validSvcOrdrNum = true;
    this.inputNumTermLine = '';
    this.validNumTermLine = true;
    this.inputEffDate = null;
    this.validEffDate = true;
    this.inputNow = false;
  }

  getData = async () => {
    this.getTotalCount();

    await this.api.getMnaData(this.sortActive, this.sortDirection, this.pageSize, this.pageIndex, this.filterValue, this.selectUser)
      .pipe(tap(async (res: any[])=>{
        res.map(u => {
          if(Boolean(this.store.getUser()?.timezone)) {
            // Timezone Time
            u.sub_dt_tm = u.sub_dt_tm ? moment(u.sub_dt_tm).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
          } else {
            // Local time
            u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('MM/DD/YYYY h:mm:ss A') : '';
          }
        });
        this.activityLogs = res;
      })).toPromise();

    this.filterResultLength = -1;
    await this.api.getMnaCount(this.filterValue)
      .pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
  }

  getTotalCount = async () => {
    this.resultsLength = -1;
    await this.api.getMnaCount('')
      .pipe(tap( res => {
        this.resultsLength = res.count
      })).toPromise();
  }

  getUsersList = async () => {
    try {
      await this.api.getUsersListForFilter()
        .pipe(tap(async (res: IUser[]) => {
          this.userOptions = [{name: 'All', value: ''}, ...res.map(item=>({name: item.username, value: item.id}))];
        })).toPromise();
    } catch (e) {
    }
  }

  onOpenViewModal = async (event: Event, result: any) => {
    this.viewedResult = result;

    await this.api.getMnaById(result.id)
      .pipe(tap((response: any[])=>{
        response.map(u => {
          if(Boolean(this.store.getUser()?.timezone)) {
            // Timezone Time
            u.updated_at = u.updated_at ? moment(u.updated_at).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
          } else {
            // Local time
            u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('MM/DD/YYYY h:mm:ss A') : '';
          }
          u.eff_dt_tm = u.eff_dt_tm ? gFunc.fromUTCStrToCTStr(u.eff_dt_tm) : '';
        });

        this.numberList = response;

        this.filterNumberList = this.numberList;
        this.inputNumListFilterKey = '';
        this.onInputNumListFilterKey();
        this.flagOpenModal = true;
        this.resultTotal = this.numberList.length
      })).toPromise();
  }

  onDownloadCsv = async (event: Event, result: any) => {
    let numsContent = '';

    await this.api.getMnaById(result.id).pipe(tap((response: any[])=>{
      response.map(u => {
        if(Boolean(this.store.getUser()?.timezone)) {
          // Timezone Time
          u.updated_at = u.updated_at ? moment(u.updated_at).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
        } else {
          // Local time
          u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('MM/DD/YYYY h:mm:ss A') : '';
        }
        u.eff_dt_tm = u.eff_dt_tm ? gFunc.fromUTCStrToCTStr(u.eff_dt_tm) : '';
      });

      response.forEach((item, index) => {
        numsContent += `\n${item.num},${item.eff_dt_tm==null?'':item.eff_dt_tm},${item.status},${item.message==null?'':item.message}`;
      });

      let data = `Number,Effective Date/Time,Status,Message${numsContent}\n`
      const csvContent = 'data:text/csv;charset=utf-8,' + data;
      const url = encodeURI(csvContent);
      let fileName = 'MNA_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', fileName);
      tempLink.click();
    })).toPromise();
  }

  delete = (event: Event, id: string) => {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteMna(id).subscribe(async res=>{
          this.showSuccess('Successfully deleted!');
          await this.getData();
        });
      },
      reject: (type: any) => {
        switch(type) {
          case ConfirmEventType.REJECT:
            // this.showInfo('Rejected');
            break;
          case ConfirmEventType.CANCEL:
            // this.showInfo('Cancelled');
            break;
        }
      }
    });
  }

  onInputNumListFilterKey = () => {
    // this.numbersTable.filterGlobal(this.inputNumListFilterKey.replace(/\W/g, ''), 'contains');
    let omittedPhoneNumber = this.inputNumListFilterKey.replace(/\D/g, '');
    this.filterNumberList = this.numberList.filter(item=>{
      let a = item.num?.includes(omittedPhoneNumber);
      let b = item.status?.includes(this.inputNumListFilterKey);
      let c = item.message?.includes(this.inputNumListFilterKey);
      if (omittedPhoneNumber=='') {
        return b || c;
      } else {
        return a || b || c;
      }
    });
  }

  closeModal = () => {
    this.flagOpenModal = false;
  }

  getStatusTagColor = (result: any): string => {
    let status = this.getStatus(result).toUpperCase();
    switch(status) {
      case 'FAILED':
        return 'danger';
      case 'COMPLETED':
        return 'info';
      case 'SUCCESS':
        return 'success';
      default:
        return 'success';
    }
  }

  isProgressing = (result: any) => (this.progressingReq.findIndex(req=>req.req.id==result.id)!=-1 || this.getStatus(result)=='IN PROGRESS');

  getCompletedTagColor = (result: any): string => {
    let completed = this.getCompleted(result);
    if(completed==result.total) {
      return 'success';
    } else if(completed==0) {
      return 'danger';
    } else {
      return 'info';
    }
  }

  getCompleted = (result: any) => {
    let completedReqItem = this.completedReq.find(req=>req.req.id==result.id);
    let progressingReqItem = this.progressingReq.find(req=>req.req.id==result.id);
    if(progressingReqItem!=undefined) {
      return progressingReqItem.req.completed;
    } else if(completedReqItem!=undefined) {
      return completedReqItem.req.completed;
    } else {
      return result.completed;
    }
  }

  getStatus = (result: any) => {
    let completedReqItem = this.completedReq.find(req=>req.req.id==result.id);
    let progressingReqItem = this.progressingReq.find(req=>req.req.id==result.id);
    if(progressingReqItem!=undefined) {
      return progressingReqItem.req.status;
    } else if(completedReqItem!=undefined) {
      return completedReqItem.req.status;
    } else {
      return result.status;
    }
  }

  getMessage = (result: any) => {
    let completedReqItem = this.completedReq.find(req=>req.req.id==result.id);
    let progressingReqItem = this.progressingReq.find(req=>req.req.id==result.id);
    if(progressingReqItem!=undefined) {
      return progressingReqItem.req.message?.slice(0, 69);
    } else if(completedReqItem!=undefined) {
      return completedReqItem.req.message?.slice(0, 69);
    } else {
      return result.message?.slice(0, 69);
    }
  }

  onEffDateIntervalFifteenMin = () => {
    let d = new Date(this.inputEffDate).getTime();
    this.inputEffDate = new Date(Math.ceil(d / 900000) * 900000);
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getData();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getData()
  };

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getData();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1, event.rows);
  }

  onViewNumbersDownload = () => {
    let numbersContent = '';
    this.filterNumberList.forEach((item, index) => {
      numbersContent += `\n${item.num},${item.eff_dt_tm==null?'':item.eff_dt_tm},${item.status},${item.message==null?'':item.message}`;
    });
    let data = `Number,Effective Date/Time,Status,Message${numbersContent}\n`

    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    const url = encodeURI(csvContent);
    let fileName = 'MNA_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
  }

  createCAD = (num: string) => {
    const cookies = new Cookies();
    cookies.set("cusNum", num);
    cookies.set("action", this.gConst.RECORD_PAGE_ACTION_CREATE)
    this.router.navigateByUrl(ROUTES.customerAdmin.cad)
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
