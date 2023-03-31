import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {Router} from "@angular/router";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { tap } from "rxjs/operators";
import { PAGE_NO_PERMISSION_MSG, PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, rowsPerPageOptions, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import moment from 'moment';
import { ISqlUser } from "../../../models/user";
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-sql-users',
  templateUrl: './sql-users.component.html',
  styleUrls: ['./sql-users.component.scss']
})
export class SqlUsersComponent implements OnInit, AfterViewInit {

  @ViewChild('elmnt_sftp_hosts') elmnt_sftp_hosts!: ElementRef;


  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  // users variables
  pageSize = 15
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sortActive = 'id'
  sortDirection = 'ASC'
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any[] = rowsPerPageOptions;
  noNeedRemoveColumn = true

  input_sftp_hosts: string|undefined|null = ''
  input_sftp_path: string|undefined|null = ''
  isSftpEditing: boolean = false
  sql_users: any[] = [];
  noNeedEditColumn = false
  flag_openDialog = false
  write_permission: boolean = false;
  modalTitle = '';
  clickedId = -1;

  input_username: string|undefined|null = ''
  validUsername: boolean = true;
  input_password: string|undefined|null = ''
  validPassword: boolean = true;

  required: boolean = true;

  constructor(
    public router: Router,
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

    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.READ_SQL_SCRIPT)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }

      if(state.user.permissions?.indexOf(PERMISSIONS.WRITE_SQL_SCRIPT) == -1)
        this.write_permission = false;
      else
        this.write_permission = true;
    })

    this.getSftpHosts();
    this.getSqlUsersList();
    this.getTotalSqlUsersCount();
  }

  ngAfterViewInit() {
    this.elmnt_sftp_hosts.nativeElement.select();
  }

  getSftpHosts = async () => {
    await this.api.getSftpHosts().pipe(tap(res=>{
      this.input_sftp_hosts = res.host;
      this.input_sftp_path = res.remotePath;
    })).toPromise();
  }

  getSqlUsersList = async () => {
    this.isLoading = true;
    try {

      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')

      await this.api.getSqlUsersList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue)
        .pipe(tap(async (sql_usersRes: ISqlUser[]) => {
          this.sql_users = [];
          sql_usersRes.map(u => {
            u.created_at = u.created_at ? moment(new Date(u.created_at)).format('YYYY/MM/DD h:mm:ss A') : '';
            u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '';
          });

          let allNotEditable = true
          for (let sql_user of sql_usersRes) {
            this.sql_users.push(sql_user)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getSqlUserCount(filterValue).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalSqlUsersCount = async () => {
    this.resultsLength = -1
    await this.api.getSqlUserCount('').pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getSqlUsersList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getSqlUsersList();
  };

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getSqlUsersList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1, event.rows);
  }

  onSFTPEdit = () => {
    setTimeout(()=>{ 
      // this will make the execution after the above boolean has changed
      this.elmnt_sftp_hosts.nativeElement.select();
    },0);  
    this.isSftpEditing = true;
  }

  onEditedSFTPSave = () => {
    let send_data = JSON.stringify({
      host: this.input_sftp_hosts,
      remotePath: this.input_sftp_path,
    });
    this.api.updateSftpHosts({
      value: send_data
    }).subscribe(res=> {
      this.showSuccess('Successfully Updated!');
    });
  }

  onCancelSFTPEdit = () => {
    this.isSftpEditing = false;
  }

  onSqlUsersRefresh = () => {
    this.getSqlUsersList();
  }

  openSqlUserModal = (modal_title: string) => {
    this.modalTitle = modal_title
    this.flag_openDialog = true
  }

  closeSqlUserModal = () => {
    this.clearInputs();
    this.flag_openDialog = false;
  }

  onSqlUserSubmit = async (form_values: any) => {
    let username = form_values.username;
    let password = form_values.password;

    if(username=='') {
      this.validUsername = false;
      return;
    }

    if(password=='') {
      this.validPassword = false;
      return;
    }

    await new Promise<void>(resolve => {
      this.api.createSqlUser({
        username: username,
        password: password
      }).subscribe(res => {
        resolve()
      });
    })

    this.showSuccess('Successfully created!');
    this.closeSqlUserModal();
    this.getSqlUsersList();
    this.getTotalSqlUsersCount();
  }

  onOpenEditModal = async (event: Event, sql_user_id: number) => {
    this.clickedId = sql_user_id;
    this.api.getSqlUser(sql_user_id).subscribe(async res => {
      this.input_username = res.username;
      this.input_password = res.password;

      this.openSqlUserModal('Edit');
    })
  }

  editSqlUser = () => {
    this.api.updateSqlUser(this.clickedId, {
      username: this.input_username,
      password: this.input_password,
    }).subscribe(res => {
      this.showSuccess('Update succeeded!');
      this.closeSqlUserModal();
      this.getSqlUsersList();
    });
  }

  deleteSqlUser = (event: Event, sql_user_id: number) => {
    this.clickedId = sql_user_id;
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this item?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.api.deleteSqlUserById(sql_user_id).subscribe(res => {
            this.showSuccess('Successfully deleted!')
            this.getSqlUsersList();
            this.getTotalSqlUsersCount();
          })
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

  clearInputs = () => {
    this.input_username = ''
    this.validUsername = true;
    this.input_password = ''
    this.validPassword = true;
  }

  onInputUserName = () => {
    this.validUsername = this.input_username != '';
  }

  onChangePassword = () => {
    this.validPassword = this.input_password != '';
  }

  showWarn = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Warning', detail: msg });
  }
  showError = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: msg });
  }
  showSuccess = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: msg });
  };
  showInfo = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: msg });
  };  

}
