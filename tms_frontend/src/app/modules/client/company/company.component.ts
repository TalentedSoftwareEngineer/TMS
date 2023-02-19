import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { TMSUserType, NoPermissionAlertInteral, PERMISSION_TYPE_DENY, PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ALL_FILTER_VALUE, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {ICompany} from "../../../models/user";
import { GuiVisibility } from '../../../models/gui';
import { PERMISSIONS } from 'src/app/consts/permissions';
import {Router} from "@angular/router";
import {ROUTES} from "../../../app.routes";

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  // users variables
  pageSize = 15
  pageIndex = 1
  companies: any[] = []
  filter_status: any[] = [
    {name: 'All', value: ''},
    {name: '✔︎ Active', value: true},
    {name: '✖︎ Inactive', value: false}
  ]
  filterName = ''
  filterValue = ''
  statusFilterValue = {name: 'All', value: ''}
  sortActive = 'id'
  sortDirection = 'ASC'
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any[] = ROWS_PER_PAGE_OPTIONS
  noNeedRemoveColumn = true

  noNeedEditColumn = false

  flag_openDialog = false

  //company items
  input_name: string|undefined|null = ''
  validName: boolean = true;
  input_code: string|undefined|null = ''
  validCode: boolean = true;
  input_role_code: string|undefined|null = ''
  validRoleCode: boolean = true;
  input_resp_org_id: string|undefined|null = ''
  validRespOrgId: boolean = true;
  input_company_email: string|undefined|null = ''
  validCompanyEmail: boolean = true;
  input_address: string|undefined|null = ''
  input_city: string|undefined|null = ''
  input_state: string|undefined|null = ''
  input_zip_code: string|undefined|null = ''
  input_first_name: string|undefined|null = ''
  validFirstName: boolean = true;
  input_last_name: string|undefined|null = ''
  validLastName: boolean = true;
  input_contact_email: string|undefined|null = ''
  input_contact_phone: string|undefined|null = ''
  input_ro_id: string|undefined|null = ''
  validRoId: boolean = true;

  modalTitle = '';

  clickedId = -1;

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

    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.READ_COMPANY)) {
      } else {
        // no permission
        this.showWarn("You have no permission for this page")
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }

      if(state.user.permissions?.indexOf(PERMISSIONS.WRITE_COMPANY) == -1)
        this.write_permission = false;
      else
        this.write_permission = true;
    })

    this.getCompaniesList();
    this.getTotalCompaniesCount();
  }

  getCompaniesList = async () => {
    this.isLoading = true;
    try {

      let filterValue = this.filterValue.replace('(', '').replace('-', '').replace(') ', '').replace(')', '')

      // if (this.store.getUserType() != TMSUserType.superAdmin) {
      //   if (filterValue != '')
      //     filterValue += ','
      //   filterValue += 'customerId:"' + this.store.getUser().customerId + '"'
      // }

      // tslint:disable-next-line: max-line-length
      await this.api.getCompaniesList(this.sortActive, this.sortDirection, this.pageIndex, this.pageSize, filterValue, this.statusFilterValue.value)
        .pipe(tap(async (companiesRes: ICompany[]) => {
          this.companies = [];
          companiesRes.map(u => {
            u.created_at = u.created_at ? moment(new Date(u.created_at)).format('YYYY/MM/DD h:mm:ss A') : '';
            u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '';
          });

          let allNotEditable = true
          for (let company of companiesRes) {
            this.companies.push(company)
          }

          this.noNeedEditColumn = allNotEditable

        })).toPromise();

      this.filterResultLength = -1
      await this.api.getCompanyCount(filterValue, this.statusFilterValue.value).pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
    } catch (e) {
    } finally {
      setTimeout(() => this.isLoading = false, 1000);
    }
  }

  getTotalCompaniesCount = async () => {
    this.resultsLength = -1
    await this.api.getCompanyCount('', '').pipe(tap( res => {
      this.resultsLength = res.count
    })).toPromise();
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getCompaniesList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => this.getCompaniesList();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    await this.getCompaniesList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1);
  }

  openCompanyModal = (modal_title: string) => {
    this.modalTitle = modal_title
    this.flag_openDialog = true
  }

  closeCompanyModal = () => {
    this.clearInputs();
    this.flag_openDialog = false;
  }

  onCompanySubmit = async (form_values: any) => {
    let name = form_values.name;
    let role_code = form_values.role_code;
    let company_email = form_values.company_email;
    let city = form_values.city;
    let zip_code = form_values.zip_code;
    let code = form_values.code;
    let resp_org_id = form_values.resp_org_id;
    let address = form_values.address;
    let state = form_values.state;
    let first_name = form_values.first_name;
    let contact_email = form_values.contact_email;
    let ro_id = form_values.ro_id;
    let last_name = form_values.last_name;
    let contact_phone = form_values.contact_phone;

    if(name=='') this.validName = false;
    if(code=='') this.validCode = false;
    if(resp_org_id=='') this.validRespOrgId = false;
    if(role_code=='') this.validRoleCode = false;
    if(company_email=='') this.validCompanyEmail = false;
    if(first_name=='') this.validFirstName = false;
    if(last_name=='') this.validLastName = false;
    if(ro_id=='') this.validRoId = false;

    if(name==''||code==''||resp_org_id==''||role_code==''||company_email==''||first_name==''||last_name==''||ro_id=='') {
      return;
    }

    await new Promise<void>(resolve => {
      this.api.createCompany({
        name: name,
        role_code: role_code,
        company_email: company_email,
        city: city,
        zip_code: zip_code,
        code: code,
        resp_org_id: resp_org_id,
        address: address,
        state: state,
        first_name: first_name,
        contact_email: contact_email,
        ro_id: ro_id,
        last_name: last_name,
        contact_phone: contact_phone,
      }).subscribe(res => {
        resolve()
      });
    })

    this.showSuccess('Company successfully created!');
    this.closeCompanyModal();
    this.getCompaniesList();
  }

  viewCompany = (event: Event, company_id: number) => {
    this.clickedId = company_id;

    this.api.updateComapnyStatus(company_id).subscribe(res => {
      this.showSuccess('Company Status successfully updated!')
      this.getCompaniesList();
    })
  }

  onOpenEditModal = async (event: Event, company_id: number) => {
    this.clickedId = company_id;
    this.api.getCompany(company_id).subscribe(async res => {
      this.input_name = res.name;
      this.input_code = res.code;
      this.input_role_code = res.role_code;
      this.input_resp_org_id = res.resp_org_id;
      this.input_company_email = res.company_email;
      this.input_address = res.address;
      this.input_city = res.city;
      this.input_state = res.state;
      this.input_zip_code = res.zip_code;
      this.input_first_name = res.first_name;
      this.input_last_name = res.last_name;
      this.input_contact_email = res.contact_email;
      this.input_contact_phone = res.contact_phone;
      this.input_ro_id = res.ro_id;

      this.openCompanyModal('Edit');
    })
  }

  editCompany = () => {
    if(this.input_name=='') this.validName = false;
    if(this.input_code=='') this.validCode = false;
    if(this.input_resp_org_id=='') this.validRespOrgId = false;
    if(this.input_role_code=='') this.validRoleCode = false;
    if(this.input_company_email=='') this.validCompanyEmail = false;
    if(this.input_first_name=='') this.validFirstName = false;
    if(this.input_last_name=='') this.validLastName = false;
    if(this.input_ro_id='') this.validRoId = false;
    if(this.input_name==''||this.input_code==''||this.input_resp_org_id==''||this.input_role_code==''||this.input_company_email==''||this.input_first_name==''||this.input_last_name==''||this.input_ro_id=='') {
      return;
    }
    this.api.updateCompany(this.clickedId, {
      name: this.input_name,
      role_code: this.input_role_code,
      company_email: this.input_company_email,
      city: this.input_city,
      zip_code: this.input_zip_code,
      code: this.input_code,
      resp_org_id: this.input_resp_org_id,
      address: this.input_address,
      state: this.input_state,
      first_name: this.input_first_name,
      contact_email: this.input_contact_email,
      ro_id: this.input_ro_id,
      last_name: this.input_last_name,
      contact_phone: this.input_contact_phone,
    }).subscribe(res => {
      this.showSuccess('Company update succeeded!');
      this.closeCompanyModal();
      this.getCompaniesList();
    });
  }

  deleteCompany = (event: Event, company_id: number) => {
    this.clickedId = company_id;
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this company?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.api.deleteCompanyById(company_id).subscribe(res => {
            this.showSuccess('Company successfully deleted!')
            this.getCompaniesList();
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
    this.input_name = ''
    this.validName = true;
    this.input_code = ''
    this.validCode = true;
    this.input_role_code = ''
    this.validRoleCode = true;
    this.input_resp_org_id = ''
    this.validRespOrgId = true;
    this.input_company_email = ''
    this.validCompanyEmail = true;
    this.input_address = ''
    this.input_city = ''
    this.input_state = ''
    this.input_zip_code = ''
    this.input_first_name = ''
    this.validFirstName = true;
    this.input_last_name = ''
    this.validLastName = true;
    this.input_contact_email = ''
    this.input_contact_phone = ''
    this.input_ro_id = ''
    this.validRoId = true;
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
