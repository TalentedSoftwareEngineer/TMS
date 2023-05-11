import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as gFunc from 'src/app/utils/utils';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import { tap } from "rxjs/operators";
import {closeEventSource, SseClient} from "angular-sse-client";
import {environment} from "../../../../environments/environment";
import moment from 'moment';
import { Table } from 'primeng/table';
import {
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_COMMON,
  SPECIFICNUM_REG_EXP,
  PHONE_NUMBER_WITH_HYPHEN_REG_EXP,
  LIMIT_SIXTY_LETTERS_REG_EXP, ROWS_PER_PAGE_OPTIONS, SUPER_ADMIN_ROLE_ID, PAGE_NO_PERMISSION_MSG, rowsPerPageOptions
} from '../../constants';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { Router } from '@angular/router';
import { IUser } from 'src/app/models/user';

@Component({
  selector: 'app-multi-dial-disconnect',
  templateUrl: './multi-dial-disconnect.component.html',
  styleUrls: ['./multi-dial-disconnect.component.scss']
})
export class MultiDialDisconnectComponent implements OnInit, OnDestroy {

  gConst = {
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_COMMON,
    SPECIFICNUM_REG_EXP,
    LIMIT_SIXTY_LETTERS_REG_EXP
  }

  @ViewChild('numbersTable') numbersTable!: Table;

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

  inputDialNumbers: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;
  inputRequestName: string = '';
  validRequestName: boolean = true;
  inputEffDateTime: any = null;
  minEffDateTime: Date = new Date();
  inputNow: boolean = false;
  inputInterDate: any = new Date(new Date().setDate(new Date().getDate() + 45));
  interDateErr: boolean = false;
  inputYesNo : boolean = false;
  inputMessage: string = '';

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  viewedResult: any;
  flagOpenModal: boolean = false;
  numberList: any[] = [];
  filterNumberList: any[] = [];
  resultTotal: number = -1;
  numberListLoading: boolean = false;
  inputNumListFilterKey: string = '';
  progressingReq: any[] = [];
  completedReq: any[] = [];

  isSuperAdmin: boolean = false;
  userOptions: any[] = [];
  selectUser: string|number = '';

  streamdata_id: string = '/'+Math.floor(Math.random()*999999);

  constructor(
    public store: StoreService,
    public api: ApiService,
    private sseClient: SseClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public router: Router
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
      this.isSuperAdmin = state.user.role_id == SUPER_ADMIN_ROLE_ID;
      this.inputRequestName = state.contactInformation.name;
    })

    if(this.store.getUser().permissions?.includes(PERMISSIONS.MULTI_DIAL_NUMBER_DISCONNECT)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }

    await this.getData();
    this.getUsersList();

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id+this.streamdata_id, { keepAlive: true }).subscribe(data => {
      if(data.page.toUpperCase()=='MND') {
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

  getData = async () => {
    this.getTotalCount();

    await this.api.getMNDData(this.sortActive, this.sortDirection, this.pageSize, this.pageIndex, this.filterValue, this.selectUser)
      .pipe(tap(async (res: any[])=>{
        res.map(u => {
          if(Boolean(this.store.getUser()?.timezone)) {
            // Timezone Time
            u.sub_dt_tm = u.sub_dt_tm ? moment(u.sub_dt_tm).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
          } else {
            // Local time
            u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('MM/DD/YYYY h:mm:ss A') : '';
          }
          u.start_eff_dt_tm = u.start_eff_dt_tm && u.start_eff_dt_tm!="NOW" ? moment(new Date(u.start_eff_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : u.start_eff_dt_tm;
        });
        this.activityLogs = res;
      })).toPromise();

    this.filterResultLength = -1;
    await this.api.getMNDCount(this.filterValue)
    .pipe(tap( res => {
      this.filterResultLength = res.count
    })).toPromise();
  }

  getTotalCount = async () => {
    this.resultsLength = -1;
    await this.api.getMNDCount('')
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

  onCsvXlUploadAuto = async (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      let file: File = event.target.files.item(0)

      const reader: FileReader = new FileReader()
      if (file.type === 'text/csv') {
        reader.readAsText(file)

        reader.onload = (e: any) => {
          const data = e.target.result;
          let arr_csvContent = String(data).split("\n");
          let phoneNumbers = arr_csvContent.filter(item=>PHONE_NUMBER_WITH_HYPHEN_REG_EXP.test(item)).map(item=>item.replace('\r', ''));
          this.inputDialNumbers = phoneNumbers.toString();
          this.onNumFieldFocusOut();
        }
      }
    }
  }

  onSubmit = () => {
    if(this.inputDialNumbers=='') {
      this.invalidNumType = INVALID_NUM_TYPE_COMMON;
      return;
    }

    this.onNumFieldFocusOut();
    if (this.invalidNumType!=INVALID_NUM_TYPE_NONE) {
      return;
    }

    let numList = gFunc.retrieveNumList(this.inputDialNumbers);
    if(numList.length>1 && !LIMIT_SIXTY_LETTERS_REG_EXP.test(this.inputRequestName)) {
      this.validRequestName = false;
      return;
    }

    if (!this.inputNow && this.inputEffDateTime==null) {
      this.showWarn("Please select Effective Date/Time.")
      return;
    }

    let effDateTime = ""
    if (this.inputEffDateTime!=null) {
      // let d = new Date(this.inputEffDateTime).getTime()
      // effDateTime = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'
      effDateTime = gFunc.fromCTTimeToUTCStr(new Date(this.inputEffDateTime));
    }

    let body: any = {
      ro: this.store.getCurrentRo(),
      numList,
      requestDesc: this.inputRequestName,
      startEffDtTm: this.inputNow ? 'NOW' : effDateTime,
      referral: this.inputYesNo ? "Y" : "N"
    }

    if (this.inputInterDate!=null)
      body.endInterceptDt = moment(new Date(this.inputInterDate)).format('YYYY-MM-DD')

    this.api.submitMND(body).subscribe(res=>{
      if(res.success)
        setTimeout(()=>{
          this.sortActive = 'sub_dt_tm'
          this.sortDirection = 'DESC'
          this.getData();
        }, 100)
    });
  }

  onClear = () => {
    this.inputDialNumbers = ""
    this.inputRequestName = ""
    this.inputEffDateTime = null
    this.inputInterDate = new Date(new Date().setDate(new Date().getDate() + 45));
    this.onNumFieldFocusOut()
  }

  onNumFieldFocusOut = () => {
    let num = this.inputDialNumbers;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
      nums = nums.filter((item, index)=>(nums.indexOf(item)===index));
      this.inputDialNumbers = nums.join(",");

      let specificNumReg = SPECIFICNUM_REG_EXP
      let isValid = true
      for (let el of nums) {
        if (!specificNumReg.test(el)) {   // if anyone among the number list is invalid, the number list is invalid.
          isValid = false
          break
        }
      }
      if (!isValid) {
        this.invalidNumType = INVALID_NUM_TYPE_COMMON;
      } else {
        this.invalidNumType = INVALID_NUM_TYPE_NONE;
      }
    } else {
      this.invalidNumType = INVALID_NUM_TYPE_NONE;
    }
  }

  onOpenViewModal = async (event: Event, result: any) => {
    this.viewedResult = result;

    await this.api.getMNDById(result.id)
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

    await this.api.getMNDById(result.id).pipe(tap((response: any[])=>{
      response.forEach((item, index) => {
        numsContent += `\n${item.num}, ${item.status==null?'':item.status}, ${item.message==null?'':item.message}`;
      });

      let data = `Number,Template,Effective Date/Time,Status,Message${numsContent}\n`
      const csvContent = 'data:text/csv;charset=utf-8,' + data;
      const url = encodeURI(csvContent);
      let fileName = 'MND_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

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
        this.api.deleteMND(id).subscribe(async res=>{
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
      let d = item.template_name?.includes(this.inputNumListFilterKey);
      if (omittedPhoneNumber=='') {
        return b || c || d;
      } else {
        return a || b || c || d;
      }
    });
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

  closeModal = () => {
    this.flagOpenModal = false;
  }

  onViewNumbersDownload = () => {
    let csvNumbersContent: string = '';
    this.filterNumberList.forEach((item, index) => {
      csvNumbersContent += `\n${item.num},${item.template_name==null?'':item.template_name},${item.eff_dt_tm==null?'':item.eff_dt_tm},${item.status==null?'':item.status},${item.message==null?'':item.message}`;
    });
    let data = `Number,Template,Effective Date,Status,Message${csvNumbersContent}\n`

    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    const url = encodeURI(csvContent);
    let fileName = 'MND_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
  }

  onEffDateTimeIntervalFifteenMin = () => {
    let d = new Date(this.inputEffDateTime).getTime();
    this.inputEffDateTime = new Date(Math.ceil(d / 900000) * 900000);
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
