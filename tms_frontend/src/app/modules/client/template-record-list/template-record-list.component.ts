import {Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { ENTITY_LIST, PAGE_NO_PERMISSION_MSG, rowsPerPageOptions, TEMPLATE_NAME_REG_EXP } from '../../constants';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {closeEventSource, SseClient} from "angular-sse-client";
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import {tap} from "rxjs/operators";
import {Table} from "primeng/table";
import moment from "moment";
import Cookies from "universal-cookie";
import * as gFunc from 'src/app/utils/utils';

@Component({
  selector: 'app-template-record-list',
  templateUrl: './template-record-list.component.html',
  styleUrls: ['./template-record-list.component.scss']
})
export class TemplateRecordListComponent implements OnInit {
  gConst = {
    TEMPLATE_NAME_REG_EXP,
  }

  bExpRetrieve: boolean = false;

  retrieveResults: any[] = [];
  selectedRetrieveTemplate: any;
  retrieveResultsLoading = false
  rowsPerPageOptions: any[] = rowsPerPageOptions;

  @ViewChild('numbersTable') numbersTable!: Table;

  inputNumListFilterKey: string = '';

  entityOptions: any[] = [];
  selectEntity: string = '';
  inputTemplate: string = '';
  validTemplate: boolean = true;

  //result variables
  bExpResult: boolean = false;

  //modal
  bSelectionOpenModal: boolean = false;
  selTmplName: string = '';
  selEffDtTm: string = '';
  selTmplList: any[] = [];
  selectedTmpRecord: any;

  constructor(
    public store: StoreService,
    public api: ApiService,
    private sseClient: SseClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private _router: Router,
  ) {}

  async ngOnInit() {
    await new Promise<void>(resolve => {
      let mainUserInterval = setInterval(() => {
        if (this.store.getUser()) {
          clearInterval(mainUserInterval)

          resolve()
        }
      }, 100)
    })

    if(this.store.getUser().permissions?.includes(PERMISSIONS.TEMPLATE_RECORD_LIST)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this._router.navigateByUrl(ROUTES.dashboard)
      return
    }

    this.store.state$.subscribe(async (state)=> {
      this.entityOptions = this.store.getEntities();
      this.entityOptions.sort((firstItem: any, secondItem: any): any => {
        if(firstItem.name > secondItem.name) {
          return 1;
        }
        if(firstItem.name < secondItem.name) {
          return -1;
        }
        return 0;
      });
    })
  }

  retrieveTemplates = async () => {
    
    if(this.selectEntity === "") {
      this.showWarn("Please input entity.");
      return;
    }

    // check if the template name value is proper to the rule of the template name
    let reg = RegExp(`^\\*${this.selectEntity}[A-Z|-]{1}`)
    const template = this.inputTemplate.trim();

    if (template !== '' && !reg.test(template)) {
      this.validTemplate = false;
      return;
    } else {
      this.validTemplate = true;
    }

    await this.api.getTemplateList(this.store.getCurrentRo()!, this.selectEntity, this.inputTemplate)
      .pipe(tap( (res: any[]) => {
        res.map(u => {
          // u.effDtTm = u.effDtTm ? moment(new Date(u.effDtTm)).format('MM/DD/YYYY h:mm:ss A') : '';
          u.effDtTm = u.effDtTm ? gFunc.fromUTCStrToCTStr(u.effDtTm) : '';
        })
        this.retrieveResults = res  
      })).toPromise();
  }

  getSelectOptions = (i_list: any[]) => {
    return i_list.map(item=>({name: item, value: item}));
  }

  //Get the input value on change event
  handleUppercase = () => {
    this.inputTemplate = this.inputTemplate.toUpperCase()
    // if(this.inputTemplate[0]!='*') {
    //   this.inputTemplate = '*' + this.inputTemplate;
    // }
    this.validTemplate = true;
  };

  onTemplateFieldFocusOut = () => {
    let regex = this.gConst.TEMPLATE_NAME_REG_EXP
    let ro: string = String(this.store.getCurrentRo());

    if (!this.inputTemplate.includes(ro.slice(0, 2)) || !regex.test(this.inputTemplate)) {
      this.validTemplate = false;
    } else {
      this.validTemplate = true;
    }
  }

  getRetrieveResultsList = () => {

  }

  viewResult = (event: Event, result: any) => {
    this.api.getTemplate(this.store.getCurrentRo()!, result.tmplName, gFunc.fromCTTimeToUTCStr(new Date(result.effDtTm)))
      .pipe(tap( (res: any) => {
        res.result.map((u: any) => {
          u.effDtTm = u.effDtTm ? moment(new Date(u.effDtTm)).format('MM/DD/YYYY h:mm:ss A') : '';
        })

        this.selTmplName = result.tmplName;
        this.selEffDtTm = result.effDtTm;
        this.selTmplList = res.result;

        this.bSelectionOpenModal = true;
      })).toPromise();
  }

  closeSelectionModal = () => {
    this.bSelectionOpenModal = false;
  }

  saveToDatabase = (event: Event, i_selTmplName: string, i_selectedTmpRecord: any) => {
    let template = this.retrieveResults.find((item) => item.tmplName == i_selTmplName)
    if (template) {
      let data = { ... template, ...i_selectedTmpRecord }
      this.api.saveTemplate(this.store.getCurrentRo()!, data).subscribe(res => {
        this.showSuccess('Template successfully saved!');
        i_selectedTmpRecord.saved = true
      });
    }
  }

  onInputNumListFilterKey = () => {
    this.numbersTable.filterGlobal(this.inputNumListFilterKey, 'contains');
  }

  onResultDownload = () => {
    let tmplContent = '';
    let filteredResults = this.retrieveResults.filter(item=>(
      item.tmplName?.includes(this.inputNumListFilterKey) || 
      item.effDtTm?.includes(this.inputNumListFilterKey) || 
      item.description?.includes(this.inputNumListFilterKey) || 
      item.custRecStat?.includes(this.inputNumListFilterKey)
    ));
    
    filteredResults.forEach((item, index) => {
      tmplContent += `\n${item.tmplName}, ${item.description}, ${item.effDtTm==null?'':item.effDtTm}, ${item.custRecStat==null?'':item.custRecStat}, ${item.numbers==null?'':item.numbers}`;
    });

    let data = `Entity,${this.selectEntity}\n\nTemplate Name,Template Description,Effective Date/Time,CR Status,Total Amount of Numbers${tmplContent}\n`
    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    const url = encodeURI(csvContent);
    let fileName = 'Template_Record_List'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
  }

  onResultTemplateDisconnect = () => {
    console.log(this.selectedRetrieveTemplate);
    this.confirmationService.confirm({
      message: 'Are you sure you want to disconnect?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if(Boolean(this.selectedRetrieveTemplate)) {
          this.api.getTemplate(this.store.getCurrentRo()!, this.selectedRetrieveTemplate.tmplName, '').subscribe(res=>{
            let body = {
              srcTmplName: this.selectedRetrieveTemplate.tmplName,
              srcEffDtTm: gFunc.fromCTTimeToUTCStr(new Date(this.selectedRetrieveTemplate.effDtTm)),
              srcRecVersionId: res.recVersionId,
              tgtTmplName: this.selectedRetrieveTemplate.tmplName,
              tgtEffDtTm: 'NOW',
              cmd: 'U',
              tmplRecCompPart: 'TAD'
            };
            this.api.disconnectTmplRec({ro: this.store.getCurrentRo(), body: JSON.stringify(body)}).subscribe(response=>{
              if(response)
              this.showSuccess('Template successfully disconnected!');
            });
          });
        } else {
          this.showWarn("Please select template!");
        }
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

  onClickTmplName = (tmplName: string, effDtTm: string) => {
    if(Boolean(tmplName))
      this.gotoTADPage(tmplName, effDtTm)
  }

  gotoTADPage = (tmplName: string, effDtTm: string) => {
    const cookies = new Cookies();
    cookies.set("tmplName", tmplName);
    cookies.set("effDtTm", effDtTm);
    this._router.navigateByUrl(ROUTES.templateAdmin.tad);
  }

  tad = () => {
    let template = this.retrieveResults.find((item) => item.tmplName == this.selTmplName)
    if (template) {
      this.set_cookie();
      this._router.navigateByUrl(ROUTES.templateAdmin.tad);
    } else {
      this.showWarn("Please select template!");
    }
  }

  set_cookie = () => {
    const cookies = new Cookies();
    cookies.set("tmplName", this.selTmplName);
    cookies.set("effDtTm", this.selEffDtTm);
  };

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
