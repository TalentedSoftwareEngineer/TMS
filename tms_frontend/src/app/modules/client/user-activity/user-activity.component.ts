import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import {
  PERMISSION_TYPE_ALL,
  PERMISSION_TYPE_READONLY,
  ALL_FILTER_VALUE,
  SUPER_ADMIN_ID,
  PAGES,
  ROWS_PER_PAGE_OPTIONS,
  PAGE_NO_PERMISSION_MSG,
  rowsPerPageOptions
} from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {IUserActivities, IUser} from "../../../models/user";
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss']
})
export class UserActivityComponent implements OnInit {
  gConst = {
    SUPER_ADMIN_ID,
    PAGES
  }

  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  pageSize = 10
  pageIndex = 1
  filterName = ''
  filterValue = ''
  statusFilterValue = {name: 'All', value: ''}
  userIdFilterValue = {name: 'All', value: ''}
  sortActive = 'sub_dt_tm'
  sortDirection = 'DESC'
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any = rowsPerPageOptions;
  noNeedRemoveColumn = true

  noNeedEditColumn = false

  user_activities: any[] = [];

  users: any[] = [];
  status: any[] = [
    {name: 'All', value: ''},
    {name: 'SUCCESS', value: 'SUCCESS'},
    {name: 'FAILED', value: 'FAILED'},
    {name: 'CANCELED', value: 'CANCELED'}
  ];

  authenticatedUserId: number = -1;

  constructor(
    public api: ApiService,
    public store: StoreService,
    private messageService: MessageService,
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

    if(this.store.getUser().permissions?.includes(PERMISSIONS.USER_ACTIVITY)) {
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
    this.getTotalUserActivitiesCount();
    this.getUserActivitiesList();
    this.getUsersList();
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  getUserActivitiesList = async () => {
    this.isLoading = true;
    try {
      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')
      await this.api.getUserActivitiesList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue, this.statusFilterValue.value, this.authenticatedUserId==SUPER_ADMIN_ID ? this.userIdFilterValue.value : this.authenticatedUserId)
        .pipe(tap(async (res: IUserActivities[]) => {
          this.user_activities = [];
          res.map(u => {
            if(Boolean(this.store.getUser()?.timezone)) {
              // Timezone Time
              u.sub_dt_tm = u.sub_dt_tm ? moment(u.sub_dt_tm).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
            } else {
              // Local time
              u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('MM/DD/YYYY h:mm:ss A') : '';
            }
            u.page = u.page ? (Boolean(PAGES[u.page.toUpperCase() as keyof typeof PAGES]) ? PAGES[u.page.toUpperCase() as keyof typeof PAGES] : u.page) : ''
          })

          let allNotEditable = true
          for (let item of res) {
            this.user_activities.push(item)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1;
      await this.api.getUserActivitiesCount(filterValue, this.statusFilterValue.value, this.authenticatedUserId==SUPER_ADMIN_ID ? this.userIdFilterValue.value : this.authenticatedUserId).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalUserActivitiesCount = async () => {
    this.resultsLength = -1;
    await this.api.getUserActivitiesCount('', '', '').pipe(tap( res => {
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
    await this.getUserActivitiesList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getUserActivitiesList();
  };

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getUserActivitiesList();
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
