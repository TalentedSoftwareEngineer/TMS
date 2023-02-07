import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { TMSUserType, NoPermissionAlertInteral, PERMISSION_TYPE_DENY, PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {ISomosUser} from "../../../models/user";
import { GuiVisibility } from '../../../models/gui';
import { PERMISSIONS } from 'src/app/consts/permissions';

@Component({
  selector: 'app-somos-user',
  templateUrl: './somos-user.component.html',
  styleUrls: ['./somos-user.component.scss']
})
export class SomosUserComponent implements OnInit {

  // users variables
  pageSize = 15
  pageIndex = 1
  somos_users: any[] = []
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

  flag_openDialog = false

  //somos user items
  input_username: any = undefined
  input_password: any = undefined
  input_client_key: string|undefined|null = ''
  input_client_password: string|undefined|null = ''

  modalTitle = '';

  clickedId = -1;

  write_permission: boolean = false;

  constructor(
    public api: ApiService,
    public store: StoreService,
    private messageService: MessageService,
    private location: Location,
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

    if(this.store.getUser().permissions?.indexOf(PERMISSIONS.WRITE_SOMOS_USER) == -1)
      this.write_permission = false;
    else
      this.write_permission = true;

    this.getSMSUserList();
    this.getTotalSMSUserCount();
  }

  getSMSUserList = async () => {
    this.isLoading = true;
    try {

      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')

      await this.api.getSMSUserList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue)
        .pipe(tap(async (SMSUsersRes: ISomosUser[]) => {
          this.somos_users = [];
          SMSUsersRes.map(u => u.created_at = u.created_at ? moment(new Date(u.created_at)).format('YYYY/MM/DD h:mm:ss A') : '');
          SMSUsersRes.map(u => u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '');

          let allNotEditable = true
          for (let somos_user of SMSUsersRes) {
            this.somos_users.push(somos_user)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getSMSUserCount(filterValue, {}).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalSMSUserCount = async () => {
    this.resultsLength = -1
    await this.api.getSMSUserCount('', {}).pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getSMSUserList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => this.getSMSUserList();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    await this.getSMSUserList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1);
  }

  openSMSUserModal = (modal_title: string) => {
    this.modalTitle = modal_title
    this.flag_openDialog = true
  }

  closeSMSUserModal = () => {
    this.clearInputs();
    this.flag_openDialog = false;
  }

  onSMSUserSubmit = async (form_values: any) => {
    let username = form_values.username;
    let password = form_values.password;
    let client_key = form_values.client_key;
    let client_password = form_values.client_password;

    if(this.input_username==''||this.input_username==undefined) {
      this.input_username = '';
    }

    if(this.input_password==''||this.input_password==undefined) {
      this.input_password = '';
    }

    if(
      !/^([^]{6,8})$/.test(this.input_username) ||
      !/^((?=.*[a-zA-Z])(?=.*[0-9@!#$%&'()*+,-.:;<=>?_`{}]).{6,20})$/.test(this.input_password)
    ) {
      return;
    }

    await new Promise<void>(resolve => {
      this.api.createSMSUser({
        username: username,
        password: password,
        // client_key: client_key,
        // client_password: client_password,
      }).subscribe(res => {
        resolve()
      });
    })

    this.showSuccess('Somos User successfully created!');
    this.closeSMSUserModal();
    this.getSMSUserList();
  }

  onOpenEditModal = async (event: Event, smsUser_id: number) => {
    this.clickedId = smsUser_id;
    this.api.getSMSUser(smsUser_id).subscribe(async res => {
      this.input_username = res.username;
      this.input_password = res.password;
      this.input_client_key = res.client_key;
      this.input_client_password = res.client_password;

      this.openSMSUserModal('Edit');
    })
  }

  editSMSUser = () => {
    
    if(
      !/^([^]{6,8})$/.test(this.input_username) ||
      !/^((?=.*[a-zA-Z])(?=.*[0-9@!#$%&'()*+,-.:;<=>?_`{}]).{6,20})$/.test(this.input_password)
    ) {
      return;
    }

    this.api.updateSMSUser(this.clickedId, {
      username: this.input_username,
      password: this.input_password,
      // client_key: this.input_client_key == null ? '' : this.input_client_key,
      // client_password: this.input_client_password == null ? '' : this.input_client_password,
    }).subscribe(res => {
      this.showSuccess('Somos User update succeeded!');
      this.closeSMSUserModal();
      this.getSMSUserList();
    });
  }

  deleteSMSUser = (event: Event, SMSUser_id: number) => {
    this.clickedId = SMSUser_id;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this Somos User?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteSMSUserById(SMSUser_id).subscribe(res => {
          this.showSuccess('Somos User successfully deleted!')
          this.getSMSUserList();
        })
      },
      reject: (type: any) => {
          switch(type) {
              case ConfirmEventType.REJECT:
                // this.showInfo('Rejected');
                break;
              case ConfirmEventType.CANCEL:
                // this.showInfo('Cancelled');
                break;
          }
      }
    });
  }

  clearInputs = () => {
    this.input_username = undefined
    this.input_password = undefined
    this.input_client_key = ''
    this.input_client_password = ''
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
