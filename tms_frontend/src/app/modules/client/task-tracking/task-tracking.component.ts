import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ALL_FILTER_VALUE, SUPER_ADMIN_ID, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {IUser, ITaskTracking} from "../../../models/user";

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
  userIdFilterValue = {name: 'All', value: ALL_FILTER_VALUE}
  sortActive = ''
  sortDirection = ''
  resultsLength = -1;
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any[] = ROWS_PER_PAGE_OPTIONS
  noNeedRemoveColumn = true

  noNeedEditColumn = false

  tasks: any[] = [];

  users: any[] = [];

  authenticatedUserId: number = -1;

  constructor(
    public api: ApiService,
    public store: StoreService,
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
          res.map(u => u.created_at = u.created_at ? moment(new Date(u.created_at)).format('YYYY/MM/DD h:mm:ss A') : '');
          res.map(u => u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '');
          res.map(u => u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : '');

          let allNotEditable = true
          for (let item of res) {
            this.tasks.push(item)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getTasksCount(filterValue, {
        "user_id": this.authenticatedUserId==SUPER_ADMIN_ID ? this.userIdFilterValue.value : this.authenticatedUserId
      }).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalTasksCount = async () => {
    this.resultsLength = -1
    await this.api.getTasksCount('', {}).pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  getUsersList = async () => {
    try {
      await this.api.getUsersList(this.sortActive, this.sortDirection, this.pageIndex, 400, '', undefined, undefined)
        .pipe(tap(async (res: IUser[]) => {
          let tmp = res.map(item=>{
            return this.createData(
              item.username,
              item.id
            );
          });
          this.users = [{name: 'All', value: ALL_FILTER_VALUE}, ...tmp];
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

  onClickFilter = () => this.getTasksList();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    await this.getTasksList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1);
  }
}
