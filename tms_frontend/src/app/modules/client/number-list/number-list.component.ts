import { Component, OnInit } from '@angular/core';
import {ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/store/store.service';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
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
  TIME_REG_EXP, PAGE_NO_PERMISSION_MSG
} from '../../constants';
import { ApiService } from 'src/app/services/api/api.service';
import { tap } from 'rxjs/operators';
import moment from 'moment';
import {ISqlScript} from "../../../models/user";
import {closeEventSource, SseClient} from "angular-sse-client";
import {environment} from "../../../../environments/environment";

const NUM_IMPRT_STAT_COMPLETED     = "COMPLETED"
const NUM_IMPRT_STAT_FAILED     = "FAILED"
const NUM_IMPRT_STAT_SUCCESS     = "SUCCESS"
const NUM_IMPRT_STAT_CANCELED     = "CANCELED"

@Component({
  selector: 'app-number-list',
  templateUrl: './number-list.component.html',
  styleUrls: ['./number-list.component.scss']
})
export class NumberListComponent implements OnInit {

  pageSize = 10
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sortActive = 'id'
  sortDirection = 'ASC'
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any[] = [10, 25, 50, 100];

  respOrgIdOptions: any[] = [];
  selectRespOrgId: any = '';
  entityOptions: any[] = [];
  selectEntity: string = '';
  tmplNameOptions: any[] = [];
  selectTmplName = '';
  statusOptions: any[] = [];
  selectStatus = '';

  selectUsername: string = '';
  usernameOptions: any[] = []

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
    TIME_REG_EXP
  }

  sql_scripts: any[] = [];
  scriptLength: number = -1
  scriptFilterValue = ''
  filteredScriptLength: number = -1
  scriptPageSize = 10
  scriptPageIndex = 1
  scriptSortActive = 'id'
  scriptSortDirection = 'ASC'
  selectedSQLScripts: any[] =[];
  canceled: boolean = true;
  allFinish: boolean = false;

  autoRunStatuses: any[] = [];

  //Number List Table
  numberList: any[] = [];
  selectedNumbers: any[] =[];
  numberListLoading: boolean = false;

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
  ids: string[] = [];

  constructor(
    private store: StoreService,
    private messageService: MessageService,
    public router: Router,
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private sseClient: SseClient,
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
      if(state.user?.permissions?.includes(PERMISSIONS.NUMBER_LIST)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }

      this.selectRespOrgId = state.currentRo;
      this.getTotalNumberList();
      this.getNumberList();
    })

    this.backPressureEvent();

    this.getUsernames()
    this.getTemplate()
    this.getTemplateOfNumberList();
    this.getRespOrgIds();
    this.getEntities();
    this.getStatus();

    this.getTotalSqlScriptsCount()
    this.getSqlScriptsList()


    // this.getTotalNumberList();
    // this.getNumberList();
  }

  async getTemplate() {
    await this.api.getTemplateList(this.store.getCurrentRo()!)
      .pipe(tap( res => {
        // this.templates = [ { tmplName:"" }]
        this.templates = this.templates.concat(res)
      })).toPromise();
  }

  getNumberList = async () => {
    this.isLoading = true;
    try {
      let filterValue = this.filterValue//.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')
      await this.api.getNumberList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue, this.selectEntity, this.selectRespOrgId, this.selectTmplName, this.selectStatus)
        .pipe(tap(async (res: any[]) => {
          this.numberList = [];
          res.map(u => {
            u.eff_dt_tm = u.eff_dt_tm ? moment(new Date(u.eff_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : '';
            u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : '';
          });

          for (let record of res) {
            this.numberList.push(record)
          }
        })).toPromise();

      this.filterResultLength = -1
      await this.api.getNumberListCount(filterValue, this.selectEntity, this.selectRespOrgId, this.selectTmplName, this.selectStatus).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalNumberList = async () => {
    this.resultsLength = -1
    await this.api.getNumberListCount('', '', this.selectRespOrgId, '', '').pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  getSqlScriptsList = async () => {
    this.isLoading = true;
    try {

      let filterValue = this.scriptFilterValue//.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')

      await this.api.getScriptSQLsOfNumberList(this.scriptSortActive, this.scriptSortDirection, this.scriptPageIndex, this.scriptPageSize, filterValue, this.selectUsername)
        .pipe(tap(async (sql_scriptsRes: any) => {
          this.sql_scripts = [];
          for (let sql_script of sql_scriptsRes) {
            this.sql_scripts.push(sql_script)
          }
        })).toPromise();

      this.filteredScriptLength = -1
      await this.api.getScriptCountOfNumberList(filterValue, this.selectUsername).pipe(tap( res => {
        this.filteredScriptLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalSqlScriptsCount = async () => {
    this.scriptLength = -1
    await this.api.getSqlScriptsCount('').pipe(tap( res => {
      this.scriptLength = res.count
    })).toPromise();
  }

  getUsernames = async () => {
    try {
      await this.api.getUsernamesOfNumberList()
        .pipe(tap(async (res: any[]) => {
          this.usernameOptions = [{name: 'All', value: ''}]
          res.forEach((item) => {
            if (item.username!=null && item.username!="")
              this.usernameOptions.push({name: item.username, value: item.user_id})
          })
        })).toPromise();
    } catch (e) {
    }
  }

  getRespOrgIds = async () => {
    try {
      await this.api.getRespOrgOfNumberList()
        .pipe(tap(async (res: any[]) => {
          this.respOrgIdOptions = [{name: 'All', value: ''}]
          res.forEach((item) => {
            if (item.resp_org!=null && item.resp_org!="")
              this.respOrgIdOptions.push({name: item.resp_org, value: item.resp_org})
          })
        })).toPromise();
    } catch (e) {
    }
  }

  getEntities = async () => {
    try {
      await this.api.getEntityOfNumberList()
        .pipe(tap(async (res: any[]) => {
          this.entityOptions = [{name: 'All', value: ''}]
          res.forEach((item) => {
            if (item.entity!=null && item.entity!="")
              this.entityOptions.push({name: item.entity, value: item.entity})
          })
        })).toPromise();
    } catch (e) {
    }
  }

  async getTemplateOfNumberList() {
    await this.api.getTemplateOfNumberList()
      .pipe(tap( res => {
        this.tmplNameOptions = [{name: 'All', value: ''}]
        res.forEach((item) => {
          if (item.template_name!=null && item.template_name!="")
            this.tmplNameOptions.push({name: item.template_name, value: item.template_name})
        })
      })).toPromise();
  }

  async getStatus() {
    await this.api.getStatusOfNumberList()
      .pipe(tap( res => {
        this.statusOptions = [{name: 'All', value: ''}]
        res.forEach((item) => {
          if (item.status!=null && item.status!="")
            this.statusOptions.push({name: item.status, value: item.status})
        })
      })).toPromise();
  }

  backPressureEvent = () => {
    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id, { keepAlive: true }).subscribe(data => {
      console.log(data);
      if(data.page=='SER') {
        this.allFinish = true;
        this.sql_scripts = this.sql_scripts.map(item=>{
          if(data.sql_id == item.id) {
            return {...item, status: data.status, imported: data.imported, message: data.message};
          } else {
            return {...item, status: '', imported: '', message: ''};
          }
        });

        if(!this.ids.includes(data.id)) {
          this.ids.push(data.id);
        }
      }
    })
  }

  submit = async () => {
    let ids = this.selectedSQLScripts.map(item => (item.id));

    this.api.importNumberList(JSON.stringify(ids)).subscribe(async res => {
      if (res) {
        this.showSuccess('Processing...');
        this.canceled = false;
      }
    });
  };

  confirm = async () => {
    await this.getNumberList()

    // let res = await new Promise<any>(resolve=>{
    //   this.api.confirmNumImporting().subscribe(res=>{
    //     resolve(res);
    //   });
    // });
    
    // if (res) {
    //   this.canceled = true
    // }
    this.allFinish = false;
  }

  onCancel = () => {
    this.confirmationService.confirm({
      message: 'Are you sure you wish to cancel?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cancelSqlScript();
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

  cancelSqlScript = async () => {
    let res = await new Promise<any>(resolve=> {
      this.api.cancelNumImporting(JSON.stringify(this.ids)).subscribe(res=>{
        resolve(res);
      });
    });
    
    if (res) {
      this.canceled = true;
      this.allFinish = false;
      this.showWarn("Canceled");
    }
  }

  onConvert = () => {
    let selected = this.selectedNumbers.map(item => (item.num.replace(/\W/g, ''))).toString();
    this.router.navigateByUrl(`${ROUTES.sysAutoAdmin.multiConversion_pointerRecord}?numbers=${selected}`);
  }

  onActivate = () => {
    this.flagOpenActivateModal = true;
  }

  onDownload = async () => {
    await this.api.getNumberList("sub_dt_tm", "asc", 1, this.resultsLength, "", "", "", "", "")
      .pipe(tap(async (res: any[]) => {
        let data = res.map(u => ({
          'Entity': u.entity!=null ? u.entity : '',
          'Resp Org': u.resp_org!=null ? u.resp_org : '',
          'Template': u.template_name!=null ? u.template_name : "",
          'Number': u.num,
          'Status': u.status,
          'Submit Date': u.sub_dt_tm!=null ? moment(new Date(u.sub_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : '',
        }));

        import("xlsx").then(xlsx => {
          const worksheet = xlsx.utils.json_to_sheet(data);
          const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });

          import("file-saver").then(FileSaver => {
            let EXCEL_TYPE =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
            let EXCEL_EXTENSION = ".xlsx";
            const data: Blob = new Blob([excelBuffer], {
              type: EXCEL_TYPE
            });

            FileSaver.default(
              data,
              "Number_List" + "_export_" + new Date().getTime() + EXCEL_EXTENSION
            );
          });
        });


      })).toPromise();

  }

  closeActivateModal = () => {
    this.clearActiveModalInputs();
    this.flagOpenActivateModal = false;
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

    this.modalActivateSubmit();
  }

  modalActivateSubmit = () => {
    let body: any = {
      ro: this.store.getCurrentRo(),
      numList: [],
      templateName: this.inputTemplate.tmplName,
      serviceOrder: this.inputServiceOrderNum,
      numTermLine: Number(this.inputNumTermLine),
      contactName: this.store.getContactInformation()?.name,
      contactNumber: this.store.getContactInformation()?.number.replace(/\-/g, ""),
    }

    this.selectedNumbers.forEach((item) => {
      body.numList.push(item.num)
    })

    let effDateTime = ""
    if (this.inputNow)
      effDateTime = "NOW"
    else if (this.inputEffDate!=null) {
      let d = new Date(this.inputEffDate).getTime()
      effDateTime = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'
    }

    body.effDtTm = effDateTime

    this.api.submitMna(body).subscribe(res=>{
      if(res.success) {
        this.onModalCancel();
        this.router.navigateByUrl(ROUTES.numberAdministration.reservedNumberList);
      }
    });
  }

  onModalCancel = () => {
    this.closeActivateModal()
  }

  getImportStatusColor = (status: string) => {
    switch(status) {
      case NUM_IMPRT_STAT_COMPLETED:
        return 'info'
      case NUM_IMPRT_STAT_FAILED:
        return 'danger'
      case NUM_IMPRT_STAT_SUCCESS:
        return 'success'
      default:
        return 'warning'
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
    await this.getNumberList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getNumberList();
  }

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getNumberList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1, event.rows);
  }

  onScriptClickFilter = () => {
    this.onScriptPagination(1)
  }

  onScriptPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filteredScriptLength / this.scriptPageSize);
    console.log("----", this.scriptPageIndex, totalPageCount)
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    // if (pageIndex === this.scriptPageIndex) {return;}
    this.scriptPageIndex = pageIndex;
    await this.getSqlScriptsList();
  }

  scriptPaginate = (event: any) => {
    this.onScriptPagination(event.page+1);
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
