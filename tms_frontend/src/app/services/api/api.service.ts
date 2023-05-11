import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {StoreService} from "../store/store.service";
import {HttpClient} from "@angular/common/http";
import {IUser, IAuditionedUser, IUserLogin, IUserToken, IRole, ICompany, ISomosUser, IPrivilege, ISqlUser, ISqlScript, IScriptResults, IUserActivities, ITaskTracking, IRetrieveRespOrg} from "../../models/user";
import {Observable} from "rxjs";
import {map, tap} from "rxjs/operators";
import { getFilter, userKeys, getCountWhere } from '../../helper/utils'
import { TASK_FILTER_FILEDS } from 'src/app/modules/constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private coreApi: string;

  constructor(private http: HttpClient, private store: StoreService) {
    this.coreApi = environment.base_uri;
  }

  test(): Observable<any> {
    const url = `${this.coreApi}/test/import`;
    return this.http.post<any>(url, {});
  }

  public login(data: IUserLogin, rememberedIf: boolean): Observable<object> {
    return this.http.post<IUserToken>(`${this.coreApi}/authenticate`, data).pipe(
      tap(token => this.store.storeToken({ ...token, rememberedIf })),
      map(token => token)
    );
  }

  public logout(): Observable<any> {
    return this.http.post(`${this.coreApi}/de-authorization`, null);
  }

  public retrieveLoggedUserOb(token: IUserToken): Observable<IUser> {
    return this.getCurrentUser().pipe(tap(user => {
      // @ts-ignore
      const u = user.user;
      u.company = user.company;
      u.somos = user.somos;
      u.uiSettings = "{}";
      u.permissions = user.permissions;
      this.store.storeUser(u);
    }));
  }

  getCurrentUser(): Observable<IUser> {
    const url = `${this.coreApi}/authorization`;
    return this.http.get<IUser>(url);
  }

  //Dashboard
  getConfigNewsEvent(): Observable<any> {
    const url = `${this.coreApi}/configurations/news_event`;
    return this.http.get<any>(url);
  }

  updateConfigNewsEvent(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/configurations/news_event`, data);
  }

  dashboard(): Observable<any> {
    return this.http.get<any>(`${this.coreApi}/dashboard/statistics`);
  }

  //Company APIs
  getCompaniesList(active: string, direction: string, page: number, size: number, filterValue: string, statusFilterValue: any): Observable<ICompany[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      statusFilter: `${statusFilterValue}`,
    }).toString();
    const url = `${this.coreApi}/companies?${parametersQuery}`;
    return this.http.get<ICompany[]>(url);
  }

  getCompaniesListForFilter(): Observable<ICompany[]> {
    const url = `${this.coreApi}/companies/for_filter`;
    return this.http.get<ICompany[]>(url);
  }

  getCompanyCount(filterValue: string, statusFilterValue: any): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`,
      statusFilter: `${statusFilterValue}`,
    }).toString();
    return this.http.get<any>(`${this.coreApi}/companies/count?${parametersQuery}`);
  }

  createCompany(data: any): Observable<ICompany> {
    return this.http.post<ICompany>(`${this.coreApi}/companies`, data);
  }

  getCompany(id: number): Observable<ICompany> {
    const url = `${this.coreApi}/companies/${id}`;
    return this.http.get<ICompany>(url);
  }

  updateComapnyStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/companies/${id}/status`, {});
  }

  updateCompany(id: number, data: any): Observable<ICompany> {
    return this.http.patch<ICompany>(`${this.coreApi}/companies/${id}`, data);
  }

  deleteCompanyById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/companies/${id}`);
  }

  //Somos User APIs
  getSMSUserList(active: string, direction: string, page: number, size: number, filterValue: string): Observable<ISomosUser[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`
    }).toString();
    const url = `${this.coreApi}/somos-users?${parametersQuery}`;
    return this.http.get<ISomosUser[]>(url);
  }

  getSMSUserListForFilter(): Observable<ISomosUser[]> {
    const url = `${this.coreApi}/somos-users/for_filter`;
    return this.http.get<ISomosUser[]>(url);
  }

  getSMSUserCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/somos-users/count?${parametersQuery}`);
  }

  createSMSUser(data: any): Observable<ISomosUser> {
    return this.http.post<ISomosUser>(`${this.coreApi}/somos-users`, data);
  }

  getSMSUser(id: number): Observable<ISomosUser> {
    const url = `${this.coreApi}/somos-users/${id}`;
    return this.http.get<ISomosUser>(url);
  }

  updateSMSUser(id: number, data: any): Observable<ISomosUser> {
    return this.http.patch<ISomosUser>(`${this.coreApi}/somos-users/${id}`, data);
  }

  deleteSMSUserById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/somos-users/${id}`);
  }

  //Privileges APIs
  getPrivilegesList(): Observable<IPrivilege[]> {
    const url = `${this.coreApi}/privileges`;
    return this.http.get<IPrivilege[]>(url);
  }

  getPrivilege(id: number): Observable<IPrivilege> {
    const url = `${this.coreApi}/privileges/${id}`;
    return this.http.get<IPrivilege>(url);
  }

  //Roles APIs
  getRolesList(active: string, direction: string, page: number, size: number, filterValue: string): Observable<IRole[]> {
    // const filter = getFilter(active, direction, size, page, filterValue, null, null, [
    //   'name',
    //   'description',
    // ]);
    // const url = `${this.coreApi}/roles?${filter !== 'filter=' ? filter + '&' : ''}`;
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`
    }).toString();
    const url = `${this.coreApi}/roles?${parametersQuery}`;
    return this.http.get<IRole[]>(url);
  }

  getRolesListForFilter(): Observable<IRole[]> {
    const url = `${this.coreApi}/roles/for_filter`;
    return this.http.get<IRole[]>(url);
  }

  getRoleCount(filterValue: string, customerFilter?: any): Observable<any> {
    // const whereParam = getCountWhere(filterValue, '', '', ['name','description'], customerFilter);
    // return this.http.get<any>(`${this.coreApi}/roles/count?${'where=' + whereParam}`);
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/roles/count?${parametersQuery}`);
  }

  createRole(data: any): Observable<IRole> {
    return this.http.post<IRole>(`${this.coreApi}/roles`, data);
  }

  getRole(id: number): Observable<IRole> {
    const url = `${this.coreApi}/roles/${id}`;
    return this.http.get<IRole>(url);
  }

  updateRole(id: number, data: any): Observable<IRole> {
    return this.http.patch<IRole>(`${this.coreApi}/roles/${id}`, data);
  }

  deleteRoleById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/roles/${id}`);
  }

  //UserController APIs
  getIdRosList(active: string, direction: string, page: number, size: number, filterValue: string): Observable<IUser[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`
    }).toString();
    const url = `${this.coreApi}/users/id_ro?${parametersQuery}`;
    return this.http.get<IUser[]>(url);
  }

  getUserCount(filterValue: string, roleIdFilterValue: any, statusFilterValue: any): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`,
      roleFilterId: `${roleIdFilterValue}`,
      statusFilter: `${statusFilterValue}`,
    }).toString();
    return this.http.get<any>(`${this.coreApi}/users/count?${parametersQuery}`);
  }

  getUser(id: number): Observable<IUser> {
    const url = `${this.coreApi}/users/${id}`;
    return this.http.get<IUser>(url);
  }

  getAuditionedUsername(id: number): Observable<IAuditionedUser> {
    const url = `${this.coreApi}/users/${id}/auditioned`;
    return this.http.get<IAuditionedUser>(url);
  }

  updateIdRo(id: number, data: any): Observable<IUser> {
    return this.http.patch<IUser>(`${this.coreApi}/users/${id}/id_ro`, data);
  }

  getUsersList(active: string, direction: string, page: number, size: number, filterValue: string, roleIdFilterValue: any, statusFilterValue: any): Observable<IUser[]> {
    // const filter = getFilter(active, direction, size, page, filterValue, null, null, [
    //   'username',
    //   'first_name',
    //   'last_name',
    //   'email'
    // ], undefined, {
    //   "role_id": roleIdFilterValue,
    //   "status": statusFilterValue
    // });
    // const url = `${this.coreApi}/users?${filter !== 'filter=' ? filter + '&' : ''}`;
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      roleFilterId: `${roleIdFilterValue}`,
      statusFilter: `${statusFilterValue}`,
    }).toString();
    const url = `${this.coreApi}/users?${parametersQuery}`;
    return this.http.get<IUser[]>(url);
  }

  getUsersListForFilter(): Observable<IUser[]> {
    const url = `${this.coreApi}/users/for_filter`;
    return this.http.get<IUser[]>(url);
  }

  createUser(data: any): Observable<IUser> {
    return this.http.post<IUser>(`${this.coreApi}/users`, data);
  }


  updateUserMain(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/users/${id}/primary`, data);
  }

  updateUserPassword(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/users/${id}/password`, data);
  }

  updateUserSomos(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/users/${id}/somos`, data);
  }

  updateUserAdditional(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/users/${id}/additional`, data);
  }

  updateUserUISettings(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/users/${id}/ui_settings`, data);
  }

  updateUserStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/users/${id}/status`, {});
  }

  deleteUserById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/users/${id}`);
  }

  //SFTP Configuration APIs
  getSftpHosts(): Observable<any> {
    const url = `${this.coreApi}/configurations/sqlscript_sftp`;
    return this.http.get<any>(url);
  }

  updateSftpHosts(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/configurations/sqlscript_sftp`, data);
  }

  //sqlUsers APIs
  getSqlUsersList(active: string, direction: string, page: number, size: number, filterValue: string): Observable<ISqlUser[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`
    }).toString();
    const url = `${this.coreApi}/script-users?${parametersQuery}`;
    return this.http.get<ISqlUser[]>(url);
  }

  getSqlUserCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/script-users/count?${parametersQuery}`);
  }

  createSqlUser(data: any): Observable<ISqlUser> {
    return this.http.post<ISqlUser>(`${this.coreApi}/script-users`, data);
  }

  getSqlUser(id: number): Observable<ISqlUser> {
    const url = `${this.coreApi}/script-users/${id}`;
    return this.http.get<ISqlUser>(url);
  }

  updateSqlUser(id: number, data: any): Observable<ISqlUser> {
    return this.http.patch<ISqlUser>(`${this.coreApi}/script-users/${id}`, data);
  }

  deleteSqlUserById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/script-users/${id}`);
  }

  //SqlScripts APIs
  getSqlScriptsList(active: string, direction: string, page: number, size: number, filterValue: string, sqlType: string): Observable<ISqlScript[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      sqlType: `${sqlType}`,
    }).toString();
    const url = `${this.coreApi}/script-sqls?${parametersQuery}`;
    return this.http.get<ISqlScript[]>(url);
  }

  getSqlScriptsCount(filterValue: string, sqlType: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`,
      sqlType: `${sqlType}`,
    }).toString();
    return this.http.get<any>(`${this.coreApi}/script-sqls/count?${parametersQuery}`);
  }

  createSqlScript(data: any): Observable<ISqlScript> {
    return this.http.post<ISqlScript>(`${this.coreApi}/script-sqls`, data);
  }

  getSqlScript(id: number): Observable<ISqlScript> {
    const url = `${this.coreApi}/script-sqls/${id}`;
    return this.http.get<ISqlScript>(url);
  }

  updateSqlScript(id: number, data: any): Observable<ISqlScript> {
    return this.http.patch<ISqlScript>(`${this.coreApi}/script-sqls/${id}`, data);
  }

  deleteSqlScript(id: number): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/script-sqls/${id}`);
  }

  //ScriptResult APIs
  getScriptResultsList(active: string, direction: string, page: number, size: number, filterValue: string, sqlIdFilterValue: any, resultFilterValue: any, userIdFilterValue: any): Observable<IScriptResults[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilterValue}`,
      resultFilter: `${resultFilterValue}`,
      sqlType: `${sqlIdFilterValue}`,
    }).toString();
    const url = `${this.coreApi}/script-results?${parametersQuery}`;
    return this.http.get<IScriptResults[]>(url);
  }

  getScriptResultsCount(filterValue: string, sqlIdFilterValue: any, resultFilterValue: any, userIdFilterValue: any): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`,
      userIdFilter: `${userIdFilterValue}`,
      resultFilter: `${resultFilterValue}`,
      sqlType: `${sqlIdFilterValue}`,
    }).toString();
    return this.http.get<any>(`${this.coreApi}/script-results/count?${parametersQuery}`);
  }

  //User Activity APIs
  getUserActivitiesList(active: string, direction: string, page: number, size: number, filterValue: string, statusFilterValue: any, userIdFilterValue: any): Observable<IUserActivities[]> {
    // let json_filter = {
    //   "limit": size,
    //   "skip": 0,
    //   "where": {
    //     "and": [
    //       {
    //         "or": [
    //           {
    //             "page": {
    //               "like": `%${filterValue}%`
    //             }
    //           },
    //           {
    //             "operation": {
    //               "like": `%${filterValue}%`
    //             }
    //           },
    //           {
    //             "sub_dt_tm": {
    //               "like": `%${filterValue}%`
    //             }
    //           },
    //         ]
    //       },
    //       {
    //         "and" : [
    //           {
    //             "status": statusFilterValue
    //           },
    //           {
    //             "user_id": userIdFilterValue
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   "order": active==''||direction=='' ? undefined : `${active} ${direction}`
    // };
    // let encodeURI_filter = encodeURIComponent(JSON.stringify(json_filter))
    // const url = `${this.coreApi}/activities?${'filter='+encodeURI_filter}`;
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilterValue}`,
      statusFilter: `${statusFilterValue}`,
    }).toString();
    const url = `${this.coreApi}/activities?${parametersQuery}`;
    return this.http.get<IUserActivities[]>(url);
  }

  getUserActivitiesCount(filterValue: string, statusFilterValue: any, userIdFilterValue: any): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`,
      userIdFilter: `${userIdFilterValue}`,
      statusFilter: `${statusFilterValue}`,
    }).toString();
    return this.http.get<any>(`${this.coreApi}/activities/count?${parametersQuery}`);
  }

  //Task Tracking APIs
  getTasksList(active: string, direction: string, page: number, size: number, filterValue: string, userIdFilterValue: any): Observable<ITaskTracking[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilterValue}`,
    }).toString();
    const url = `${this.coreApi}/activity-result?${parametersQuery}`;
    return this.http.get<ITaskTracking[]>(url);
  }

  getTasksCount(filterValue: string, userIdFilterValue: any): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`,
      userIdFilter: `${userIdFilterValue}`,
    }).toString();
    return this.http.get<any>(`${this.coreApi}/activity-result/count?${parametersQuery}`);
  }

  //Resp Org Information
  getRespOrgUnitList(): Observable<any[]> {
    const url = `${this.coreApi}/resp_org/units`;
    return this.http.get<any[]>(url);
  }

  getRespOrgEntitiesList(): Observable<any[]> {
    const url = `${this.coreApi}/resp_org/entities`;
    return this.http.get<any[]>(url);
  }

  getResultRetrieve(by: string, value: string): Observable<IRetrieveRespOrg> {
    const url = `${this.coreApi}/resp_org/retrieve/${by}?${'value=' + value}`;
    return this.http.get<IRetrieveRespOrg>(url);
  }

  //Number Search And Reserve
  readCsvFile(fileFullPath: string, fileType: any) {
    return this.http.get(fileFullPath, {responseType: fileType});
  }

  searchAndReserve(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/NSR/SearchAndReserve`, data);
  }

  getNSRById(id: string): Observable<any> {
    const url = `${this.coreApi}/NSR/${id}`;
    return this.http.get<any>(url);
  }

  getNSRData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/NSR/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getNSRCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/NSR/count?${parametersQuery}`);
  }

  deleteNSR(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/NSR/${id}`);
  }

  //Contact Information APIs

  getContactInformationApi(): Observable<any> {
    const url = `${this.coreApi}/configurations/tfnregistry_contact`;
    return this.http.get<any>(url);
  }

  updateContactInformation(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/configurations/tfnregistry_contact`, data);
  }

  //Number Query and Update
  retrieveNumberQuery(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/NQU/query`, data);
  }
  updateNumberQuery(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/NQU/update`, data);
  }

  //Multi Dial Number Query
  submitMNQ(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/MNQ/query`, data);
  }

  getMNQData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/MNQ/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getMNQById(id: string): Observable<any> {
    const url = `${this.coreApi}/MNQ/${id}`;
    return this.http.get<any>(url);
  }

  getMNQCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/MNQ/count?${parametersQuery}`);
  }

  deleteMNQ(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/MNQ/${id}`);
  }

  //Multi Dial Number Disconnect
  submitMND(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/MND/disconnect`, data);
  }

  getMNDData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/MND/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getMNDById(id: string): Observable<any> {
    const url = `${this.coreApi}/MND/${id}`;
    return this.http.get<any>(url);
  }

  getMNDCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/MND/count?${parametersQuery}`);
  }

  deleteMND(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/MND/${id}`);
  }

  //Trouble Referral Number Query
  retrieveTrq(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/TRQ/retrieve`, data);
  }

  getTrqData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/TRQ/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getTrqById(id: string): Observable<any> {
    const url = `${this.coreApi}/TRQ/${id}`;
    return this.http.get<any>(url);
  }

  getTrqCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/TRQ/count?${parametersQuery}`);
  }

  deleteTrq(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/TRQ/${id}`);
  }

  submitMns(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/MNS/spare`, data);
  }

  getMnsData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/MNS/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getMnsById(id: string): Observable<any> {
    const url = `${this.coreApi}/MNS/${id}`;
    return this.http.get<any>(url);
  }

  getMnsCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/MNS/count?${parametersQuery}`);
  }

  deleteMns(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/MNS/${id}`);
  }

  getMroData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/MRO/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getMroCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/MRO/count?${parametersQuery}`);
  }

  getMroById(id: string): Observable<any> {
    const url = `${this.coreApi}/MRO/${id}`;
    return this.http.get<any>(url);
  }

  deleteMro(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/MRO/${id}`);
  }

  submitMro(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/MRO/change`, data);
  }

  getMcpData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/MCP/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getMcpCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/MCP/count?${parametersQuery}`);
  }

  getMcpById(id: string): Observable<any> {
    const url = `${this.coreApi}/MCP/${id}`;
    return this.http.get<any>(url);
  }

  deleteMcp(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/MCP/${id}`);
  }

  submitMcp(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/MCP/convert`, data);
  }


  getNarData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/NAR/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getNarCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/NAR/count?${parametersQuery}`);
  }

  getNarById(id: string): Observable<any> {
    const url = `${this.coreApi}/NAR/${id}`;
    return this.http.get<any>(url);
  }

  submitNar(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/NAR/submit`, data);
  }

  deleteNar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/NAR/${id}`);
  }

  cancelNar(id: string): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/NAR/${id}`, {});
  }


  getTemplateList(ro: string, entity: string, startTemplateName?: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      ro: `${ro}`,
      entity: `${entity}`,
      startTemplateName: `${startTemplateName}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/templates/list?${parametersQuery}`);
  }

  getTemplate(ro: string, templateName: string, effDtTm: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      ro: `${ro}`,
      templateName: `${templateName}`,
      effDtTm: `${effDtTm}`,
    }).toString();
    return this.http.get<any>(`${this.coreApi}/templates/query?${parametersQuery}`);
  }

  saveTemplate(ro: string, tmpl: any): Observable<any> {
    let data = { ... tmpl }
    data.respOrg = ro
    return this.http.post<any>(`${this.coreApi}/templates/save`, data);
  }

  getOcaCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/OCA/count?${parametersQuery}`);
  }

  getOcaData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/OCA/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getOcaById(id: string): Observable<any> {
    const url = `${this.coreApi}/OCA/${id}`;
    return this.http.get<any>(url);
  }

  submitOca(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/OCA/activate`, data);
  }

  deleteOca(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/OCA/${id}`);
  }

  getReservedNumberList(ro: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      ro: `${ro}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/MNA/list?${parametersQuery}`);
  }

  getMnaData(active: string, direction: string, size: number, page: number, filterValue?: string, userIdFilter?: string|number): Observable<any> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`
    }).toString();
    const url = `${this.coreApi}/MNA/data?${parametersQuery}`;
    return this.http.get<any>(url);
  }

  getMnaCount(filterValue: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/MNA/count?${parametersQuery}`);
  }

  getMnaById(id: string): Observable<any> {
    const url = `${this.coreApi}/MNA/${id}`;
    return this.http.get<any>(url);
  }

  deleteMna(id: string): Observable<any> {
    return this.http.delete<any>(`${this.coreApi}/MNA/${id}`);
  }

  submitMna(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/MNA/activate`, data);
  }

  //ScriptResult APIs
  getNumberList(active: string, direction: string, page: number, size: number, filterValue: string, entity: string, respOrgId: string, tmplName: string, status: string, numFilter: string, subDtTm: string): Observable<any[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      entityFilter: `${entity}`,
      respOrgFilter: `${respOrgId}`,
      templateFilter: `${tmplName}`,
      statusFilter: `${status}`,
      numFilter: `${numFilter}`,
      subDtTm: `${subDtTm}`
    }).toString();
    const url = `${this.coreApi}/number_list?${parametersQuery}`;
    return this.http.get<any[]>(url);
  }

  getNumberListCount(filterValue: string, entity: string, respOrgId: string, tmplName: string, status: string, numFilter: string, subDtTm: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`,
      entityFilter: `${entity}`,
      respOrgFilter: `${respOrgId}`,
      templateFilter: `${tmplName}`,
      statusFilter: `${status}`,
      numFilter: `${numFilter}`,
      subDtTm: `${subDtTm}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/number_list/count?${parametersQuery}`);
  }

  getNumberListSubDtTmForFilter(): Observable<any[]> {
    const url = `${this.coreApi}/number_list/sub_dt_tm`;
    return this.http.get<any[]>(url);
  }

  getUsernamesOfNumberList(): Observable<any[]> {
    const url = `${this.coreApi}/number_list/script_users`;
    return this.http.get<any[]>(url);
  }

  getRespOrgOfNumberList(): Observable<any[]> {
    const url = `${this.coreApi}/number_list/resp_org`;
    return this.http.get<any[]>(url);
  }

  getEntityOfNumberList(): Observable<any[]> {
    const url = `${this.coreApi}/number_list/entity`;
    return this.http.get<any[]>(url);
  }

  getTemplateOfNumberList(): Observable<any[]> {
    const url = `${this.coreApi}/number_list/template`;
    return this.http.get<any[]>(url);
  }

  getStatusOfNumberList(): Observable<any[]> {
    const url = `${this.coreApi}/number_list/status`;
    return this.http.get<any[]>(url);
  }

  getScriptSQLsOfNumberList(active: string, direction: string, page: number, size: number, filterValue: string, userIdFilter?: string, sqlType?: string): Observable<ISqlScript[]> {
    const parametersQuery = new URLSearchParams({
      limit: `${size}`,
      skip: `${(page - 1) * size}`,
      order: `${active} ${direction}`,
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`,
      sqlType: `${sqlType}`,
    }).toString();
    const url = `${this.coreApi}/number_list/script_sqls?${parametersQuery}`;
    return this.http.get<ISqlScript[]>(url);
  }

  getScriptCountOfNumberList(filterValue: string, userIdFilter?: string, sqlType?: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      value: `${filterValue}`,
      userIdFilter: `${userIdFilter}`,
      sqlType: `${sqlType}`,
    }).toString();
    return this.http.get<any>(`${this.coreApi}/number_list/script_count?${parametersQuery}`);
  }

  importNumberList(ids: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      ids: `${ids}`,
    }).toString();
    const url = `${this.coreApi}/number_list/script_submit?${parametersQuery}`;
    return this.http.post<any>(url, {});
  }

  confirmNumImporting(): Observable<any[]> {
    const url = `${this.coreApi}/number_list/stas`;
    return this.http.get<any[]>(url);
  }

  cancelNumImporting(ids: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      ids: `${ids}`,
    }).toString();
    const url = `${this.coreApi}/number_list/script_cancel?${parametersQuery}`;
    return this.http.post<any>(url, {});
  }

  //Template Admin Data
  tmplAdminDataRetrieve(ro: any, templateName: string, effDtTm: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      ro: `${ro}`,
      templateName: `${templateName}`,
      effDtTm: `${effDtTm}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/templates/retrieve?${parametersQuery}`);
  }

  tmplLock(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/templates/lock`, data);
  }

  tmplUnLock(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/templates/unlock`, data);
  }

  deleteTmplRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/templates/delete`, data);
  }

  updateTmplRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/templates/update`, data);
  }

  createTmplRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/templates/create`, data);
  }

  copyTmplRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/templates/copy`, data);
  }

  disconnectTmplRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/templates/disconnect`, data);
  }

  transferTmplRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/templates/transfer`, data);
  }

  // Customer Admin Data
  retrieveCadRec(ro: any, num: string, effDtTm: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      ro: `${ro}`,
      num: `${num}`,
      effDtTm: `${effDtTm}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/customer-record/retrieve?${parametersQuery}`);
  }

  lockCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/lock`, data);
  }

  updateCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/update`, data);
  }

  unlockCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/unlock`, data);
  }

  deleteCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/delete`, data);
  }

  createCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/create`, data);
  }

  copyCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/copy`, data);
  }

  disconnectCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/disconnect`, data);
  }

  transferCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/transfer`, data);
  }

  queryCadlRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/query`, data);
  }

  convertCadRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/customer-record/convert`, data);
  }

  // Pointer Admin Data
  retrievePtrRec(ro: any, num: string, effDtTm: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      ro: `${ro}`,
      num: `${num}`,
      effDtTm: `${effDtTm}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/pointer-record/retrieve?${parametersQuery}`);
  }

  lockPtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/lock`, data);
  }

  unlockPtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/unlock`, data);
  }

  deletePtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/delete`, data);
  }

  updatePtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/update`, data);
  }

  createPtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/create`, data);
  }

  copyPtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/copy`, data);
  }

  disconnectPtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/disconnect`, data);
  }

  transferPtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/transfer`, data);
  }

  // queryTmplRec(data: any): Observable<any> {
  //   return this.http.put<any>(`${this.coreApi}/pointer-record/query`, data);
  // }

  convertPtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/convert`, data);
  }

  resultOfConvertedPtrRec(data: any): Observable<any> {
    return this.http.put<any>(`${this.coreApi}/pointer-record/convert`, data);
  }

  //ROC
  generateLOAFile(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/generate_loa`, data);
  }

  uploadDoc(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/upload_file`, data);
  }

  uploadLOA(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/upload_loa`, data);
  }

  submitROC(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/submit_roc_request`, data);
  }

  retrieveSubscription(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/retrieve_subscription_request`, data);
  }

  updateSubscription(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/update_subscription_request`, data);
  }

  createSubscription(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/create_subscription_request`, data);
  }

  //RRN
  retrieveListOfFailedNotification(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/retrieve_list_of_failed_notification`, data);
  }

  resendFailedNotification(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/resend_failed_notification`, data);
  }

  //RSR
  searchRocRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/search_roc_request`, data);
  }

  retrieveRocRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/retrieve_roc_request`, data);
  }

  searchRocByTransaction(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/search_roc_by_transaction`, data);
  }

  checkOutRocRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/check_out_roc_request`, data);
  }

  checkInRocRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/check_in_roc_request`, data);
  }

  processRocRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/process_roc_request`, data);
  }

  cancelRocRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/cancel_roc_request`, data);
  }

  resubmitRocRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/resubmit_roc_request`, data);
  }

  removeTfnRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.coreApi}/resp_org/remove_tfn_request`, data);
  }

  retrieveDocument(loaID: string, docId: string, reqId: string): Observable<any> {
    const parametersQuery = new URLSearchParams({
      loaID: `${loaID}`,
      docId: `${docId}`,
      reqId: `${reqId}`
    }).toString();
    return this.http.get<any>(`${this.coreApi}/resp_org/retrieve_document?${parametersQuery}`);
  }

}
