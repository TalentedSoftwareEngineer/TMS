import {Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/store/store.service';
import { PERMISSIONS } from 'src/app/consts/permissions';
import {ConfirmationService, ConfirmEventType, MessageService} from 'primeng/api';
import { ROUTES } from 'src/app/app.routes';
import * as gFunc from 'src/app/utils/utils';
import {
  TMPL_ERR_TYPE,
  INVALID_NUM_TYPE_COMMON,
  INVALID_NUM_TYPE_NONE,
  SPECIFICNUM_REG_EXP, TEMPLATE_NAME_REG_EXP,
  PHONE_NUMBER_WITH_HYPHEN_REG_EXP, ROWS_PER_PAGE_OPTIONS, LIMIT_SIXTY_LETTERS_REG_EXP
} from '../../constants';
import {environment} from "../../../../environments/environment";
import {ApiService} from "../../../services/api/api.service";
import {SseClient} from "angular-sse-client";
import {tap} from "rxjs/operators";
import moment from "moment";
import {Table} from "primeng/table";

@Component({
  selector: 'app-multi-conversion-pointer-record',
  templateUrl: './multi-conversion-pointer-record.component.html',
  styleUrls: ['./multi-conversion-pointer-record.component.scss']
})
export class MultiConversionPointerRecordComponent implements OnInit {
  gConst = {
    TMPL_ERR_TYPE,
    INVALID_NUM_TYPE_COMMON,
    INVALID_NUM_TYPE_NONE,
    PHONE_NUMBER_WITH_HYPHEN_REG_EXP,
    TEMPLATE_NAME_REG_EXP,
  }

  inputDialNumbers: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;
  inputTemplateName: string = '';
  tmplErrType: string = this.gConst.TMPL_ERR_TYPE.NONE;
  inputRequestName: string = '';
  validRequestName: boolean = true;
  inputEffDateTime: Date|null = null;
  minEffDateTime: Date = new Date();
  effDateErr: boolean = false;
  inputNow: boolean = false;
  inputMessage: string = '';

  pageSize = 10;
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sortActive = 'sub_dt_tm'
  sortDirection = 'DESC'
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any = ROWS_PER_PAGE_OPTIONS

  progressingReq: any[] = [];
  completedReq: any[] = [];

  viewedResult: any;
  csvNumbersContent: string = '';

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  @ViewChild('numbersTable') numbersTable!: Table;

  flagOpenModal: boolean = false;
  numberList: any[] = [];
  filterNumberList: any[] = [];
  inputNumListFilterKey: string = '';
  resultTotal: number = -1;
  numberListLoading: boolean = false;

  constructor(
    public store: StoreService,
    public api: ApiService,
    private sseClient: SseClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public router: Router,
  ) { }

  async ngOnInit() {
    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.MCP)) {
      } else {
        // no permission
        this.showWarn("You have no permission for this page")
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

    this.getData();

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id, { keepAlive: true }).subscribe(data => {
      if(data.page=='MCP') {
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

  getData = async () => {
    await this.api.getMcpData(this.sortActive, this.sortDirection, this.pageSize, this.pageIndex, this.filterValue)
      .pipe(tap(async (res: any[])=>{
        res.map(u => u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : '');
        this.activityLogs = res;
      })).toPromise();

    this.getTotalCount();

    this.filterResultLength = -1;
    await this.api.getMcpCount(this.filterValue)
      .pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
  }

  getTotalCount = async () => {
    this.resultsLength = -1;
    await this.api.getMcpCount('')
      .pipe(tap( res => {
        this.resultsLength = res.count
      })).toPromise();
  }

  onNumFieldFocusOut = () => {
    let num = this.inputDialNumbers;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
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

  onCsvXlUploadAuto = (event: any) => {
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

  onInputTemplateName = () => {
    this.tmplErrType = this.gConst.TMPL_ERR_TYPE.NONE;
  }

  onOpenViewModal = async (event: Event, result: any) => {
    this.csvNumbersContent = '';
    this.viewedResult = result;
    this.resultTotal = parseInt(result.completed);

    await this.api.getMcpById(result.id)
      .pipe(tap((response: any[])=>{
        // response.map(u => u.eff_dt = u.eff_dt ? moment(new Date(u.eff_dt)).format('YYYY/MM/DD h:mm:ss A') : '');
        // response.map(u => u.last_act_dt = u.last_act_dt ? moment(new Date(u.last_act_dt)).format('YYYY/MM/DD h:mm:ss A') : '');
        // response.map(u => u.res_until_dt = u.res_until_dt ? moment(new Date(u.res_until_dt)).format('YYYY/MM/DD h:mm:ss A') : '');
        // response.map(u => u.disc_until_dt = u.disc_until_dt ? moment(new Date(u.disc_until_dt)).format('YYYY/MM/DD h:mm:ss A') : '');

        this.numberList = response;
        response.forEach((item, index) => {
          this.csvNumbersContent += `\n${item.num},${item.status},${item.message==null?'':item.message}`;
        });

        this.filterNumberList = this.numberList;
        this.inputNumListFilterKey = '';
        this.onInputNumListFilterKey();
        this.flagOpenModal = true;
      })).toPromise();
  }

  onDownloadCsv = async (event: Event, result: any) => {
    let numsContent = '';

    await this.api.getMcpById(result.id).pipe(tap((response: any[])=>{
      // response.map(u => u.eff_dt = u.eff_dt ? moment(new Date(u.eff_dt)).format('YYYY/MM/DD h:mm:ss A') : '');
      // response.map(u => u.last_act_dt = u.last_act_dt ? moment(new Date(u.last_act_dt)).format('YYYY/MM/DD h:mm:ss A') : '');
      // response.map(u => u.res_until_dt = u.res_until_dt ? moment(new Date(u.res_until_dt)).format('YYYY/MM/DD h:mm:ss A') : '');
      // response.map(u => u.disc_until_dt = u.disc_until_dt ? moment(new Date(u.disc_until_dt)).format('YYYY/MM/DD h:mm:ss A') : '');

      response.forEach((item, index) => {
        numsContent += `\n${item.num},${item.status},${item.message==null?'':item.message}`;
      });

      let data = `Number,Status,Message${numsContent}\n`
      const csvContent = 'data:text/csv;charset=utf-8,' + data;
      const url = encodeURI(csvContent);
      let fileName = 'MRO_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

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
        this.api.deleteMcp(id).subscribe(async res=>{
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
    this.numbersTable.filterGlobal(this.inputNumListFilterKey.replace(/^[A-Za-z0-9]$/g, ''), 'contains');
  }

  closeModal = () => {
    this.flagOpenModal = false;
  }

  onSubmit = () => {
    if (this.inputTemplateName=="") {
      this.tmplErrType = this.gConst.TMPL_ERR_TYPE.BLANK
      return
    }

    if (!TEMPLATE_NAME_REG_EXP.test(this.inputTemplateName)) {
      this.tmplErrType = this.gConst.TMPL_ERR_TYPE.ERROR
      return
    }

    if(this.inputDialNumbers=='') {
      this.invalidNumType = INVALID_NUM_TYPE_COMMON;
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
      let d = new Date(this.inputEffDateTime).getTime()
      effDateTime = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'
    }

    let body: any = {
      ro: this.store.getCurrentRo(),
      numList,
      requestDesc: this.inputRequestName,
      templateName: this.inputTemplateName,
      startEffDtTm: this.inputNow ? 'NOW' : effDateTime,
    }

    this.api.submitMcp(body).subscribe(res=>{
      if(res.success)
        setTimeout(()=>{
          this.sortActive = 'sub_dt_tm'
          this.sortDirection = 'DESC'
          this.getData();
        }, 100)
    });
  }

  onClear = () => {
    this.inputRequestName = ""
    this.inputEffDateTime = null
    this.inputDialNumbers = ""
    this.inputTemplateName = ""
    this.onNumFieldFocusOut()
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

  onClickFilter = () => this.getData();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    await this.getData();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1);
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
