import { Component, OnInit } from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ALL_FILTER_VALUE, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {IScriptResults, ISqlUser, ISqlScript} from "../../../models/user";

@Component({
  selector: 'app-script-exe-records',
  templateUrl: './script-exe-records.component.html',
  styleUrls: ['./script-exe-records.component.scss']
})
export class ScriptExeRecordsComponent implements OnInit {

  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  pageSize = 15
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sqlIdFilterValue = {name: 'All', value: ALL_FILTER_VALUE}
  resultFilterValue = {name: 'All', value: ALL_FILTER_VALUE}
  userIdFilterValue = {name: 'All', value: ALL_FILTER_VALUE}
  sortActive = ''
  sortDirection = ''
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any[] = ROWS_PER_PAGE_OPTIONS;
  noNeedRemoveColumn = true

  noNeedEditColumn = false

  script_exe_records: any[] = [];

  sql_scripts: any[] = [];
  sql_users: any[] = [];
  sql_results: any[] = [
    {name: 'All', value: ALL_FILTER_VALUE},
    {name: 'SUCCESS', value: 'SUCCESS'},
    {name: 'FAILED', value: 'FAILED'},
    {name: 'CANCELED', value: 'CANCELED'}
  ];

  constructor(
    public api: ApiService,
    public store: StoreService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
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

    this.getTotalScriptResultsCount();
    this.getScriptResultsList();
    this.getSqlUsersList();
    this.getSqlScriptsList();
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
      await this.api.getScriptResultsList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue, this.sqlIdFilterValue.value, this.resultFilterValue.value, this.userIdFilterValue.value)
        .pipe(tap(async (res: IScriptResults[]) => {
          this.script_exe_records = [];
          res.map(u => u.executed_at = u.executed_at ? moment(new Date(u.executed_at)).format('YYYY/MM/DD h:mm:ss A') : '');

          let allNotEditable = true
          for (let record of res) {
            this.script_exe_records.push(record)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getScriptResultsCount(filterValue, {
        "user_id": this.userIdFilterValue.value,
        "result": this.resultFilterValue.value,
        "sql_id": this.sqlIdFilterValue.value
      }).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalScriptResultsCount = async () => {
    this.resultsLength = -1
    await this.api.getScriptResultsCount('', {}).pipe(tap( res => {
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
          this.sql_users = [{name: 'All', value: ALL_FILTER_VALUE}, ...tmp];
        })).toPromise();
    } catch (e) {
    }
  }

  getSqlScriptsList = async () => {
    this.isLoading = true;
    try {
      await this.api.getSqlScriptsList(this.sortActive, this.sortDirection, this.pageIndex, 400, '')
        .pipe(tap(async (sql_scriptsRes: ISqlScript[]) => {
          let tmp = sql_scriptsRes.map(item=>{
            return this.createData(
              item.content,
              item.id
            );
          });
          this.sql_scripts = [{name: 'All', value: ALL_FILTER_VALUE}, ...tmp];
        })).toPromise();
    } catch (e) {
    }
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

  onClickFilter = () => this.getScriptResultsList();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    await this.getScriptResultsList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1);
  }
}
