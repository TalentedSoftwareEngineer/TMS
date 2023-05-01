import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {HttpErrors} from "@loopback/rest";
import {MESSAGES} from "../constants/messages";
import {TfnRegistryApiService} from "./tfn-registry-api.service";
import {AuthorizedUserProfile} from "../models";
import DataUtils from "../utils/data";

@injectable({scope: BindingScope.TRANSIENT})
export class RespOrgService {
  constructor(
      @service(TfnRegistryApiService) public tfnRegistryApiService: TfnRegistryApiService,
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


  async uploadLOAFileRequest(filename: string, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.uploadLOAFileRequest(filename, profile)
    console.log("Upload Loa", response)

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
      while (response==null || response.loaID==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.uploadLOAFileRequestByReqId(reqId, profile)
        console.log("Upload Loa Req", response)
      }

    } else if (response.loaID!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async generateLOAFileRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.generateLOAFileRequest(data, profile)
    console.log("Generate Loa", response)

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
      while (response==null || response.fileName==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.generateLOAFileRequestByReqId(reqId, profile)
        console.log("Generate Loa Req", response)
      }

    } else if (response.fileName!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async uploadFileRequest(filename: string, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.uploadFileRequest(filename, profile)
    console.log("Upload file", response)

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
      while (response==null || response.fileId==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.uploadFileRequestByReqId(reqId, profile)
        console.log("Upload file Req", response)
      }

    } else if (response.fileId!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async submitROCRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.submitROCRequest(data, profile)
    console.log("Submit ROC request", response)

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
      while (response==null || response.txnID==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.submitROCRequestByReqId(reqId, profile)
        console.log("Submit ROC request Req", response)
      }

    } else if (response.txnID!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async resubmitHDIRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.resubmitHDIRequest(data, profile)
    console.log("ReSubmit HDI request", response)

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
      while (response==null || response.txnID==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.resubmitHDIRequestByReqId(reqId, profile)
        console.log("ReSubmit HDI request Req", response)
      }

    } else if (response.txnID!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async searchROCTransactionRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.searchROCByTransactionIDRequest(data, profile)
    console.log("searchROCTransactionRequest", response)

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
      while (response==null || response.transactionList==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.searchROCByTransactionIDRequestByReqId(reqId, profile)
        console.log("searchROCTransactionRequest", response)
      }

    } else if (response.transactionList!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async searchROCRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.searchROCRequest(data, profile)
    console.log("Search ROC request", response)

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
      while (response==null || response.resultList==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.searchROCRequestByReqId(reqId, profile)
        console.log("Search ROC request Req", response)
      }

    } else if (response.resultList!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async retrieveROCRequest(txnId: string, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.retrieveROCRequest(txnId, profile)
    console.log("Retrieve ROC request", response)

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
      while (response==null || response.statusCode==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.retrieveROCRequestByReqId(reqId, profile)
        console.log("Retrieve ROC request Req", response)
      }

    } else if (response.statusCode!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async removeTFNRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.removeTFNRequest(data, profile)
    console.log("RemoveTFN request", response)

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
      while (response==null || response.recVersionId==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.removeTFNRequestByReqId(reqId, profile)
        console.log("RemoveTFN request Req", response)
      }

    } else if (response.recVersionId!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async cancelROCRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.cancelROCRequest(data, profile)
    console.log("Cancel ROC request", response)

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
      while (response==null || response.reqId==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.cancelROCRequestByReqId(reqId, profile)
        console.log("Cancel ROC request Req", response)
      }

    // } else if (response.statusCode!=null) {
    //
    } else {
      // throw new HttpErrors.InternalServerError
    }

    return response
  }

  async processROCRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.processROCRequest(data, profile)
    console.log("Process ROC request", response)

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
      while (response==null || response.resultList==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.processROCRequestByReqId(reqId, profile)
        console.log("Process ROC request Req", response)
      }

    } else if (response.resultList!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async checkinROCRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.checkinROCRequest(data, profile)
    console.log("Checkin ROC request", response)

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
      while (response==null || response.recVersionId==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.checkinROCRequestByReqId(reqId, profile)
        console.log("Checkin ROC request Req", response)
      }

    } else if (response.recVersionId!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async checkoutROCRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.checkoutROCRequest(data, profile)
    console.log("Checkout ROC request", response)

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
      while (response==null || response.recVersionId==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.checkoutROCRequestByReqId(reqId, profile)
        console.log("Checkout ROC request Req", response)
      }

    } else if (response.recVersionId!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async escalateROCRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.escalateROCRequest(data, profile)
    console.log("Escalate ROC request", response)

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
      while (response==null || response.txnList==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.escalateROCRequestByReqId(reqId, profile)
        console.log("Escalate ROC request Req", response)
      }

    } else if (response.txnList!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async retrieveSubscriptionRequest(entity: string, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.retrieveSubscriptionRequest(entity, profile)
    console.log("Retrieve Subscription request", response)

    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode

        if (error.errCode=="099029")
          return { code: 1, message: message }
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)

    } else if (response.code!=null && response.message!=null) {
      throw new HttpErrors.BadRequest(response.message + (response.code!="" ? " Code: " + response.code : ""))

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.newRequest==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.retrieveSubscriptionRequestByReqId(reqId, profile)
        console.log("Retrieve Subscription request Req", response)
      }

    } else if (response.newRequest!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async createSubscriptionRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.createSubscriptionRequest(data, profile)
    console.log("Create Subscription request", response)

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
      while (response==null || response.newRequest==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.retrieveSubscriptionRequestByReqId(reqId, profile)
        console.log("Create Subscription request Req", response)
      }

    // } else if (response.newRequest!=null) {
    //
    } else {
      // throw new HttpErrors.InternalServerError
    }

    return response
  }

  async updateSubscriptionRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.updateSubscriptionRequest(data, profile)
    console.log("Update Subscription request", response)

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
      while (response==null || response.newRequest==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.retrieveSubscriptionRequestByReqId(reqId, profile)
        console.log("Update Subscription request Req", response)
      }

      // } else if (response.newRequest!=null) {
      //
    } else {
      // throw new HttpErrors.InternalServerError
    }

    return response
  }

  async retrieveListOfFailedNotificationRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.retrieveListOfFailedNotificationRequest(data, profile)
    console.log("retrieveListOfFailedNotificationRequest", response)

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
      while (response==null || response.ntfnList==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.retrieveListOfFailedNotificationRequestByReqId(reqId, profile)
        console.log("retrieveListOfFailedNotificationRequest Req", response)
      }

    } else if (response.ntfnList!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }

  async resendFailedNotificationRequest(data: any, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.resendFailedNotificationRequest(data, profile)
    console.log("resendFailedNotificationRequest", response)

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
      while (response==null || response.reqId==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.resendFailedNotificationRequestByReqId(reqId, profile)
        console.log("retrieveListOfFailedNotificationRequest Req", response)
      }

    // } else if (response.ntfnList!=null) {

    } else {
      // throw new HttpErrors.InternalServerError
    }

    return response
  }

  async retrieveDocumentRequest(profile: AuthorizedUserProfile, loaID?: string, docId?: string, reqId?: string) {
    let response = await this.tfnRegistryApiService.retrieveDocumentRequest(profile, loaID, docId, reqId)
    console.log("retrieveDocumentRequest", response)

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

    } else if (response.fileName!=null) {

    } else {
      throw new HttpErrors.InternalServerError
    }

    return response
  }
}
