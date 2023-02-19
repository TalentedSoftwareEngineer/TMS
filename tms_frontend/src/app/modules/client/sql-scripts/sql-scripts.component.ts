import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {Router} from "@angular/router";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { tap } from "rxjs/operators";
import { PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import moment from 'moment';
import { ISqlScript, ISqlUser } from "../../../models/user";
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-sql-scripts',
  templateUrl: './sql-scripts.component.html',
  styleUrls: ['./sql-scripts.component.scss']
})
export class SqlScriptsComponent implements OnInit {


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
  rowsPerPageOptions: any[] = ROWS_PER_PAGE_OPTIONS;
  noNeedRemoveColumn = true

  sql_scripts: any[] = [];
  sql_users: any[] = [];

  noNeedEditColumn = false

  flag_openDialog = false

  write_permission: boolean = false;

  modalTitle = '';

  clickedId = -1;

  input_user_id: any = -1 /** {name: '', value: -1} */;
  validUserId: boolean = true;
  input_content: string|undefined|null = '';
  validContent: boolean = true;
  input_autorun: boolean = true;

  required: boolean = true;
  binary: boolean = true;

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
        this.showWarn("You have no permission for this page")
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }

      if(state.user.permissions?.indexOf(PERMISSIONS.WRITE_SQL_SCRIPT) == -1)
        this.write_permission = false;
      else
        this.write_permission = true;
    })

    this.getSqlScriptsList();
    this.getTotalSqlScriptsCount();
    this.getSqlUsersList();
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  getSqlScriptsList = async () => {
    this.isLoading = true;
    try {

      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')

      await this.api.getSqlScriptsList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue)
        .pipe(tap(async (sql_scriptsRes: ISqlScript[]) => {
          this.sql_scripts = [];
          sql_scriptsRes.map(u => {
            u.created_at = u.created_at ? moment(new Date(u.created_at)).format('YYYY/MM/DD h:mm:ss A') : '';
            u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '';
          });

          let allNotEditable = true
          for (let sql_script of sql_scriptsRes) {
            this.sql_scripts.push(sql_script)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.getTotalSqlScriptsCount();
      this.filterResultLength = -1
      await this.api.getSqlScriptsCount(filterValue).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }
  
  getTotalSqlScriptsCount = async () => {
    this.resultsLength = -1
    await this.api.getSqlScriptsCount('').pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  getSqlUsersList = async () => {
    try {
      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')
      await this.api.getSqlUsersList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue)
        .pipe(tap(async (sqlUsersRes: ISqlUser[]) => {
          this.sql_users = sqlUsersRes.map(item=>{
            return this.createData(
              item.username,
              item.id
            );
          });
          this.input_user_id = this.sql_users[0];
        })).toPromise();
    } catch (e) {
    }
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getSqlScriptsList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => this.getSqlScriptsList();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    await this.getSqlScriptsList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1);
  }

  onSqlScriptsRefresh = () => {
    this.getSqlScriptsList();
  }

  openSqlScriptModal = (modal_title: string) => {
    this.modalTitle = modal_title
    this.flag_openDialog = true
  }

  closeSqlScriptModal = () => {
    this.clearInputs();
    this.flag_openDialog = false;
  }

  onSqlScriptSubmit = async (form_values: any) => {
    let content = form_values.content;
    let autorun = form_values.autorun;
    let user_id = form_values.user_id.value;

    if(content=='') {
      this.validContent = this.input_content != '';
      return;
    }

    if(user_id==undefined) {
      this.validUserId = this.input_user_id.value != undefined;
      return;
    }

    await new Promise<void>(resolve => {
      this.api.createSqlScript({
        content: content,
        autorun: autorun,
        user_id: user_id
      }).subscribe(res => {
        resolve()
      });
    })

    this.showSuccess('Successfully created!');
    this.closeSqlScriptModal();
    this.getSqlScriptsList();
  }

  onOpenEditModal = async (event: Event, sql_script_id: number) => {
    this.clickedId = sql_script_id;
    this.api.getSqlScript(sql_script_id).subscribe(async res => {
      this.input_user_id = {name: res.user.username, value: res.user_id};
      this.input_content = res.content;
      this.input_autorun = res.autorun;

      this.openSqlScriptModal('Edit');
    })
  }

  editSqlScript = () => {
    if(this.input_content==''||this.input_user_id.value==undefined) {
      return;
    }
    this.api.updateSqlScript(this.clickedId, {
      content: this.input_content,
      autorun: this.input_autorun,
      user_id: this.input_user_id.value,
    }).subscribe(res => {
      this.showSuccess('Update succeeded!');
      this.closeSqlScriptModal();
      this.getSqlScriptsList();
    });
  }

  deleteSqlScript = (event: Event, sql_script_id: number) => {
    this.clickedId = sql_script_id;
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this item?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.api.deleteSqlScript(sql_script_id).subscribe(res => {
            this.showSuccess('Successfully deleted!')
            this.getSqlScriptsList();
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
    this.input_user_id = this.sql_users[0];
    this.validUserId = true;
    this.input_content = '';
    this.validContent = true;
    this.input_autorun = true;
  }

  onChangeUserName = () => {
    this.validUserId = this.input_user_id.value != undefined;
  }

  onInputContent = () => {
    this.validContent = this.input_content != '';
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
