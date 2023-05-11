import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ALL_FILTER_VALUE, SUPER_ADMIN_ID, ROWS_PER_PAGE_OPTIONS, PAGE_NO_PERMISSION_MSG, rowsPerPageOptions } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {IUser, ITaskTracking} from "../../../models/user";
import { PERMISSIONS } from 'src/app/consts/permissions';
import { Router } from '@angular/router';
import { ROUTES } from 'src/app/app.routes';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-task-tracking',
  templateUrl: './task-tracking.component.html',
  styleUrls: ['./task-tracking.component.scss']
})
export class TaskTrackingComponent implements OnInit {

  gConst = {
    SUPER_ADMIN_ID
  }

  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  pageSize = 10
  pageIndex = 1
  filterName = ''
  filterValue = ''
  userIdFilterValue = {name: 'All', value: ''}
  sortActive = 'sub_dt_tm'
  sortDirection = 'DESC'
  resultsLength = -1;
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any[] = rowsPerPageOptions
  noNeedRemoveColumn = true

  noNeedEditColumn = false

  tasks: any[] = [];

  users: any[] = [];

  authenticatedUserId: number = -1;

  constructor(
    public api: ApiService,
    public store: StoreService,
    public router: Router,
    private messageService: MessageService
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

    if(this.store.getUser().permissions?.includes(PERMISSIONS.TASK_TRACKING)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }

    // this.store.state$.subscribe(async (state)=> {

    // })

    this.authenticatedUserId = this.store.getUser().id;
    this.getTotalTasksCount();
    this.getTasksList();
    this.getUsersList();
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  getTasksList = async () => {
    this.isLoading = true;
    try {
      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')
      await this.api.getTasksList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue, this.authenticatedUserId==SUPER_ADMIN_ID ? this.userIdFilterValue.value : this.authenticatedUserId)
        .pipe(tap(async (res: ITaskTracking[]) => {
          this.tasks = [];
          res.map(u => {
            if(Boolean(this.store.getUser()?.timezone)) {
              // Timezone Time
              u.sub_dt_tm = u.sub_dt_tm ? moment(u.sub_dt_tm).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
            } else {
              // Local time
              u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('MM/DD/YYYY h:mm:ss A') : '';
            }
            u.tgt_eff_dt_tm = u.tgt_eff_dt_tm ? moment(new Date(u.tgt_eff_dt_tm)).format('MM/DD/YYYY') : '';
            u.src_eff_dt_tm = u.src_eff_dt_tm ? moment(new Date(u.src_eff_dt_tm)).format('MM/DD/YYYY') : '';
          });

          let allNotEditable = true
          for (let item of res) {
            this.tasks.push(item)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getTasksCount(filterValue, this.authenticatedUserId==SUPER_ADMIN_ID ? this.userIdFilterValue.value : this.authenticatedUserId).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalTasksCount = async () => {
    this.resultsLength = -1
    await this.api.getTasksCount('', '').pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  getUsersList = async () => {
    try {
      await this.api.getUsersListForFilter()
        .pipe(tap(async (res: IUser[]) => {
          let tmp = res.map(item=>{
            return this.createData(
              item.username,
              item.id
            );
          });
          this.users = [{name: 'All', value: ''}, ...tmp];
        })).toPromise();
    } catch (e) {
    }
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getTasksList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getTasksList();
  };

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getTasksList();
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
