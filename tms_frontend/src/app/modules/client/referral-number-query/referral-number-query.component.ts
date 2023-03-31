import { Component, OnInit, ViewChild } from '@angular/core';
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
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { IUser } from 'src/app/models/user';

@Component({
  selector: 'app-referral-number-query',
  templateUrl: './referral-number-query.component.html',
  styleUrls: ['./referral-number-query.component.scss']
})
export class ReferralNumberQueryComponent implements OnInit {

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

  inputTollFreeNumber: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;

  results: any[] = [];
  resultLoading: boolean = false;

  progressingReq: any[] = [];
  completedReq: any[] = [];

  viewedResult: any;

  flagOpenModal: boolean = false;
  numberList: any[] = [];
  filterNumberList: any[] = [];
  inputNumListFilterKey: string = '';
  resultTotal: number = -1;
  numberListLoading: boolean = false;

  csvNumbersContent: string = '';

  isSuperAdmin: boolean = false;
  userOptions: any[] = [];
  selectUser: string|number = '';

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
      if(state.user.permissions?.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }

      this.isSuperAdmin = state.user.role_id == SUPER_ADMIN_ROLE_ID;
    })

    await this.getData();
    this.getUsersList();

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id, { keepAlive: true }).subscribe(data => {
      if(data.page.toUpperCase()=='TRQ') {
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
          this.inputTollFreeNumber = phoneNumbers.toString();
          this.onNumFieldFocusOut();
        }
      }
    }
  }

  getData = async () => {
    this.getTotalCount();

    await this.api.getTrqData(this.sortActive, this.sortDirection, this.pageSize, this.pageIndex, this.filterValue, this.selectUser)
      .pipe(tap(async (res: any[])=>{
        res.map(u => u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : '');
        this.results = res;
      })).toPromise();

    this.filterResultLength = -1;
    await this.api.getTrqCount(this.filterValue)
    .pipe(tap( res => {
      this.filterResultLength = res.count
    })).toPromise();
  }

  getTotalCount = async () => {
    this.resultsLength = -1;
    await this.api.getTrqCount('')
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

  onRetrieve = () => {
    if(this.inputTollFreeNumber=='') {
      this.invalidNumType = INVALID_NUM_TYPE_COMMON;
      return;
    }

    this.onNumFieldFocusOut();
    if (this.invalidNumType!=INVALID_NUM_TYPE_NONE) {
      return;
    }

    let numList = gFunc.retrieveNumList(this.inputTollFreeNumber);
    let body = {
      ro: this.store.getCurrentRo(),
      numList,
    }

    this.api.retrieveTrq(body).subscribe(res=>{
      if(res.success) {
        setTimeout(()=>{
          this.sortActive = 'sub_dt_tm'
          this.sortDirection = 'DESC'
          this.getData();
        }, 100)
      }
    });
  }

  onNumFieldFocusOut = () => {
    let num = this.inputTollFreeNumber;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
      this.inputTollFreeNumber = nums.join(",");

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

  onOpenViewModal = async (event: Event, result: any) => {
    this.csvNumbersContent = '';
    this.viewedResult = result;

    await this.api.getTrqById(result.id)
      .pipe(tap((response: any[])=>{
        response.map(u => {
          u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '';
        });

        this.numberList = response;
        response.forEach((item, index) => {
          this.csvNumbersContent += `\n${item.num},${item.resp_org_id==null?'':item.resp_org_id},${item.ref_num==null?'':item.ref_num},${item.resp_org_name==null?'':item.resp_org_name.replace(/,/g, ' ')},${item.message==null?'':item.message}`;
        });

        this.filterNumberList = this.numberList;
        this.inputNumListFilterKey = '';
        this.onInputNumListFilterKey();
        this.flagOpenModal = true;
        this.resultTotal = this.numberList.length
      })).toPromise();
  }

  onDownloadCsv = async (event: Event, result: any) => {
    let numsContent = '';

    await this.api.getTrqById(result.id).pipe(tap((response: any[])=>{
      response.map(u => u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '');

      response.forEach((item, index) => {
        numsContent += `\n${item.num},${item.resp_org_id==null?'':item.resp_org_id},${item.ref_num==null?'':item.ref_num},${item.resp_org_name==null?'':item.resp_org_name.replace(/,/g, ' ')},${item.message==null?'':item.message}`;
      });

      let data = `Toll-Free Number,Resp Org,Trouble Ref,Resp Org Name,Message${numsContent}\n`
      const csvContent = 'data:text/csv;charset=utf-8,' + data;
      const url = encodeURI(csvContent);
      let fileName = 'TRQ_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', fileName);
      tempLink.click();
    })).toPromise();
  }

  onViewNumbersDownload = () => {
    let data = `Toll-Free Number,Resp Org,Trouble Ref,Resp Org Name,Message${this.csvNumbersContent}\n`

    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    const url = encodeURI(csvContent);
    let fileName = 'TRQ_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
  }

  delete = (event: Event, id: string) => {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteTrq(id).subscribe(async res=>{
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
    this.numbersTable.filterGlobal(this.inputNumListFilterKey.replace(/\W/g, ''), 'contains');
  }

  closeModal = () => {
    this.flagOpenModal = false;
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
