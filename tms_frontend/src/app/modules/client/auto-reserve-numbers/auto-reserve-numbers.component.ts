import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import moment from 'moment';
import {
  INVALID_TIME_NONE,
  INVALID_TIME_ORDER,
  INVALID_TIME_PAST,
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_EMPTY,
  INVALID_NUM_TYPE_WILDCARD,
  INVALID_NUM_TYPE_AMP,
  INVALID_NUM_TYPE_COMMON,
  INVALID_NUM_TYPE_TOO_MANY,
  MAX_REQUESTS_AT_A_TIME_LIMIT,
  WILDCARDNUM_REG_EXP,
  SUPER_ADMIN_ROLE_ID,
  PAGE_NO_PERMISSION_MSG,
  TFNUM_REG_EXP,
  rowsPerPageOptions,
} from '../../constants';
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {Table} from "primeng/table";
import {tap} from "rxjs/operators";
import {PERMISSIONS} from "../../../consts/permissions";
import {ROUTES} from "../../../app.routes";
import {environment} from "../../../../environments/environment";
import {closeEventSource, SseClient} from "angular-sse-client";
import {Router} from "@angular/router";
import { IUser } from 'src/app/models/user';

@Component({
  selector: 'app-auto-reserve-numbers',
  templateUrl: './auto-reserve-numbers.component.html',
  styleUrls: ['./auto-reserve-numbers.component.scss']
})
export class AutoReserveNumbersComponent implements OnInit, OnDestroy {

  gConst = {
    INVALID_TIME_NONE,
    INVALID_TIME_ORDER,
    INVALID_TIME_PAST,
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_EMPTY,
    INVALID_NUM_TYPE_WILDCARD,
    INVALID_NUM_TYPE_AMP,
    INVALID_NUM_TYPE_COMMON,
    INVALID_NUM_TYPE_TOO_MANY,
    MAX_REQUESTS_AT_A_TIME_LIMIT,
    WILDCARDNUM_REG_EXP,
    TFNUM_REG_EXP
  }

  timeDiffCT = 0;
  inputStartDateTime: any = null;

  invalidStartTime: number = INVALID_TIME_NONE;
  minStartDateTime: Date = new Date(moment().add(1, 'minute').valueOf() - this.timeDiffCT);
  inputStartNow: boolean = true;
  inputEndDateTime: any = null;
  invalidEndTime: number = INVALID_TIME_NONE;
  minEndDateTime: Date = new Date(moment().add(11, 'minute').valueOf() - this.timeDiffCT);
  inputEndNow: boolean = true;
  inputAfterMin: number = 5;
  afterMinErr: boolean = false;
  roIds: any[] = [];
  inputRoId = {name: '', value: ''};
  inputRequestsAtATime: string = '100';

  validRequestsAtATime: boolean = true;

  inputWildcards: string = '';
  invalidNumType: number = this.gConst.INVALID_NUM_TYPE_NONE;
  validQty: boolean = true;

  disableSubmit: boolean = true;

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

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  progressingReq: any[] = [];
  completedReq: any[] = [];

  viewedResult: any;
  csvNumbersContent: string = '';

  flagOpenModal: boolean = false;
  numberList: any[] = [];
  resultTotal: number = -1;
  numberListLoading: boolean = false;

  isSuperAdmin: boolean = false;
  userOptions: any[] = [];
  selectUser: string|number = '';

  streamdata_id: string = '/'+Math.floor(Math.random()*999999);

  constructor(
    public store: StoreService,
    public api: ApiService,
    private messageService: MessageService,
    private sseClient: SseClient,
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
    })

    if(this.store.getUser()?.permissions?.includes(PERMISSIONS.AUTO_RESERVE_NUMBERS)) {
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
      if(data.page.toUpperCase()=='NAR') {
        if(data.status.toUpperCase()=='IN PROGRESS') {
          let progressingReqIndex = this.progressingReq.findIndex(req=>req.req.id==data.req.id);
          if(progressingReqIndex==-1) {
            this.progressingReq.push(data);
          } else {
            this.progressingReq.splice(progressingReqIndex, 1, data);
          }
        } else {
          if(data.status=='SUCCESS' || data.status=='COMPLETED' || data.status=='FAILED' || data.status=='CANCELED') {
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

  getUsersList = async () => {
    try {
      await this.api.getUsersListForFilter()
        .pipe(tap(async (res: IUser[]) => {
          this.userOptions = [{name: 'All', value: ''}, ...res.map(item=>({name: item.username, value: item.id}))];
        })).toPromise();
    } catch (e) {
    }
  }

  /**
   * setSubmitable
   */
   setSubmitable() {
    let submitable = true
    // if (this.inputWildcards === '') {
    //   this.invalidNumType = this.gConst.INVALID_NUM_TYPE_EMPTY;
    //   submitable = false
    // }

    if (submitable && !this.validQty)
      submitable = false

    if (submitable && !this.validRequestsAtATime)
      submitable = false

    if (submitable && this.invalidNumType !== INVALID_NUM_TYPE_NONE)
      submitable = false

    if (submitable && !this.inputStartNow && this.invalidStartTime !== INVALID_TIME_NONE)
      submitable = false

    if (submitable && !this.inputEndNow && this.invalidEndTime !== INVALID_TIME_NONE)
      submitable = false

    if (submitable && this.inputEndNow && this.afterMinErr)
      submitable = false

    this.disableSubmit = !submitable;
  }

  /**
   * this is called when the focus of end time field is lost
   */
   onTimeFieldFocusOut = () => {
    const startNow = this.inputStartNow
    const endNow = this.inputEndNow
    let startTime = this.inputStartDateTime
    let endTime = this.inputEndDateTime
    const afterMin = this.inputAfterMin

    if (!startNow && endNow)
      endTime = moment().valueOf() + afterMin * 60 * 1000
    else if (startNow && !endNow)
      startTime = moment().valueOf()

    let invalidStartTime = INVALID_TIME_NONE
    let invalidEndTime = INVALID_TIME_NONE

    /*
    if (moment(startTime).valueOf() < moment().valueOf() - this.state.timeDiffCT + 10000) {
      invalidStartTime = INVALID_TIME_PAST
    }

    if (moment(endTime).valueOf() < moment().valueOf() - this.state.timeDiffCT + 10000) {
      invalidEndTime = INVALID_TIME_PAST
    }
    */

    if(startTime!=null && endTime!=null) {
      if (startTime >= endTime && invalidStartTime === INVALID_TIME_NONE) {
        invalidStartTime = INVALID_TIME_ORDER
      }
      if (startTime >= endTime && invalidEndTime === INVALID_TIME_NONE) {
        invalidEndTime = INVALID_TIME_ORDER
      }
    }

    this.invalidStartTime = invalidStartTime;
    this.invalidEndTime = invalidEndTime;

    this.setSubmitable()
  }

  onStartIntervalFifteenMin = () => {
    let d = new Date(this.inputStartDateTime).getTime();
    this.inputStartDateTime = new Date(Math.ceil(d / 900000) * 900000);
  }

  onEndIntervalFifteenMin = () => {
    let d = new Date(this.inputEndDateTime).getTime();
    this.inputEndDateTime = new Date(Math.ceil(d / 900000) * 900000);
  }

  /**
   * this function is called when the focus of number input field is lost
   */
   checkWildcardsValidation = (value: string) => {
    let wildcards = value.replaceAll('-', '')
    while (wildcards.includes("  "))
      wildcards = wildcards.replaceAll("  ", ' ')

    wildcards = wildcards.replaceAll(" ", ',')
    wildcards = wildcards.replaceAll("\n", ',')

    while (wildcards.includes(",,"))
      wildcards = wildcards.replaceAll(",,", ',')

    if (wildcards !== "") {
      if (wildcards.includes('*') || wildcards.includes('&')) { // to wildcard mode
        const wildcardList = wildcards.split(',')

        let invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE
        for (let wildcard of wildcardList) {
          if (!(wildcard.includes('*') || wildcard.includes('&'))) {
            invalidNumType = this.gConst.INVALID_NUM_TYPE_WILDCARD
            break
          }

          // check if the number is wildcard number
          let wildcardNumReg = this.gConst.WILDCARDNUM_REG_EXP
          let isValidWildcard = true

          if (wildcard.length > 12)
            isValidWildcard = false

          if (isValidWildcard && !wildcardNumReg.test(wildcard))
            isValidWildcard = false

          let ampCount = 0
          if (isValidWildcard && wildcard.includes("&")) {
            ampCount = 1
            let index = wildcard.indexOf("&")
            if (wildcard.includes("&", index + 1))
              ampCount = 2
          }

          if (!isValidWildcard) {
            invalidNumType = this.gConst.INVALID_NUM_TYPE_WILDCARD

          } else if (ampCount === 1) {
            invalidNumType = this.gConst.INVALID_NUM_TYPE_AMP

          }
        }

        if (invalidNumType === this.gConst.INVALID_NUM_TYPE_NONE) {
          wildcards = ""
          for (let num of wildcardList) {
            wildcards += wildcards === '' ? '' : ','

            num = num.replaceAll('-', '')
            wildcards += num.substr(0, 3) + '-' + num.substr(3, 3) + '-' + num.substr(6, 4)
          }

          this.invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE;
          this.inputWildcards = wildcards;
          this.setSubmitable();
        } else {
          this.invalidNumType = invalidNumType
          this.disableSubmit = true
        }

      } else {
        const numList = wildcards.split(',')

        let invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE
        for (let num of numList) {

          let isPhoneNumber = true

          if (num.length > 12)
            isPhoneNumber = false

          if (isPhoneNumber && !this.gConst.TFNUM_REG_EXP.test(num))
            isPhoneNumber = false

          if (!isPhoneNumber) {
            invalidNumType = this.gConst.INVALID_NUM_TYPE_COMMON
          }
        }

        if (invalidNumType === this.gConst.INVALID_NUM_TYPE_NONE) {
          let numbers = ""
          for (let num of numList) {
            numbers += numbers === '' ? '' : ','

            num = num.replaceAll('-', '')
            numbers += num.substr(0, 3) + '-' + num.substr(3, 3) + '-' + num.substr(6, 4)
          }

          this.invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE;
          this.inputWildcards = numbers;
          this.setSubmitable();

        } else {
          this.invalidNumType = invalidNumType;
          this.disableSubmit = true;
        }
      }

    } else if (wildcards == null || wildcards === "") {
      this.invalidNumType = this.gConst.INVALID_NUM_TYPE_EMPTY;
      this.disableSubmit = true;
    }
  }

  onInputAfterMin = () => {
    if (this.inputAfterMin <= 0)
      this.afterMinErr = true;
    else
      this.afterMinErr = false;

    this.setSubmitable();
  }

  onInputRequestsAtATime = async () => {
    let digitReg = /^[1-9]([0-9]+)?$/g

    if (!digitReg.test(this.inputRequestsAtATime) || parseInt(this.inputRequestsAtATime) > this.gConst.MAX_REQUESTS_AT_A_TIME_LIMIT) {
      this.validRequestsAtATime = false;
      this.disableSubmit = true
    } else {
      this.validRequestsAtATime = true;
      this.disableSubmit = false;
    }
  }

  onInputWildcards = async () => {
    this.checkWildcardsValidation(this.inputWildcards);
    this.setSubmitable()
  }

  onSubmit = () => {
    this.onTimeFieldFocusOut()
    this.checkWildcardsValidation(this.inputWildcards);

    if (this.invalidStartTime!=INVALID_TIME_NONE || this.invalidEndTime!=INVALID_TIME_NONE)
      return

    if (!this.validRequestsAtATime)
      return

    if (this.invalidNumType!=this.gConst.INVALID_NUM_TYPE_NONE)
      return

    if (this.store.getContactInformation()?.name === "" || this.store.getContactInformation()?.number === "") {
      this.showWarn("Please input Contact Information")
      return;
    }

    let body: any = {
      ro: this.store.getCurrentRo(),
      wildCardNum: this.inputWildcards,
      maxRequest: Number(this.inputRequestsAtATime),
      afterMin: this.inputAfterMin,
      contactName: this.store.getContactInformation()?.name,
      contactNumber: this.store.getContactInformation()?.number.replace(/\-/g, ""),
    }

    if (this.inputStartNow)
      body.startAt = new Date().toISOString()
    else
      body.startAt = new Date(this.inputStartDateTime!).toISOString()

    if (this.inputEndNow)
      body.endAt = new Date(new Date().getTime()+this.inputAfterMin*60*1000).toISOString()
    else
      body.endAt = new Date(this.inputEndDateTime!).toISOString()

    this.api.submitNar(body).subscribe(res=>{
      if(res.id)
        setTimeout(()=>{
          this.sortActive = 'sub_dt_tm'
          this.sortDirection = 'DESC'
          this.getData();
        }, 100)
    });
  }

  onClear = () => {
    this.inputStartDateTime = new Date(Math.ceil(new Date().getTime() / 900000) * 900000)
    this.inputEndDateTime = new Date(Math.ceil(new Date().getTime() / 900000) * 900000)
    this.inputWildcards = ""

    this.invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE
  }

  getData = async () => {
    this.getTotalCount();

    await this.api.getNarData(this.sortActive, this.sortDirection, this.pageSize, this.pageIndex, this.filterValue, this.selectUser)
      .pipe(tap(async (res: any[])=>{
        res.map(u => {
          // switch(this.store.getUser()?.timezone) {
          //   case -5:
          //     // EST/EDT time
          //     u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).utc().tz('America/New_York').format('MM/DD/YYYY h:mm:ss A') : '';
          //     u.start_at = u.start_at ? moment(new Date(u.start_at)).utc().tz('America/New_York').format('MM/DD/YYYY h:mm:ss A') : '';
          //     u.end_at = u.end_at ? moment(new Date(u.end_at)).utc().tz('America/New_York').format('MM/DD/YYYY h:mm:ss A') : '';
          //     break;
          //   case -6:
          //     // CST/CDT time
          //     u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).utc().tz('America/Chicago').format('MM/DD/YYYY h:mm:ss A') : '';
          //     u.start_at = u.start_at ? moment(new Date(u.start_at)).utc().tz('America/Chicago').format('MM/DD/YYYY h:mm:ss A') : '';
          //     u.end_at = u.end_at ? moment(new Date(u.end_at)).utc().tz('America/Chicago').format('MM/DD/YYYY h:mm:ss A') : '';
          //     break;
          //   default:
          //     // Local time
          //     u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('MM/DD/YYYY h:mm:ss A') : '';
          //     u.start_at = u.start_at ? moment(new Date(u.start_at)).format('MM/DD/YYYY h:mm:ss A') : '';
          //     u.end_at = u.end_at ? moment(new Date(u.end_at)).format('MM/DD/YYYY h:mm:ss A') : '';
          //     break;
          // }

          if(Boolean(this.store.getUser()?.timezone)) {
            // Timezone Time
            u.sub_dt_tm = u.sub_dt_tm ? moment(u.sub_dt_tm).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
            u.start_at = u.start_at ? moment(u.start_at).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
            u.end_at = u.end_at ? moment(u.end_at).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
          } else {
            // Local time
            u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('MM/DD/YYYY h:mm:ss A') : '';
            u.start_at = u.start_at ? moment(new Date(u.start_at)).format('MM/DD/YYYY h:mm:ss A') : '';
            u.end_at = u.end_at ? moment(new Date(u.end_at)).format('MM/DD/YYYY h:mm:ss A') : '';
          }
        });
        this.activityLogs = res;
      })).toPromise();

    this.filterResultLength = -1;
    await this.api.getNarCount(this.filterValue)
      .pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
  }

  getTotalCount = async () => {
    this.resultsLength = -1;
    await this.api.getNarCount('')
      .pipe(tap( res => {
        this.resultsLength = res.count
      })).toPromise();
  }

  onOpenViewModal = async (event: Event, result: any) => {
    this.csvNumbersContent = '';
    this.viewedResult = result;

    await this.api.getNarById(result.id)
      .pipe(tap((response: any[])=>{
        let list: any[] = []
        let obj: any = {num1:'', num2:'', num3:'', num4: '', num5: ''}
        let ind = 0;
        response.forEach((item, index) => {
          if (index%5==0 && index!=0) {
            list.push({...obj})
            obj = {num1:'', num2:'', num3:'', num4: '', num5: ''}
          } else {
            obj["num"+(index%5+1)] = item.num
          }

          ind = index;
        })

        if (ind%5!=0)
          list.push({...obj})

        this.numberList = [...list];

        this.numberList.forEach((item, index) => {
          this.csvNumbersContent += `${item.num1},${item.num2},${item.num3},${item.num4},${item.num5}\n`;
        });

        this.flagOpenModal = true;
        this.resultTotal = this.numberList.length
      })).toPromise();
  }

  onDownloadCsv = async (event: Event, result: any) => {
    let numsContent = '';

    await this.api.getNarById(result.id).pipe(tap((response: any[])=>{
      let list: any[] = []
      let obj: any = {num1:'', num2:'', num3:'', num4: '', num5: ''}
      let ind = 0;
      response.forEach((item, index) => {
        if (index%5==0 && index!=0) {
          list.push({...obj})
          obj = {num1:'', num2:'', num3:'', num4: '', num5: ''}
        } else {
          obj["num"+(index%5+1)] = item.num
        }

        ind = index;
      })

      if (ind%5!=0)
        list.push({...obj})

      list.forEach((item, index) => {
        numsContent += `${item.num1},${item.num2},${item.num3},${item.num4},${item.num5}\n`;
      });

      let data = `${numsContent}`
      const csvContent = 'data:text/csv;charset=utf-8,' + data;
      const url = encodeURI(csvContent);
      let fileName = 'NAR_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', fileName);
      tempLink.click();
    })).toPromise();
  }

  onViewNumbersDownload = () => {
    let data = `${this.csvNumbersContent}`

    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    const url = encodeURI(csvContent);
    let fileName = 'NAR_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
  }

  cancel = (event: Event, id: string) => {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.cancelNar(id).subscribe(async res=>{
          this.showSuccess('Successfully canceled!');
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

  delete = (event: Event, id: string) => {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteNar(id).subscribe(async res=>{
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

  getStatusTagColor = (result: any): string => {
    let status = this.getStatus(result).toUpperCase();
    switch(status) {
      case 'PENDING':
        return 'default';
      case 'FAILED':
        return 'danger';
      case 'COMPLETED':
        return 'info';
      case 'SUCCESS':
        return 'success';
      case 'CANCELED':
        return 'warning';
      default:
        return 'success';
    }
  }

  closeModal = () => {
    this.flagOpenModal = false;
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

  getTotal = (result: any) => {
    let completedReqItem = this.completedReq.find(req=>req.req.id==result.id);
    let progressingReqItem = this.progressingReq.find(req=>req.req.id==result.id);
    if(progressingReqItem!=undefined) {
      return progressingReqItem.req.total;
    } else if(completedReqItem!=undefined) {
      return completedReqItem.req.total;
    } else {
      return result.total;
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
    this.getData();
  }

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
