import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { PAGE_NO_PERMISSION_MSG, PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, rowsPerPageOptions, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {IUser} from "../../../models/user";
import { async } from '@angular/core/testing';
import { PERMISSIONS } from 'src/app/consts/permissions';
import {Router} from "@angular/router";
import {ROUTES} from "../../../app.routes";

@Component({
  selector: 'app-id-ro',
  templateUrl: './id-ro.component.html',
  styleUrls: ['./id-ro.component.scss']
})
export class IdRoComponent implements OnInit {

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

  id_ros: any[] = []

  noNeedEditColumn = false

  flag_openDialog = false

  //id_ro input items
  input_ro: string|undefined|null|number = ''
  validInputRo: boolean = true;

  modalTitle = '';

  clickedId = -1;

  createdBy_username = ''
  updatedBy_username = ''

  write_permission: boolean = false;

  constructor(
    public router: Router,
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

    // this.store.state$.subscribe(async (state)=> {

    // })

    if(this.store.getUser().permissions?.includes(PERMISSIONS.READ_ID_RO)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }

    if(this.store.getUser().permissions?.indexOf(PERMISSIONS.WRITE_ID_RO) == -1)
      this.write_permission = false;
    else
      this.write_permission = true;

    this.getIdRosList();
    this.getTotalIdRosCount();
  }

  getIdRosList = async () => {
    this.isLoading = true;
    try {

      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')

      await this.api.getIdRosList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue)
        .pipe(tap(async (id_rosRes: IUser[]) => {
          this.id_ros = [];
          id_rosRes.map(u => {
            u.created_at = u.created_at ? moment(new Date(u.created_at)).format('MM/DD/YYYY h:mm:ss A') : '';
            u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('MM/DD/YYYY h:mm:ss A') : '';
            u.created_by = u.created_by ? this.getAuditionedUsername(u.created_by, username=>u.created_by=username) : '';
            u.updated_by = u.updated_by ? this.getAuditionedUsername(u.updated_by, username=>u.updated_by=username) : '';
          });

          let allNotEditable = true
          for (let id_ro of id_rosRes) {
            this.id_ros.push(id_ro)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getUserCount(filterValue, '', '').pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalIdRosCount = async () => {
    this.resultsLength = -1
    await this.api.getUserCount('', '', '').pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getIdRosList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getIdRosList();
  }

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getIdRosList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1, event.rows);
  }

  openIdRoModal = (modal_title: string) => {
    this.modalTitle = modal_title
    this.flag_openDialog = true
  }

  closeIdRoModal = () => {
    this.clearInputs();
    this.flag_openDialog = false;
  }

  onOpenEditModal = async (event: Event, id_ro_id: number) => {
    this.clickedId = id_ro_id;
    this.api.getUser(id_ro_id).subscribe(async res => {
      this.input_ro = res.ro;

      this.openIdRoModal('Edit');
    })
  }

  editIdRo = () => {
    this.api.updateIdRo(this.clickedId, {
      ro: this.input_ro,
    }).subscribe(res => {
      this.showSuccess('ID&RO update succeeded!');
      this.closeIdRoModal();
      this.getIdRosList();
    });
  }

  deleteIdRo = (event: Event, id_ro_id: number) => {
    this.clickedId = id_ro_id;
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this item?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          // this.api.deleteIdRoById(id_ro_id).subscribe(res => {
          //   this.showSuccess('Successfully deleted!')
          //   this.getIdRosList();
          // })
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
    this.input_ro = ''
    this.validInputRo = true;
  }

  getAuditionedUsername = async (auditioned_id: number, callback: (username: string) =>void) => {
    this.api.getAuditionedUsername(auditioned_id).subscribe(async res => {
      callback(res.username);
    })
  }

  onInputRo = () => {
    this.validInputRo = this.input_ro != '';
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
