import { Component, OnInit, ViewChild } from '@angular/core';
import * as gFunc from 'src/app/utils/utils';
import { ApiService } from 'src/app/services/api/api.service';
import { StoreService } from 'src/app/services/store/store.service';
import {
  SPECIFICNUM_REG_EXP,
  PAGE_NO_PERMISSION_MSG
 } from '../../constants';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import moment from 'moment';
import { Table } from 'primeng/table';
import Cookies from "universal-cookie";

@Component({
  selector: 'app-roc-rsr',
  templateUrl: './roc-rsr.component.html',
  styleUrls: ['./roc-rsr.component.scss']
})
export class RocRsrComponent implements OnInit {

  @ViewChild('numberTable') numberTable!: Table;


  inputTollFreeNumber: string = '';
  validTollFreeNumber: boolean = true;

  statusOptions: any[] = [
    {name: 'All', value: 'ALL'},
    {name: 'Pending', value: 'PENDING'},
    {name: 'Port Processing', value: 'PORT_PROCESSING'},
    {name: 'Ported', value: 'PORTED'},
    {name: 'Declined', value: 'DECLINED'},
    {name: 'Overdue', value: 'OVERDUE'},
    {name: 'Help Desk Request (HDR)', value: 'HDR'},
    {name: 'Invalid', value: 'INVALID'},
    {name: 'Port Failed', value: 'PORT_FAILED'},
    {name: 'Due Date Approval', value: 'DUE_DATE_APPROVAL'},
    {name: 'Expired', value: 'EXPIRED'}
  ];
  selectStatus: string = 'ALL';

  submittedOptions: any[] = [
    {name: 'Last 7 Days', value: 7},
    {name: 'Last 14 Days', value: 14},
    {name: 'Last 30 Days', value: 30},
    {name: 'Last 90 Days', value: 90},
    {name: 'Last 180 Days', value: 180},
    {name: 'Date Range', value: 0},
  ];
  selectSubmitted: any = 14;
  dateRangeSubmitted: any[] = [moment().subtract(this.selectSubmitted, "days").toDate(), new Date()];

  rejectReasonOptions: any[] = [
    {name: 'Select', value: '00'},
    {name: '01 - Customer name mismatch/missing', value: '01'},
    {name: '02 - Address mismatch/missing (verification done if address is different but all other information is the same)', value: '02'},
    {name: '03 - Contact/Customer signature missing', value: '03'},
    {name: '04 - Toll-Free Shared or Bundled', value: '04'},
    {name: '05 - Customer signature date missing/or expired (must be less than 30 days)', value: '05'},
    {name: '06 - Sent to wrong Resp Org', value: '06'},
    {name: '07 - Toll-Free Number not listed on request', value: '07'},
    {name: '08 - All data mismatch', value: '08'},
    {name: '09 - LOA missing or linking Reseller/Subscriber LOA missing', value: '09'},
    {name: '11 - Illegible LOA', value: '11'},
    {name: '12 - More recent LOA (provide copy of LOA to Resp Org)', value: '12'},
    {name: '15 - Unauthorized contact/Customer signature', value: '15'},
    {name: '16 - Auto-rejected by Submitter', value: '16'},
    {name: '17 - Expired', value: '17'},
    {name: '18 - Resp Org is no longer in control of the Toll-Free Number', value: '18'},
    {name: '19 - Toll-Free Number is in Spare status', value: '19'},
    {name: '20 - Toll-Free Number is in Unavailable status', value: '20'},
    {name: '21 - Toll-Free Number belongs to a Port Restricted Resp Orgs', value: '21'},
    {name: '22 - Toll-Free Number is already in control by your organization', value: '22'},
    {name: '23 - Auto-rejected by Help Desk', value: '23'},
  ];
  selectRejectReason: string = '00';

  typeOptions: any[] = [
    {name: 'Incoming', value: 'INCOMING'},
    {name: 'Outgoing', value: 'OUTGOING'}
  ];
  selectType: string = 'INCOMING';

  progressOptions: any[] = [
    {name: 'All', value: 'BOTH'},
    {name: 'Opened', value: 'OPEN'},
    {name: 'Closed', value: 'CLOSED'}
  ];
  selectProgress: string = 'BOTH';

  respOrgOptions: any[] = [];
  selectRespOrg: string = '';

  switchExpidited: boolean = false;
  switchCheckShow: boolean = false;
  switchDenotesExpedited: boolean = false;

  searchRocByTransactionResult: any;
  resultTableData: any;
  selectedResult: any;

  flag_openDialog: boolean = false;
  incomingRespOrgChangeModalData: any;

  flagOpenDeclinedNumDialog: boolean = false;

  numStatusOptions: any[] = [
    {label: '', value: null},
    {label: 'PENDING', value: 'PENDING'},
    {label: 'PORT_PROCESSING', value: 'PORT_PROCESSING'},
    {label: 'PORTED', value: 'PORTED'},
    {label: 'DECLINED', value: 'DECLINED'},
    {label: 'OVERDUE', value: 'OVERDUE'},
    {label: 'HDR', value: 'HDR'},
    {label: 'INVALID', value: 'INVALID'},
    {label: 'PORT_FAILED', value: 'PORT_FAILED'},
    {label: 'DUE_DATE_APPROVAL', value: 'DUE_DATE_APPROVAL'},
    {label: 'EXPIRED', value: 'EXPIRED'},
  ];

  inputDeclinedNumbers: string = '';
  reasonOptions: any = [
    {name: '01 - Customer name mismatch/missing', value: '01'},
    {name: '02 - Address mismatch/missing (verification done if address is different but all other information is the same)', value: '02'},
    {name: '03 - Contact/Customer signature missing', value: '03'},
    {name: '04 - Toll-Free Shared or Bundled', value: '04'},
    {name: '05 - Customer signature date missing/or expired (must be less than 30 days)', value: '05'},
    {name: '06 - Sent to wrong Resp Org', value: '06'},
    {name: '07 - Toll-Free Number not listed on request', value: '07'},
    {name: '08 - All data mismatch', value: '08'},
    {name: '09 - LOA missing or linking Reseller/Subscriber LOA missing', value: '09'},
    {name: '11 - Illegible LOA', value: '11'},
    {name: '12 - More recent LOA (provide copy of LOA to Resp Org)', value: '12'},
    {name: '15 - Unauthorized contact/Customer signature', value: '15'},
    {name: '18 - Resp Org is no longer in control of the Toll-Free Number', value: '18'},
  ]
  selectedReasons: any = [];
  inputDeclineNotes: string = '';

  inputAlternateContact: string = '';

  radioReSubmit: string = '';

  clickedRowIndex: number = -1;

  constructor(
    public api: ApiService,
    public store: StoreService,
    private messageService: MessageService,
    public router: Router,
    private confirmationService: ConfirmationService,
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

    if(this.store.getUser().permissions?.includes(PERMISSIONS.ROC_SUBMIT_REQUEST)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }
    
    // this.store.state$.subscribe(async (state)=> {

    // })

    await this.setRespOrgOptions();
    this.onClickUpdateResults();
  }

  setRespOrgOptions = async () => {
    this.store.state$.subscribe(async (state)=>{
      if(state.user!=null) {
        let loggedUser_ros = state.user.ro.split(',');
        this.respOrgOptions = loggedUser_ros.map(item=>({name: item, value: item}));
        this.respOrgOptions = [{name: 'All', value: 'all'}, ...this.respOrgOptions.sort((firstItem: any, secondItem: any): any => {
          if(firstItem.name > secondItem.name)
            return 1;
          if(firstItem.name < secondItem.name)
            return -1;
          
          return 0;
        })];
        this.selectRespOrg = this.respOrgOptions[0].value;
      }
    });
  }

  onNumFieldFocusOut = () => {
    let num = this.inputTollFreeNumber;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
      nums = nums.filter((item, index)=>(nums.indexOf(item)===index));
      this.inputTollFreeNumber = nums.join(",");
      // check if the number list is valid
      let specificNumReg = SPECIFICNUM_REG_EXP
      let isValid = true
      for (let el of nums) {
        if (!specificNumReg.test(el)) {   // if anyone among the number list is invalid, the number list is invalid.
          isValid = false
          break
        }
      }

      if (!isValid) {
        this.validTollFreeNumber = false
      } else {
        this.validTollFreeNumber = true;
      }
    } else if (num == null || num === "") {
      this.validTollFreeNumber = true;
    }
  }

  onInputTollFreeNumber = () => {
    this.initialResultTable();
  }

  onChangeStatus = () => {
    this.initialResultTable();
  }

  onChangeRejectReason = () => {
    this.initialResultTable();
  }

  onChangeSubmitted = () => {
    this.dateRangeSubmitted = [moment().subtract(this.selectSubmitted, "days").toDate(), new Date()];
    this.initialResultTable();
  }

  onClickUpdateResults = () => {
    let data: any = {
      rocType: this.selectType,
      entityOrRespOrg: this.selectRespOrg == 'all' ? 'XQ' : this.selectRespOrg,
      startDate: moment(this.dateRangeSubmitted[0]).format('YYYY-MM-DD') + 'T00:00:00Z',
      endDate: moment(this.dateRangeSubmitted[1]).format('YYYY-MM-DD') + 'T23:59:59Z',
      progress: this.selectProgress,
    }

    if(this.selectStatus != 'ALL')
      data.status = this.selectStatus;

    if(Boolean(this.inputTollFreeNumber))
      data.num = this.inputTollFreeNumber;

    if(this.selectRejectReason != '00')
      data.rejectReasonCode = this.selectRejectReason;

    this.api.searchRocByTransaction(data).subscribe(res=>{
      res.transactionList.map((u: any) => {
        if(Boolean(this.store.getUser()?.timezone)) {
          // Timezone Time
          u.submittedDateTime = u.submittedDateTime ? moment(u.submittedDateTime).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
          u.futureDateTime = u.futureDateTime ? moment(u.futureDateTime).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
          u.closedOn = u.closedOn ? moment(u.closedOn).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
        } else {
          // Local time
          u.submittedDateTime = u.submittedDateTime ? moment(new Date(u.submittedDateTime)).format('MM/DD/YYYY h:mm:ss A') : '';
          u.futureDateTime = u.futureDateTime ? moment(new Date(u.futureDateTime)).format('MM/DD/YYYY h:mm:ss A') : '';
          u.closedOn = u.closedOn ? moment(new Date(u.closedOn)).format('MM/DD/YYYY h:mm:ss A') : '';
        }
        u.dueDate = u.dueDate ? moment(new Date(u.dueDate)).format('MM/DD/YYYY') : '';
      });

      this.searchRocByTransactionResult = res.transactionList;
      this.resultTableData = this.searchRocByTransactionResult;
    });
  }

  onClickReset = () => {
    this.initialResultTable();
  }

  initialResultTable = () => {
    this.searchRocByTransactionResult = [];
    this.resultTableData = [];
  }

  onClickExportCSV = () => {
    let data: any = {
      rocType: this.selectType,
      entityOrRespOrg: this.selectRespOrg == 'all' ? 'XQ' : this.selectRespOrg,
      startDate: moment(this.dateRangeSubmitted[0]).format('YYYY-MM-DD') + 'T00:00:00Z',
      endDate: moment(this.dateRangeSubmitted[1]).format('YYYY-MM-DD') + 'T23:59:59Z',
      progress: this.selectProgress,
    }

    if(this.selectStatus != 'ALL')
      data.status = this.selectStatus;

    if(Boolean(this.inputTollFreeNumber))
      data.num = this.inputTollFreeNumber;

    if(this.selectRejectReason != '00')
      data.rejectReasonCode = this.selectRejectReason;

    let content = '';

    this.api.searchRocRequest(data).subscribe(res=>{
      res.resultList.forEach((item: any, index: number) => {
        content += `\n${item.txnID}, ${this.searchRocByTransactionResult[index].tfnCount}, ${item.num==null?'':item.num}, ${this.searchRocByTransactionResult[index].submittedDateTime==null?'':this.searchRocByTransactionResult[index].submittedDateTime}, ${item.submittingRespOrg==null?'':item.submittingRespOrg}, ${this.searchRocByTransactionResult[index].futureDateTime==null?'':this.searchRocByTransactionResult[index].futureDateTime}, ${this.searchRocByTransactionResult[index].dueDate==null?'':this.searchRocByTransactionResult[index].dueDate}, ${item.status==null?'':item.status}, ${item.rejectNote==null?'':item.rejectNote}, ${item.requestCheckedOutBy==null?'':item.requestCheckedOutBy}, ${item.checkoutDateTime==null?'':item.checkoutDateTime}, ${this.searchRocByTransactionResult[index].statusCode==null?'':this.searchRocByTransactionResult[index].statusCode}, ${this.searchRocByTransactionResult[index].closedOn==null?'':this.searchRocByTransactionResult[index].closedOn}, ${item.rejectReasonList==null?'':item.rejectReasonList[0].reason}, ${item.expediteROC==null?'':item.expediteROC}`;
      });

      let data = `TxnID,Toll-Free Number Count,Toll-Free Number,Submitted On,Submitting Resp Org,Future Dated,Due Date,Status,Reject Description,Checked Out By,Checked Out Date,Progress,Closed On,Decline Note,Expedite ROC${content}\n`
      const csvContent = 'data:text/csv;charset=utf-8,' + data;
      const url = encodeURI(csvContent);
      let fileName = 'ROCRequestList'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', fileName);
      tempLink.click();
    });
  }

  onChangeExpedited = (event: any) => {
    if(event.checked)
      this.resultTableData = this.searchRocByTransactionResult.filter((item: any)=>item.expediteROC=='YES');
    else
      this.resultTableData = this.searchRocByTransactionResult;
  }

  onChangeCheckedOut = (event: any) => {
    if(event.checked)
      this.resultTableData = this.searchRocByTransactionResult.filter((item: any)=>item.isRequestCheckedOut=='YES');
    else
      this.resultTableData = this.searchRocByTransactionResult;
  }

  setIncomingRespOrgChangeModalData = (txnId: string) => {
    this.api.retrieveRocRequest({txnId}).subscribe(res=> {
      res.checkoutDateTime = res.checkoutDateTime ? moment(new Date(res.checkoutDateTime)).format('MM/DD/YYYY h:mm:ss A') : '';
      res.submittedDateTime = res.submittedDateTime ? moment(new Date(res.submittedDateTime)).format('MM/DD/YYYY h:mm:ss A') : '';
      res.futureDateTime = res.futureDateTime ? moment(new Date(res.futureDateTime)).format('MM/DD/YYYY h:mm:ss A') : '';
      res.dueDate = res.dueDate ? moment(new Date(res.dueDate)).format('MM/DD/YYYY') : '';
      res.numList?.map((u: any) => {
        u.processedOn = u.processedOn ? moment(new Date(u.processedOn)).format('MM/DD/YYYY h:mm:ss A') : '';
        u.bApprove = false;
        u.bDecline = false;
        u.action = '00';
      });
      this.incomingRespOrgChangeModalData = res;
    });
  }

  onRowSelect = (event: any) => {
    this.setIncomingRespOrgChangeModalData(event.data.txnID);
    this.flag_openDialog = true;
  }

  onClickCheckIn = (txnID: string) => {
    this.api.checkInRocRequest({txnID}).subscribe(res=>{
      this.setIncomingRespOrgChangeModalData(txnID);
    })
  }

  onClickCheckOut = (txnID: string) => {
    this.api.checkOutRocRequest({txnID}).subscribe(res=>{
      this.setIncomingRespOrgChangeModalData(txnID);
    })
  }

  onInputNumberTableFilter = (event: any) => {
    this.numberTable.filterGlobal((event.target as HTMLInputElement).value.replace(/\W/g, ''), 'contains');
  }

  onChangeDueDateApprovalAll = (event: any) => {
    
  }

  onChangeApproveAll = (event: any) => {
    
  }

  onChangeDeclineAll = (event: any) => {
    
  }

  onChangeDueDateApproval = (event: any, number: string) => {
    
  }

  onChangeApprove = (event: any, number: string) => {
    
  }

  onChangeDecline = (event: any, number: string, rowIndex: number) => {
    if(event.checked) {
      this.inputDeclinedNumbers = number;
      this.flagOpenDeclinedNumDialog = true;
      this.clickedRowIndex = rowIndex;
    } else {
      this.clickedRowIndex = -1;
    }
  }

  removeNumber = (event: any, number: string, txnID: string) => {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.removeTfnRequest({
          txnID,
          numList: [number]
        }).subscribe(res=>{
          this.setIncomingRespOrgChangeModalData(txnID);
        });
      },
      reject: (type: any) => {
        switch(type) {
          case ConfirmEventType.REJECT:
            break;
          case ConfirmEventType.CANCEL:
            break;
        }
      }
    });
  }

  onClickDownloadNumbers = () => {
    let content = ''
    this.incomingRespOrgChangeModalData?.numList.forEach((item: any, index: number) => {
      content += `\n${item.num==null?'':item.num}, ${item.ctrlRespOrg==null?'':item.ctrlRespOrg}, ${item.status==null?'':item.status}, ${item.bApprove?'YES':''}, ${this.selectedReasons.toString()}`;
    });

    let data = `Toll-Free Number,RespOrgID,CurrentStatus,Approval,RejectNote${content}\n`
    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    const url = encodeURI(csvContent);
    let fileName = 'ROCTFN_'+moment(new Date()).format('YYYY-MM-DD-hh-mm-ss');

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
  }

  onClickUploadNumbers = () => {

  }

  onClickDeclineSubmit = () => {
    console.log(this.selectedReasons);
  }

  onClickDeclineCancel = () => {
    this.inputDeclinedNumbers = '';
    this.selectedReasons = [];
    this.inputDeclineNotes = '';
    this.flagOpenDeclinedNumDialog=false;
  }

  onClickLOADocumentation = (loaID: any) => {
    this.api.retrieveDocument(loaID, '', '').subscribe(res=>{
      const content = `data:${res.mimeType};base64,${res.fileContent}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = content;
      downloadLink.download = res.fileName;
      downloadLink.click();
      downloadLink.remove();
    });
  }

  onClickOtherDocumentation = (docId: any) => {
    this.api.retrieveDocument('', docId, '').subscribe(res=>{
      const content = `data:${res.mimeType};base64,${res.fileContent}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = content;
      downloadLink.download = res.fileName;
      downloadLink.click();
      downloadLink.remove();
    });
  }

  onClickSubmit = (txnID: string) => {
    this.api.processRocRequest({
      txnID, 
      numActionList: this.incomingRespOrgChangeModalData?.numList.map((item: any)=>({
        num: item.num,
        action: item.bApprove ? '00' : item.bDecline ? item.action : ''
      })),
    }).subscribe(res=>{

    });
  }

  onClickCancelRequest = (txnID: string) => {
    this.api.cancelRocRequest({txnID}).subscribe(res=>{
      this.showSuccess('Successfuly Canceled');
    });
  }

  onClickResubmit = (txnID: string) => {
    this.gotoRSBPage();
  }

  gotoRSBPage = () => {
    const cookies = new Cookies();
    cookies.set("numList", this.incomingRespOrgChangeModalData?.numList.map((item: any)=>(item.num)));
    cookies.set("newRespOrgID", this.incomingRespOrgChangeModalData?.newRespOrgID);
    cookies.set("oldRespOrgID", this.incomingRespOrgChangeModalData?.submittingRespOrg);
    cookies.set("requestType", this.incomingRespOrgChangeModalData?.requestType);
    cookies.set("loaId", this.incomingRespOrgChangeModalData?.loaID);
    cookies.set("loaFileName", this.incomingRespOrgChangeModalData?.loaFileName);
    cookies.set("additionalDocuments", this.incomingRespOrgChangeModalData?.additionalDocuments);
    cookies.set("effectiveDate", this.incomingRespOrgChangeModalData?.futureDateTime);
    this.router.navigateByUrl(ROUTES.roc.rsb)
    // this.setState(JSON.parse(JSON.stringify(this.initialState)));
  }

  onClickResubmitTheRequest = (event: any) => {
    console.log(this.radioReSubmit);
  }

  onChangeReasonCode = (event: any) => {
    // @ts-ignore
    this.incomingRespOrgChangeModalData?.numList[this.clickedRowIndex]?.action = event.value.toString();
  }

  onCloseModal = () => {
    this.flag_openDialog = false;
    this.selectedResult = null;
    this.radioReSubmit = '';
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
