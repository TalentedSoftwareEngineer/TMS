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
  retrieveResultsLoading = false
  rowsPerPageOptions: any[] = rowsPerPageOptions;

  @ViewChild('numbersTable') numbersTable!: Table;

  inputNumListFilterKey: string = '';

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
      if(state.user.permissions?.includes(PERMISSIONS.TEMPLATE_RECORD_LIST)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this._router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })
  }


  retrieveTemplates = async () => {
    this.onTemplateFieldFocusOut()
    if (!this.validTemplate)
      return

    await this.api.getTemplateList(this.store.getCurrentRo()!, this.inputTemplate)
      .pipe(tap( (res: any[]) => {
        res.map(u => {
          u.effDtTm = u.effDtTm ? moment(new Date(u.effDtTm)).format('YYYY/MM/DD h:mm:ss A') : '';
          u.numbers = 0
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
    this.api.getTemplate(this.store.getCurrentRo()!, result.tmplName, result.effDtTm)
      .pipe(tap( (res: any[]) => {
        res.map(u => {
          u.effDtTm = u.effDtTm ? moment(new Date(u.effDtTm)).format('YYYY/MM/DD h:mm:ss A') : '';
        })

        this.selTmplName = result.tmplName
        this.selEffDtTm = result.effDtTm
        this.selTmplList = res

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

  tad = () => {
    let template = this.retrieveResults.find((item) => item.tmplName == this.selTmplName)
    if (template) {
      this.set_cookie();
      this._router.navigateByUrl(ROUTES.templateAdmin.tad);
    } else {
      this.showInfo("Please select template!");
    }
  }

  set_cookie = () => {
    console.log("Cookie: " + this.selTmplName + ", " + this.selEffDtTm)
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
