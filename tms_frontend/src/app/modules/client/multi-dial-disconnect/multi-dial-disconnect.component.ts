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
  LIMIT_SIXTY_LETTERS_REG_EXP
 } from '../../constants';

@Component({
  selector: 'app-multi-dial-disconnect',
  templateUrl: './multi-dial-disconnect.component.html',
  styleUrls: ['./multi-dial-disconnect.component.scss']
})
export class MultiDialDisconnectComponent implements OnInit {

  gConst = {
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_COMMON,
    SPECIFICNUM_REG_EXP,
    LIMIT_SIXTY_LETTERS_REG_EXP
  }

  @ViewChild('numbersTable') numbersTable!: Table;

  inputDialNumbers: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;
  inputRequestName: string = '';
  validRequestName: boolean = true;
  inputEffDateTime: any = null;
  minEffDateTime: Date = new Date();
  effDateErr: boolean = false;
  inputNow: boolean = false;
  inputInterDate: any = null;
  interDateErr: boolean = false;
  yes_no = [
    {name: 'YES', value: 'Y'},
    {name: 'NO', value: 'N'}
  ];
  inputYesNo = 'Y';
  inputMessage: string = '';

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  constructor(
    public store: StoreService,
    public api: ApiService,
    private sseClient: SseClient,
    private messageService: MessageService,
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
    this.getMNDData();

    
  }

  getMNDData = async () => {
    // let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')
    await this.api.getMNDData(/* this.sortActive, this.sortDirection, this.pageSize, this.pageIndex */)
      .pipe(tap(async (res: any[])=>{
        res.map(u => u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : '');
        console.log(this.activityLogs);
        this.activityLogs = res;
      })).toPromise();
    
    // this.resultsLength = -1;
    // await this.api.getNSRCount(filterValue, {})
    // .pipe(tap( res => {
    //   this.resultsLength = res.count
    // })).toPromise();
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

    let numList = gFunc.retrieveNumList(this.inputDialNumbers);
    if(!LIMIT_SIXTY_LETTERS_REG_EXP.test(this.inputRequestName)&&numList.length>1) {
      this.validRequestName = false;
      return;
    }

    let body = {
      ro: this.store.getCurrentRo(),
      numList,
      requestDesc: this.inputRequestName,
      startEffDtTm: this.inputNow ? new Date() : new Date(this.inputEffDateTime),
      endInterceptDt: moment(new Date(this.inputInterDate)).format('YYYY/MM/DD'),
      referral: this.inputYesNo
    }

    this.api.submitMND(body).subscribe(res=>{
      if(res.success)
        this.getMNDData();
    });
  }

  onClear = () => {

  }

  onNumFieldFocusOut = () => {
    let num = this.inputDialNumbers;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
      console.log("gFunc.retrieveNumListWithHyphen: " + nums.join(","))
      this.inputDialNumbers = nums.join(",");

      let specificNumReg = SPECIFICNUM_REG_EXP
      let isValid = true
      for (let el of nums) {
        console.log("el: " + el)
        if (!specificNumReg.test(el)) {   // if anyone among the number list is invalid, the number list is invalid.
          isValid = false
          break
        }
      }
      console.log("Specific: " + isValid)
      if (!isValid) {
        this.invalidNumType = INVALID_NUM_TYPE_COMMON;
      } else {
        this.invalidNumType = INVALID_NUM_TYPE_NONE;
      }
    } else {
      this.invalidNumType = INVALID_NUM_TYPE_NONE;
    }
  }

}
