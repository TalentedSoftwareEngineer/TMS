import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {HttpErrors} from "@loopback/rest";
import {MESSAGES} from "../constants/messages";
import {TfnRegistryApiService} from "./tfn-registry-api.service";
import {AuthorizedUserProfile} from "../models";
import DataUtils from "../utils/data";

@injectable({scope: BindingScope.TRANSIENT})
export class RespOrgService {
  constructor(
      @service(TfnRegistryApiService)
      public tfnRegistryApiService: TfnRegistryApiService,
  ) {}

  async listEntity(profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.listRespOrgEntity(profile)
    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)

    } else if (response.code!=null && response.message!=null) {
      throw new HttpErrors.BadRequest(response.message + (response.code!="" ? " Code: " + response.code : ""))

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.respOrgList==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.listRespOrgByReqId(reqId, profile)
      }

      return response.respOrgList
    } else if (response.respOrgList!=null)
      return response.respOrgList;

    throw new HttpErrors.InternalServerError
  }

  async listUnit(profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.listRespOrgUnit(profile)
    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)

    } else if (response.code!=null && response.message!=null) {
      throw new HttpErrors.BadRequest(response.message + (response.code!="" ? " Code: " + response.code : ""))

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.respOrgList==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.listRespOrgByReqId(reqId, profile)
      }

      return response.respOrgList
    } else if (response.respOrgList!=null)
      return response.respOrgList;

    throw new HttpErrors.InternalServerError
  }

  async retrieveInformationBy(by: string, value: string, profile: AuthorizedUserProfile) {
    let response = null;
    if (by=="unit")
      response = await this.tfnRegistryApiService.retrieveRespOrgByUnit(value, profile)

    if (by=="entity")
      response = await this.tfnRegistryApiService.retrieveRespOrgByEntity(value, profile)

    if (by=="number")
      response = await this.tfnRegistryApiService.retrieveRespOrgByNumber(value, profile)

    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)

    } else if (response.code!=null && response.message!=null) {
      throw new HttpErrors.BadRequest(response.message + (response.code!="" ? " Code: " + response.code : ""))

    } else if (response.reqId!=null) {
      throw new HttpErrors.BadRequest("Request is in progress. ReqID: " + response.reqId)
    }

    return response;
  }
}
