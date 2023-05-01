import { Component, OnInit } from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ALL_FILTER_VALUE, ROWS_PER_PAGE_OPTIONS, PAGE_NO_PERMISSION_MSG, rowsPerPageOptions, SQL_TYPE_OPTIONS } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {IScriptResults, ISqlUser, ISqlScript} from "../../../models/user";
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-script-exe-records',
  templateUrl: './script-exe-records.component.html',
  styleUrls: ['./script-exe-records.component.scss']
})
export class ScriptExeRecordsComponent implements OnInit {

  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  pageSize = 10
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sqlIdFilterValue = {name: 'All', value: ''}
  resultFilterValue = {name: 'All', value: ''}
  userIdFilterValue = {name: 'All', value: ''}
  sortActive = 'updated_at'
  sortDirection = 'DESC'
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any[] = rowsPerPageOptions;
  noNeedRemoveColumn = true

  noNeedEditColumn = false

  script_exe_records: any[] = [];

  sql_scripts: any[] = [];
  sql_users: any[] = [];
  sql_results: any[] = [
    {name: 'All', value: ''},
    {name: 'SUCCESS', value: 'SUCCESS'},
    {name: 'FAILED', value: 'FAILED'},
    {name: 'COMPLETED', value: 'COMPLETED'},
    {name: 'WAITING', value: 'WAITING'},
    {name: 'UPLOADING', value: 'UPLOADING'},
    {name: 'DOWNLOADING', value: 'DOWNLOADING'},
    {name: 'IMPORTING', value: 'IMPORTING'}
  ];

  sqlTypeOptions: any[] = SQL_TYPE_OPTIONS;
  selectSqlType: string = '';

  constructor(
    public api: ApiService,
    public store: StoreService,
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

    if(this.store.getUser().permissions?.includes(PERMISSIONS.SQL_SCRIPT_EXECUTION_RECORD)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }

    // this.store.state$.subscribe(async (state)=> {

    // })

    this.getTotalScriptResultsCount();
    this.getScriptResultsList();
    this.getSqlUsersList();
    // this.getSqlScriptsList();
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  getScriptResultsList = async () => {
    this.isLoading = true;
    try {
      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')
      await this.api.getScriptResultsList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue, this.selectSqlType, this.resultFilterValue.value, this.userIdFilterValue.value)
        .pipe(tap(async (res: IScriptResults[]) => {
          console.log(res);
          this.script_exe_records = [];
          res.map(u => u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('MM/DD/YYYY h:mm:ss A') : '');

          let allNotEditable = true
          for (let record of res) {
            this.script_exe_records.push(record)
          }

          this.noNeedEditColumn = allNotEditable
        })).toPromise();

      this.filterResultLength = -1
      await this.api.getScriptResultsCount(filterValue, this.selectSqlType, this.resultFilterValue.value, this.userIdFilterValue.value).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalScriptResultsCount = async () => {
    this.resultsLength = -1
    await this.api.getScriptResultsCount('', '', '', '').pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  getSqlUsersList = async () => {
    try {
      await this.api.getSqlUsersList(this.sortActive, this.sortDirection, this.pageIndex, 400, '')
        .pipe(tap(async (sqlUsersRes: ISqlUser[]) => {
          let tmp = sqlUsersRes.map(item=>{
            return this.createData(
              item.username,
              item.id
            );
          });
          this.sql_users = [{name: 'All', value: ''}, ...tmp];
        })).toPromise();
    } catch (e) {
    }
  }

  // getSqlScriptsList = async () => {
  //   this.isLoading = true;
  //   try {
  //     await this.api.getSqlScriptsList(this.sortActive, this.sortDirection, this.pageIndex, 400, '', '')
  //       .pipe(tap(async (sql_scriptsRes: ISqlScript[]) => {
  //         let tmp = sql_scriptsRes.map(item=>{
  //           return this.createData(
  //             item.content,
  //             item.id
  //           );
  //         });
  //         this.sql_scripts = [{name: 'All', value: ''}, ...tmp];
  //       })).toPromise();
  //   } catch (e) {
  //   }
  // }

  getStatusColor = (status: string) => {
    switch(status) {
      case 'FAILED':
        return 'danger';
      case 'COMPLETED':
        return 'info';
      case 'SUCCESS':
        return 'success';
      case 'IMPORTING':
        return 'warning';
      default:
        return '';
    }
    return ''
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getScriptResultsList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getScriptResultsList()
  };

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getScriptResultsList();
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
