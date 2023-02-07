import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { TMSUserType, NoPermissionAlertInteral, PERMISSION_TYPE_DENY, PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import { IRole, IPrivilege } from "../../../models/user";
import { GuiVisibility } from '../../../models/gui';
import { PERMISSIONS } from 'src/app/consts/permissions';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  // roles variables
  pageSize = 15
  pageIndex = 1
  roles: any[] = []
  privileges: any[] = []
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

  //role items
  input_name: string|undefined|null = ''
  validRoleName: boolean = true;
  input_description: string|undefined|null = ''

  checked_privileges: any[] = [];

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

    if(this.store.getUser().permissions?.indexOf(PERMISSIONS.WRITE_ROLE) == -1)
      this.write_permission = false;
    else
      this.write_permission = true;

    this.getPrivilegesList();
    this.getTotalRolesCount();
    this.getRolesList();
  }
  
  getPrivilegesList = async () => {
    this.api.getPrivilegesList().subscribe(res => {
      this.privileges = res;
    });

    // this.api.getPrivilege(4).subscribe(res => {

    // });
  }

  getRolesList = async () => {
    this.isLoading = true;
    try {

      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')

      await this.api.getRolesList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue)
        .pipe(tap(async (rolesRes: IRole[]) => {
          this.roles = [];
          rolesRes.map(u => u.created_at = u.created_at ? moment(new Date(u.created_at)).format('YYYY/MM/DD h:mm:ss A') : '');
          rolesRes.map(u => u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '');

          let allNotEditable = true
          for (let role of rolesRes) {
            this.roles.push(role)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getRoleCount(filterValue, {})
      .pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalRolesCount = async () => {
    this.resultsLength = -1
    await this.api.getRoleCount('', {})
    .pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getRolesList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => this.getRolesList();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    await this.getRolesList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1);
  }

  openRoleModal = (modal_title: string) => {
    this.modalTitle = modal_title
    this.flag_openDialog = true
  }

  closeRoleModal = () => {
    this.clearInputs();
    this.flag_openDialog = false;
  }

  onRoleSubmit = async (form_values: any) => {
    let name = form_values.name;
    let description = form_values.description;
    
    if(name=='') {
      this.validRoleName = false;
      return;
    }

    await new Promise<void>(resolve => {
      this.api.createRole({
        name: name,
        description: description,
        privileges: this.checked_privileges
      }).subscribe(res => {
        resolve()
      });
    })

    this.showSuccess('Role successfully created!');
    this.closeRoleModal();
    this.getRolesList();
  }

  onOpenViewModal = (event: Event, role_id: number) => {
    this.clickedId = role_id;
    this.api.getRole(role_id).subscribe(async res => {
      this.input_name = res.name;
      this.input_description = res.description;

      if(res.rolePrivileges != undefined) {
        this.checked_privileges = res.rolePrivileges.map(item=>item.privilege_id);
      } else {this.checked_privileges = []}

      this.openRoleModal('View');
    })
  }

  onOpenEditModal = async (event: Event, role_id: number) => {
    this.clickedId = role_id;
    this.api.getRole(role_id).subscribe(async res => {
      this.input_name = res.name;
      this.input_description = res.description;

      if(res.rolePrivileges != undefined) {
        this.checked_privileges = res.rolePrivileges.map(item=>item.privilege_id);
      } else {this.checked_privileges = []}

      this.openRoleModal('Edit');
    })
  }

  editRole = () => {
    if(this.input_name == '') {
      this.validRoleName = false;
      return;
    }
    this.api.updateRole(this.clickedId, {
      name: this.input_name,
      description: this.input_description,
      privileges: this.checked_privileges
    }).subscribe(res => {
      this.showSuccess('Role update succeeded!');
      this.closeRoleModal();
      this.getRolesList();
    });
  }

  deleteRole = (event: Event, role_id: number) => {
    this.clickedId = role_id;
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this role?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteRoleById(role_id).subscribe(res => {
          this.showSuccess('Role successfully deleted!');
          this.getRolesList();
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
    this.checked_privileges = [];
    this.input_name = ''
    this.validRoleName = true;
    this.input_description = ''
  }

  onChangePrivileges = (event: any, privilege: any) => {
    if(privilege.is_admin) {
      if(event.target.checked) {
        this.checked_privileges.push(privilege.id);
      } else {
        this.removeCheckedPrivilege(privilege.id);
        if(privilege.name.toLowerCase().includes('read')) {
          this.removeCheckedPrivilege(privilege.id+1);
        }
      }
    } else {
      if(event.target.checked) {
        this.checked_privileges.push(privilege.id);
      } else {
        this.removeCheckedPrivilege(privilege.id);
      }
    }
  }

  removeCheckedPrivilege = (id: number) => {
    let removed_index = this.checked_privileges.findIndex(item=>item==id);
    if(removed_index > -1) {
      this.checked_privileges.splice(removed_index, 1);
    }
  }

  isCheckedPrivilege = (id: number) => {
    let test_item = this.checked_privileges.find(item=>item==id);
    if(test_item != undefined) {
      return true;
    } else {
      return false;
    }
  }

  isDidabled = (privilege: any) => {
    let disabled = false;
    if(privilege.is_admin) {
      if(privilege.name.toLowerCase().includes('write')) {
        if(!this.isCheckedPrivilege(privilege.id-1)) {
          disabled = true;
        }
      }
    }
    return disabled;
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
