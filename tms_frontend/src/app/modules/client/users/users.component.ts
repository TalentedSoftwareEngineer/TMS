import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ALL_FILTER_VALUE, ROWS_PER_PAGE_OPTIONS, PAGE_NO_PERMISSION_MSG, EMAIL_REG_EXP, rowsPerPageOptions, TIMEZONE } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {IUser, ICompany, IRole, ISomosUser} from "../../../models/user";
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  // users variables
  pageSize = 15
  pageIndex = 1
  filterName = ''
  filterValue = ''
  roleFilterValue = {name: 'All', value: ''}
  statusFilterValue = {name: 'All', value: ''}
  sortActive = 'id' //sortActive = {table field name}
  sortDirection = 'ASC'
  resultsLength = -1
  filterResultLength = -1;
  rowsPerPageOptions: any[] = rowsPerPageOptions
  isLoading = true
  noNeedRemoveColumn = true

  users: any[] = []
  companies: any[] = []
  roles: any[] = []
  timezones: any[] = TIMEZONE
  filter_roles: any[] = []
  filter_status: any[] = [
    {name: 'All', value: ''},
    {name: '✔︎ Active', value: true},
    {name: '✖︎ Inactive', value: false}
  ]
  sms_users: any[] = []

  noNeedEditColumn = false

  flag_openDialog = false

  //user items
  input_username: string|number|undefined|null = ''
  validUsername: boolean = true;
  input_company_id: any = ''
  input_role_id: any = ''
  input_timezone: any = ''
  input_email: string|number|undefined|null = ''
  validEmail: boolean = true;
  input_first_name: string|number|undefined|null = ''
  validFirstName: boolean = true;
  input_last_name: string|number|undefined|null = ''
  validLastName: boolean = true;
  input_password: string|number|undefined|null = ''
  validPassword: boolean = true;
  input_confirm_password: string|number|undefined|null = ''
  validConfirmPassword: boolean = true;
  input_somos_id: any = ''
  input_country: string|number|undefined|null = ''
  input_address: string|number|undefined|null = ''
  input_province: string|number|undefined|null = ''
  input_city: string|number|undefined|null = ''
  input_zip_code: string|number|undefined|null = ''
  input_tel1: string|number|undefined|null = ''
  input_tel2: string|number|undefined|null = ''
  input_mobile: string|number|undefined|null = ''
  input_fax: string|number|undefined|null = ''
  input_contact_name: string|number|undefined|null = ''
  input_contact_number: string|number|undefined|null = ''

  modalTitle = '';

  clickedId = -1;

  required = true;

  write_permission: boolean = false;
  authUserId = -1;

  allUsers: any[] = []

  constructor(
    public api: ApiService,
    public store: StoreService,
    private messageService: MessageService,
    private location: Location,
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

    if(this.store.getUser().permissions?.includes(PERMISSIONS.READ_USER)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }

    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.indexOf(PERMISSIONS.WRITE_USER) == -1)
        this.write_permission = false;
      else
        this.write_permission = true;

      this.authUserId = state.user.id;
    })

    await this.getAllUsers();
    this.getUsersList();
    this.getTotalUsersCount();
    this.getCompaniesList();
    this.getRolesList();
    this.getSMSUserList();
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  getAllUsers = async () => {
    await this.api.getUsersListForFilter()
    .pipe(tap(async (res: IUser[]) => {
      this.allUsers = res;
    })).toPromise();
  }

  getUsersList = async () => {
    this.isLoading = true;
    try {

      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')

      await this.api.getUsersList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue, this.roleFilterValue.value, this.statusFilterValue.value)
        .pipe(tap(async (usersRes: IUser[]) => {
          this.users = [];
          usersRes.map(u => {
            if(Boolean(this.store.getUser()?.timezone)) {
              // Timezone Time
              u.created_at = u.created_at ? moment(u.created_at).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
              u.updated_at = u.updated_at ? moment(u.updated_at).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
            } else {
              // Local time
              u.created_at = u.created_at ? moment(new Date(u.created_at)).format('MM/DD/YYYY h:mm:ss A') : '';
              u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('MM/DD/YYYY h:mm:ss A') : '';
            }
            // u.created_by = u.created_by ? this.getAuditionedUsername(u.created_by, username=>{u.created_by=username}) : '';
            // u.updated_by = u.updated_by ? this.getAuditionedUsername(u.updated_by, username=>u.updated_by=username) : '';
            u.created_by = u.created_by ? this.allUsers.find((item: any) => item.id==u.created_by)?.username : '';
            u.updated_by = u.updated_by ? this.allUsers.find((item: any) => item.id==u.updated_by)?.username  : '';
          });

          let allNotEditable = true
          for (let user of usersRes) {
            this.users.push(user)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getUserCount(filterValue, this.roleFilterValue.value, this.statusFilterValue.value).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalUsersCount = async () => {
    this.resultsLength = -1
    await this.api.getUserCount('', '', '').pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  getCompaniesList = async () => {
    try {
      await this.api.getCompaniesListForFilter()
        .pipe(tap(async (companiesRes: ICompany[]) => {
          this.companies = companiesRes.map(item=>{
            return this.createData(
              item.name,
              item.id
            );
          });
        })).toPromise();
    } catch (e) {
    }
  }

  getRolesList = async () => {
    try {
      await this.api.getRolesListForFilter()
        .pipe(tap(async (rolesRes: IRole[]) => {
          this.roles = rolesRes.map(item=>{
            return this.createData(
              item.name,
              item.id
            );
          });
          this.filter_roles = [{name: 'All', value: ''}, ...this.roles];
        })).toPromise();
    } catch (e) {
    }
  }

  getSMSUserList = async () => {
    try {
      await this.api.getSMSUserListForFilter()
        .pipe(tap(async (SMSUsersRes: ISomosUser[]) => {
          this.sms_users = SMSUsersRes.map(item=>{
            return this.createData(
              item.username,
              item.id
            );
          });
        })).toPromise();
    } catch (e) {
    }
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getUsersList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getUsersList();
  }

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getUsersList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1, event.rows);
  }

  openUserModal = (modal_title: string) => {
    this.modalTitle = modal_title
    this.flag_openDialog = true
  }

  closeUserModal = () => {
    this.clearInputs();
    this.flag_openDialog = false;
  }

  onUserSubmit = async () => {
    let username = this.input_username;
    let company_id = this.input_company_id?.value;
    let role_id = this.input_role_id?.value;
    let timezone = this.input_timezone;
    let email = this.input_email;
    let first_name = this.input_first_name;
    let last_name = this.input_last_name;
    let password = this.input_password;
    let confirm_password = this.input_confirm_password;
    let somos_id = this.input_somos_id?.value;
    let country = this.input_country;
    let address = this.input_address;
    let province = this.input_province;
    let city = this.input_city;
    let zip_code = this.input_zip_code;
    let tel1 = this.input_tel1;
    let tel2 = this.input_tel2;
    let mobile = this.input_mobile;
    let fax = this.input_fax;
    let contact_name = this.input_contact_name;
    let contact_number = this.input_contact_number;

    if(username=='') this.validUsername = false;
    if(email=='') this.validEmail = false;
    if(first_name=='') this.validFirstName = false;
    if(last_name=='') this.validLastName = false;
    if(password=='') this.validPassword = false;

    if(username==''||company_id==undefined||role_id==undefined||email==''||first_name==''||last_name==''||somos_id==undefined||password=='') {
      return;
    }

    if(!EMAIL_REG_EXP.test(String(this.input_email))) {
      this.validEmail = false;
      return;
    }

    if(password != confirm_password) {
      this.showWarn('Please confirm password');
      return;
    }

    await new Promise<void>(resolve => {
      this.api.createUser({
        username: username,
        company_id: company_id,
        role_id: role_id,
        timezone: timezone,
        email: email,
        first_name: first_name,
        last_name: last_name,
        password: password,
        somos_id: somos_id,
        country: country,
        address: address,
        province: province,
        city: city,
        zip_code: zip_code,
        tel1: tel1?.toString(),
        tel2: tel2?.toString(),
        mobile: mobile?.toString(),
        fax: fax?.toString(),
        contact_name: contact_name,
        contact_number: contact_number?.toString(),
      }).subscribe(res => {
        resolve()
      });
    })

    this.showSuccess('Successfully created!');
    this.closeUserModal();
    this.getUsersList();
    this.getTotalUsersCount();
  }

  viewUser = (event: Event, user_id: number) => {
    this.clickedId = user_id;

    this.api.updateUserStatus(user_id).subscribe(res => {
      this.showSuccess('User Status successfully updated!')
      this.getUsersList();
    })
  }

  onOpenEditModal = async (event: Event, user_id: number) => {
    this.clickedId = user_id;
    this.api.getUser(user_id).subscribe(async res => {
      this.input_username = res.username;
      this.input_company_id = {name: res.company?.name, value: res.company?.id};
      this.input_role_id = {name: res.role?.name, value: res.role?.id};
      this.input_timezone = res.timezone;
      this.input_email = res.email;
      this.input_first_name = res.first_name;
      this.input_last_name = res.last_name;
      this.input_somos_id = {name: res.somosUser?.username, value: res.somosUser?.id};
      this.input_country = res.userInfo?.country;
      this.input_address = res.userInfo?.address;
      this.input_province = res.userInfo?.province;
      this.input_city = res.userInfo?.city;
      this.input_zip_code = res.userInfo?.zip_code;
      this.input_tel1 = res.userInfo?.tel1;
      this.input_tel2 = res.userInfo?.tel2;
      this.input_mobile = res.userInfo?.mobile;
      this.input_fax = res.userInfo?.fax!=null?res.userInfo?.fax:'';
      this.input_contact_name = res.userInfo?.contact_name!=null?res.userInfo?.contact_name:'';
      this.input_contact_number = res.userInfo?.contact_number!=null?res.userInfo?.contact_number:'';

      this.openUserModal('Edit');
    })
  }

  deleteUser = (event: Event, user_id: number) => {
    this.clickedId = user_id;
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this user?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.api.deleteUserById(user_id).subscribe(res => {
            this.showSuccess('Successfully deleted!')
            this.getUsersList();
            this.getTotalUsersCount();
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
    this.input_company_id = undefined
    this.input_role_id = undefined
    this.input_timezone = ''
    this.input_email = ''
    this.input_first_name = ''
    this.input_last_name = ''
    this.input_password = ''
    this.input_confirm_password = ''
    this.input_somos_id = undefined
    this.input_country = ''
    this.input_address = ''
    this.input_province = ''
    this.input_city = ''
    this.input_zip_code = ''
    this.input_tel1 = ''
    this.input_tel2 = ''
    this.input_mobile = ''
    this.input_fax = ''
    this.input_contact_name = ''
    this.input_contact_number = ''
    this.validUsername = true;
    this.validEmail = true;
    this.validFirstName = true;
    this.validLastName = true;
    this.validPassword = true;
    this.validConfirmPassword = true
  }

  // get created_by username and updated_by username
  getAuditionedUsername = async (auditioned_id: number, callback: (username: string)=>void) => {
    this.api.getAuditionedUsername(auditioned_id).subscribe(async res => {
      callback(res.username);
    })
  }

  onInputEmail = () => {
    if(this.input_email!='' && EMAIL_REG_EXP.test(String(this.input_email))) {
      this.validEmail=true;
    } else {
      this.validEmail = false;
    }
  }

  onMainUpdate = async () => {
    let username = this.input_username;
    let company_id = this.input_company_id?.value;
    let role_id = this.input_role_id?.value;
    let timezone = this.input_timezone;
    let email = this.input_email;
    let first_name = this.input_first_name;
    let last_name = this.input_last_name;

    if(username=='') this.validUsername = false;
    if(email=='') this.validEmail = false;
    if(first_name=='') this.validFirstName = false;
    if(last_name=='') this.validLastName = false;

    if(username==''||company_id==undefined||role_id==undefined||email==''||first_name==''||last_name=='') {
      return;
    }

    if(!EMAIL_REG_EXP.test(String(this.input_email))) {
      this.validEmail = false;
      return;
    }

    await this.api.updateUserMain(this.clickedId, {
      username: username,
      email: email,
      first_name: first_name,
      last_name: last_name,
      company_id: company_id,
      role_id: role_id,
      timezone: timezone
    }).pipe(tap(res=>{
      this.showSuccess('Successfully Updated!');
      this.closeUserModal();
      this.getUsersList();
    })).toPromise();
  }

  mainReset = () => {
    this.api.getUser(this.clickedId).subscribe(async res => {
      this.input_username = res.username;
      this.input_company_id = {name: res.company?.name, value: res.company?.id};
      this.input_role_id = {name: res.role?.name, value: res.role?.id};
      this.input_timezone = res.timezone;
      this.input_email = res.email;
      this.input_first_name = res.first_name;
      this.input_last_name = res.last_name;
    })
  }

  onPasswordUpdate = async () => {
    let password = this.input_password;
    if(password=='') {
      this.validPassword = false;
      return;
    }

    if(password != this.input_confirm_password) {
      this.showWarn('Please confirm password');
      return;
    }

    if (this.input_confirm_password=="") {
      this.validConfirmPassword = false
      return
    }

    if (this.input_password!=this.input_confirm_password) {
      this.showWarn("Please confirm password.")
      return
    }

    await this.api.updateUserPassword(this.clickedId, {
      old_password: "",
      new_password: password
    }).pipe(tap(res=>{
      this.showSuccess('Successfully Updated!');
      this.closeUserModal();
      this.getUsersList();
    })).toPromise();
  }

  passwordReset = () => {
    this.input_password = ''
    this.input_confirm_password = ''

    this.validConfirmPassword = true
    this.validPassword = true
  }

  onSomosUpdate = async () => {
    let somos_id = this.input_somos_id?.value;

    await this.api.updateUserSomos(this.clickedId, {
      somos_id: somos_id
    }).pipe(tap(res=>{
      this.showSuccess('Successfully Updated!');
      this.closeUserModal();
      this.getUsersList();
    })).toPromise();
  }

  somosReset = () => {
    this.api.getUser(this.clickedId).subscribe(async res => {
      this.input_somos_id = {name: res.somosUser?.username, value: res.somosUser?.id};
    })
  }

  onAdditionalUpdate = async () => {
    let country = this.input_country;
    let address = this.input_address;
    let province = this.input_province;
    let city = this.input_city;
    let zip_code = this.input_zip_code;
    let tel1 = this.input_tel1?.toString();
    let tel2 = this.input_tel2?.toString();
    let mobile = this.input_mobile?.toString();
    let fax = this.input_fax?.toString();
    let contact_name = this.input_contact_name;
    let contact_number = this.input_contact_number?.toString();

    await this.api.updateUserAdditional(this.clickedId, {
      country: country,
      address: address,
      province: province,
      city: city,
      zip_code: zip_code,
      tel1: tel1,
      tel2: tel2,
      mobile: mobile,
      fax: fax,
      contact_name: contact_name,
      contact_number: contact_number,
    }).pipe(tap(res=>{
      this.showSuccess('Successfully Updated!');
      this.closeUserModal();
      this.getUsersList();
    })).toPromise();
  }

  AdditionalReset = () => {
    this.api.getUser(this.clickedId).subscribe(async res => {
      this.input_country = res.userInfo?.country;
      this.input_address = res.userInfo?.address;
      this.input_province = res.userInfo?.province;
      this.input_city = res.userInfo?.city;
      this.input_zip_code = res.userInfo?.zip_code;
      this.input_tel1 = res.userInfo?.tel1;
      this.input_tel2 = res.userInfo?.tel2;
      this.input_mobile = res.userInfo?.mobile;
      this.input_fax = res.userInfo?.fax!=null?res.userInfo?.fax:'';
      this.input_contact_name = res.userInfo?.contact_name!=null?res.userInfo?.contact_name:'';
      this.input_contact_number = res.userInfo?.contact_number!=null?res.userInfo?.contact_number:'';
    })
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
