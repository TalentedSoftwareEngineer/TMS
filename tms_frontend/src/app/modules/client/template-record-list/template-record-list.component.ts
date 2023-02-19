import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ENTITY_LIST, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {closeEventSource, SseClient} from "angular-sse-client";
import Cookies from 'universal-cookie';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-template-record-list',
  templateUrl: './template-record-list.component.html',
  styleUrls: ['./template-record-list.component.scss']
})
export class TemplateRecordListComponent implements OnInit {

  retrieveResults: any[] = [];
  //table variables
  pageSize = 15
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sortActive = ''
  sortDirection = ''
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any[] = ROWS_PER_PAGE_OPTIONS
  noNeedRemoveColumn = true
  noNeedEditColumn = false

  //retrieve variables
  bExpRetrieve: boolean = false;
  selectEntity: string = '';
  entityList: any[] = [] // option list of entity select field
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

  ngOnInit(): void {
    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.TRL)) {
      } else {
        // no permission
        this.showWarn("You have no permission for this page")
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this._router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

    this.entityList = ENTITY_LIST;
    this.selectEntity = ENTITY_LIST[0];

    this.retrieveResults = [
      {
        tmplName: '*AKBRBRC01-8041',
        description: '2ND MRO',
        effDtTm: '06/08/2020 11:30 AM',
        custRecStat: 'ACTIVE',
        amount: '12',
      }
    ];
    this.selTmplList = [
      {
        effDate: '06/08/2020',
        effTime: '11:30 AM',
        status: 'ACTIVE',
        approval: 'NOT REQUIRED',
        compPart: 'TAD, LAD, CPR',
        isSavedToDB: true
      }
    ];
  }

  retrieveTemplates = () => {

  }

  getSelectOptions = (i_list: any[]) => {
    return i_list.map(item=>({name: item, value: item}));
  }

  //Get the input value on change event
  handleUppercase = () => {
    this.inputTemplate = this.inputTemplate.toUpperCase()
    this.validTemplate = true;
  };

  getRetrieveResultsList = () => {

  }

  viewResult = (event: Event, resutl: any) => {
    this.bSelectionOpenModal = true;
  }

  closeSelectionModal = () => {
    this.bSelectionOpenModal = false;
  }

  saveToDatabase = (event: Event, i_selTmplName: string, i_selectedTmpRecord: any) => {
    
  }

  //Go TAD
  tad = async () => {
    if (Boolean(this.selectedTmpRecord)) {
      this.set_cookie();
      this._router.navigateByUrl('/service/tad');
    } else {
      this.showWarn('Please select template!');
    }
  };

  /*
  * Set cookie
  * @params: template, ed, et
  * */
  set_cookie = () => {
    const cookies = new Cookies();
    cookies.set("tmplName", this.selTmplName);
    cookies.set("effDtTm", this.selEffDtTm);
  };
  
  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getRetrieveResultsList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => this.getRetrieveResultsList();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    await this.getRetrieveResultsList();
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
