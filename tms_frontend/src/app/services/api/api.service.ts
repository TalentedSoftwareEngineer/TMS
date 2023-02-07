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

  //Company APIs
  getCompaniesList(active: string, direction: string, page: number, size: number, filterValue: string, statusFilterValue: any): Observable<ICompany[]> {
    const filter = getFilter(active, direction, size, page, filterValue, null, null, [
      'name',
      'code',
      'role_code',
      'resp_org_id',
      'company_email'
    ], undefined, {
      "status": statusFilterValue
    });
    const url = `${this.coreApi}/companies?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<ICompany[]>(url);
  }

  getCompanyCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', ['name','code','role_code','resp_org_id','company_email'], customerFilter);
    return this.http.get<any>(`${this.coreApi}/companies/count?${'where=' + whereParam}`);
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
    const filter = getFilter(active, direction, size, page, filterValue, null, null, [
      'username',
      'password',
      'client_key',
      'client_password',
    ]);
    const url = `${this.coreApi}/somos-users?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<ISomosUser[]>(url);
  }

  getSMSUserCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', ['username', 'password', 'client_key', 'client_password'], customerFilter);
    return this.http.get<any>(`${this.coreApi}/somos-users/count?${'where=' + whereParam}`);
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
    const filter = getFilter(active, direction, size, page, filterValue, null, null, [
      'name', 
      'description', 
    ]);
    const url = `${this.coreApi}/roles?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<IRole[]>(url);
  }

  getRoleCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', ['name','description'], customerFilter);
    return this.http.get<any>(`${this.coreApi}/roles/count?${'where=' + whereParam}`);
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
    const filter = getFilter(active, direction, size, page, filterValue, null, null, [
      'username', 
      'ro', 
    ]);
    const url = `${this.coreApi}/users/id_ro?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<IUser[]>(url);
  }

  getUserCount(filterValue: string, filterKeys: string[], customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', filterKeys, customerFilter);
    return this.http.get<any>(`${this.coreApi}/users/count?${'where=' + whereParam}`);
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
    const filter = getFilter(active, direction, size, page, filterValue, null, null, [
      'username',
      'first_name',
      'last_name',
      'email'
    ], undefined, {
      "role_id": roleIdFilterValue,
      "status": statusFilterValue
    });
    const url = `${this.coreApi}/users?${filter !== 'filter=' ? filter + '&' : ''}`;
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
    const filter = getFilter(active, direction, size, page, filterValue, null, null, [
      'username',
      'password'
    ]);
    const url = `${this.coreApi}/script-users?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<ISqlUser[]>(url);
  }

  getSqlUserCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', ['username','password'], customerFilter);
    return this.http.get<any>(`${this.coreApi}/script-users/count?${'where=' + whereParam}`);
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
  getSqlScriptsList(active: string, direction: string, page: number, size: number, filterValue: string): Observable<ISqlScript[]> {
    const filter = getFilter(active, direction, size, page, filterValue, null, null, ['content']);
    const url = `${this.coreApi}/script-sqls?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<ISqlScript[]>(url);
  }

  getSqlScriptsCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', ['content'], customerFilter);
    return this.http.get<any>(`${this.coreApi}/script-sqls/count?${'where=' + whereParam}`);
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
    const filter = getFilter(active, direction, size, page, filterValue, null, null, [
      'message'
    ], undefined, {
      "user_id": userIdFilterValue,
      "result": resultFilterValue,
      "sql_id": sqlIdFilterValue
    });
    const url = `${this.coreApi}/script-results?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<IScriptResults[]>(url);
  }

  getScriptResultsCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', ['message'], customerFilter);
    return this.http.get<any>(`${this.coreApi}/script-results/count?${'where=' + whereParam}`);
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
    const filter = getFilter(active, direction, size, page, filterValue, null, null, [
      'page',
      'operation',
      'sub_dt_tm',
      'message',
      'user.username'
    ], undefined, {
      "user_id": userIdFilterValue,
      "status": statusFilterValue
    });
    const url = `${this.coreApi}/activities?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<IUserActivities[]>(url);
  }

  getUserActivitiesCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', [
      'page',
      'operation',
      'sub_dt_tm',
      'message',
      'user.username'
    ], customerFilter);
    return this.http.get<any>(`${this.coreApi}/activities/count?${'where=' + whereParam}`);
  }

  //Task Tracking APIs
  getTasksList(active: string, direction: string, page: number, size: number, filterValue: string, userIdFilterValue: any): Observable<ITaskTracking[]> {
    const filter = getFilter(active, direction, size, page, filterValue, null, null, TASK_FILTER_FILEDS, undefined, {
      "user_id": userIdFilterValue
    }, 'src_num, tgt_num');
    const url = `${this.coreApi}/activity-result?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<ITaskTracking[]>(url);
  }

  getTasksCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', TASK_FILTER_FILEDS, customerFilter, 'src_num, tgt_num');
    return this.http.get<any>(`${this.coreApi}/activity-result/count?${'where=' + whereParam}`);
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

  getNSRData(active: string, direction: string, size: number, page: number): Observable<any> {
    const filter = getFilter(active, direction, size, page, '', null, null, [
      'sub_dt_tm',
      'type',
      'submit_type',
      'total',
      'completed',
      'status',
    ]);
    
    const url = `${this.coreApi}/NSR/data?${filter !== 'filter=' ? filter + '&' : ''}`;
    return this.http.get<any>(url);
  }

  getNSRCount(filterValue: string, customerFilter?: any): Observable<any> {
    const whereParam = getCountWhere(filterValue, '', '', [], customerFilter);
    return this.http.get<any>(`${this.coreApi}/NSR/count?${'where=' + whereParam}`);
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
  // retrieveNumberQuery
  retrieveNumberQuery(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/NQU/query`, data);
  }
  updateNumberQuery(data: any): Observable<any> {
    return this.http.patch<any>(`${this.coreApi}/NQU/update`, data);
  }
}
