import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../../services/api/api.service";
import {StoreService} from "../../../services/store/store.service";
import { PERMISSION_TYPE_ALL, PERMISSION_TYPE_READONLY, ALL_FILTER_VALUE, NUM_REG_EXP } from '../../constants';
import { tap } from "rxjs/operators";
import moment from 'moment';
import {IUser, ITaskTracking, IRetrieveRespOrg} from "../../../models/user";
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-resp-org',
  templateUrl: './resp-org.component.html',
  styleUrls: ['./resp-org.component.scss']
})
export class RespOrgComponent implements OnInit {
  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  pageSize = 15
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sortActive = ''
  sortDirection = ''
  resultsLength = -1
  isLoading = true
  noNeedRemoveColumn = true
  noNeedEditColumn = false

  activeTabIndex: number = 0;

  resp_org_ids: any[] = [];
  resp_org_entities: any[] = [];

  input_resp_org_id = {name: '1AXXX', value: '1AXXX'}
  input_resp_org_entity = {name: '0A', value: '0A'}
  input_toll_free_num: string = ''
  validPhoneNumber: boolean = NUM_REG_EXP.test(this.input_toll_free_num);

  entity_information: any[] = [];

  resp_orgs: any[] = [];

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

    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.RESP_ORG_INFORMATION)) {
      } else {
        // no permission
        this.showWarn("You have no permission for this page")
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

    this.getRespOrgUnitList();
    this.getRespOrgEntitiesList();
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  getRespOrgUnitList = async () => {
    try {
      await this.api.getRespOrgUnitList()
        .pipe(tap(async (res: any[]) => {
          this.resp_org_ids = res.map(item=>{
            return this.createData(
              item.respOrgId,
              item.status
            );
          });
        })).toPromise();
    } catch (e) {
    }
  }

  getRespOrgEntitiesList = async () => {
    try {
      await this.api.getRespOrgEntitiesList()
        .pipe(tap(async (res: any[]) => {
          this.resp_org_entities = res.map(item=>{
            return this.createData(
              item.respOrgEntity,
              item.respOrgEntity
            );
          });
        })).toPromise();
    } catch (e) {
    }
  }

  getResultRetrieveRespOrgByUnit = async () => {
    if(this.input_resp_org_id.name==''||this.input_resp_org_id.name==undefined) {
      return;
    }
    try {
      await this.api.getResultRetrieve('unit', this.input_resp_org_id.name)
        .pipe(tap(async (res: IRetrieveRespOrg) => {
          this.entity_information = [
            {
              respOrgEntity: res.respOrgEntity,
              companyName: res.companyName,
              emailId: res.emailId,
              contactPhone: res.contactPhone,
            }
          ];
          this.resp_orgs = res.associatedRespOrgs;
        })).toPromise();
    } catch (e) {
    }
  }

  getResultRetrieveRespOrgByEntity = async () => {
    if(this.input_resp_org_entity.name==''||this.input_resp_org_entity.name==undefined) {
      return;
    }
    try {
      await this.api.getResultRetrieve('entity', this.input_resp_org_entity.name)
        .pipe(tap(async (res: IRetrieveRespOrg) => {
          this.entity_information = [
            {
              respOrgEntity: res.respOrgEntity,
              companyName: res.companyName,
              emailId: res.emailId,
              contactPhone: res.contactPhone,
            }
          ];
          this.resp_orgs = res.associatedRespOrgs;
        })).toPromise();
    } catch (e) {
    }
  }

  getResultRetrieveRespOrgByNumber = async () => {
    this.validPhoneNumber = NUM_REG_EXP.test(this.input_toll_free_num);
    if(!NUM_REG_EXP.test(this.input_toll_free_num)) {
      return;
    }
    try {
      await this.api.getResultRetrieve('number', this.input_toll_free_num)
        .pipe(tap(async (res: IRetrieveRespOrg) => {
          this.entity_information = [
            {
              respOrgEntity: res.respOrgEntity,
              companyName: res.companyName,
              emailId: res.emailId,
              contactPhone: res.contactPhone,
            }
          ];
          this.resp_orgs = res.associatedRespOrgs;
        })).toPromise();
    } catch (e) {
    }
  }

  onRetrieve = () => {
    switch(this.activeTabIndex) {
      case 0:
        //Search Resp Org ID
        this.getResultRetrieveRespOrgByUnit();
        break;
      case 1:
        //Search Resp Org Entity
        this.getResultRetrieveRespOrgByEntity();
        break;
      case 2:
        //Search Toll-Free Number
        this.getResultRetrieveRespOrgByNumber();
        break;
    }
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    // await this.getTasksList();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  // onClickFilter = () => this.getTasksList();

  onPagination = async (pageIndex: any) => {
    const totalPageCount = Math.ceil(this.resultsLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    if (pageIndex === this.pageIndex) {return;}
    this.pageIndex = pageIndex;
    // await this.getTasksList();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1);
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
