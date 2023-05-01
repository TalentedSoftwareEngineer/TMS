// import {inject} from '@loopback/core';

import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {RespOrgService} from "../services";
import {get, HttpErrors, param, post,
  requestBody,
} from "@loopback/rest";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import * as fs from "fs";
import {TEMPORARY} from "../config";

@authenticate('jwt')
export class RespOrgController {
  constructor(
      @service(RespOrgService) public respOrgService: RespOrgService,
  ) {}

  @get('/resp_org/entities', {
    description: 'list all the Resp Org Entities in the system',
    responses: {
      '200': {
        description: 'Array of respOrgEntity',
        content: {
          'application/json': {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  respOrgEntity: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    }
  })
  async listEntity(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESP_ORG_INFORMATION))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.respOrgService.listEntity(profile)
  }

  @get('/resp_org/units', {
    description: 'list all the Resp Org Units in the system',
    responses: {
      '200': {
        description: 'Array of respOrgUnit',
        content: {
          'application/json': {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  respOrgId: {
                    type: "string",
                  },
                  status: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    }
  })
  async listUnit(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESP_ORG_INFORMATION))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.respOrgService.listUnit(profile)
  }

  @get('/resp_org/retrieve/{by}', {
    description: 'retrieve Resp Org Information',
    responses: {
      '200': {
        description: 'Resp Org Information',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                respOrgEntity: {
                  type: "string",
                },
                companyName: {
                  type: "string",
                },
                emailId: {
                  type: "string",
                },
                contactPhone: {
                  type: "string",
                },
                associatedRespOrgs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      respOrgId: {
                        type: "string",
                      },
                      businessUnitName: {
                        type: "string",
                      },
                      email: {
                        type: "string",
                      },
                      troubleRef: {
                        type: "string",
                      },
                      status: {
                        type: "string",
                      },
                    },
                  },
                }
              },
            },
          },
        },
      },
    }
  })
  async retrieveBy(
      @param.path.string('by') by: string,
      @param.query.string('value') value: string,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESP_ORG_INFORMATION))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.respOrgService.retrieveInformationBy(by, value, profile)
  }

  @post('/resp_org/upload_loa', {
    description: "Upload LOA file request",
    responses: {
      '200': {
        description: 'Result of File Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async upload_loa(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                encoded_file: {
                  type: "string",
                  description: 'Base64 encoded text',
                  example: "TFN Number, Customer, Price, Resp Org"
                },
                extension: {
                  type: "string",
                  example: "one of the 'pdf', 'tiff'"
                }
              },
            }
          },
        },
      }) upload: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBMIT_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (upload.encoded_file=="" || upload.extension=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const filename = TEMPORARY + "loa_"
        + Math.random().toString(36).substring(2, 15)
        + Math.random().toString(36).substring(2, 15)
        + "." + upload.extension

    try {
      fs.writeFileSync(filename, upload.encoded_file, 'base64')
    } catch (err) {
      throw new HttpErrors.BadRequest("Failed to write temporary file.")
    }

    return this.respOrgService.uploadLOAFileRequest(filename, profile)
  }

  @post('/resp_org/generate_loa', {
    description: "Generate LOA file request",
    responses: {
      '200': {
        description: 'Result of File Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async generate_loa(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBMIT_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.numList==null || req.numList.length==0 || req.cmpyAddress1==null || req.cmpyAddress1==""
        || req.custName==null || req.custName=="" || req.city==null || req.city=="" || req.state==null || req.state==""
        || req.zipCode==null || req.zipCode=="" || req.authCusContact==null || req.authCusContact==""
        || req.authCusTitle==null || req.authCusTitle=="" || req.authCusPhone==null || req.authCusPhone=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)


    return this.respOrgService.generateLOAFileRequest(req, profile)
  }

  @post('/resp_org/upload_file', {
    description: "Upload file request",
    responses: {
      '200': {
        description: 'Result of File Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async upload_file(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                encoded_file: {
                  type: "string",
                  description: 'Base64 encoded text',
                  example: "TFN Number, Customer, Price, Resp Org"
                },
                extension: {
                  type: "string",
                  example: "one of the 'pdf', 'tiff'"
                }
              },
            }
          },
        },
      }) upload: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBMIT_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (upload.encoded_file=="" || upload.extension=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const filename = TEMPORARY + "document_"
        + Math.random().toString(36).substring(2, 15)
        + Math.random().toString(36).substring(2, 15)
        + "." + upload.extension

    try {
      fs.writeFileSync(filename, upload.encoded_file, 'base64')
    } catch (err) {
      throw new HttpErrors.BadRequest("Failed to write temporary file.")
    }

    return this.respOrgService.uploadFileRequest(filename, profile)
  }

  @post('/resp_org/submit_roc_request', {
    description: "Submit ROC request",
    responses: {
      '200': {
        description: 'Result of Submit ROC Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async submit_roc_request(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBMIT_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.numList==null || req.numList.length==0 || req.newRespOrgID==null || req.newRespOrgID==""
        || req.requestType==null || req.requestType=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // TODO - no option for now (disabled)
    req.contactInformation = "USE_MY_INFO"

    return this.respOrgService.submitROCRequest(req, profile)
  }

  @post('/resp_org/resubmit_hdi_request', {
    description: "Resubmit HDI request",
    responses: {
      '200': {
        description: 'Result of ReSubmit HDI Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async resubmit_hdi_request(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBMIT_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.numList==null || req.numList.length==0 || req.newRespOrgID==null || req.newRespOrgID=="" || req.oldRespOrgID==null || req.oldRespOrgID==""
        || req.srcTxnID==null || req.srcTxnID=="" || req.loaVerification==null || req.loaVerification==""
        || req.emergencyRoc==null || req.emergencyRoc=="" || req.effectiveDate==null || req.effectiveDate=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.resubmitHDIRequest(req, profile)
  }

  @post('/resp_org/search_roc_by_transaction', {
    description: "Search ROC by Transaction request",
    responses: {
      '200': {
        description: 'Result of Search ROC Transaction Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async search_roc_by_transaction(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_CHANGE_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.rocType==null || req.rocType=="" || req.entityOrRespOrg==null || req.entityOrRespOrg==""
        || req.startDate==null || req.startDate=="" || req.endDate==null || req.endDate=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.searchROCTransactionRequest(req, profile)
  }

  @post('/resp_org/search_roc_request', {
    description: "Search ROC request",
    responses: {
      '200': {
        description: 'Result of Search ROC Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async search_roc_request(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_CHANGE_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.rocType==null || req.rocType=="" || req.entityOrRespOrg==null || req.entityOrRespOrg==""
        || req.startDate==null || req.startDate=="" || req.endDate==null || req.endDate=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.searchROCRequest(req, profile)
  }

  @post('/resp_org/retrieve_roc_request', {
    description: "Retrieve ROC request",
    responses: {
      '200': {
        description: 'Result of Search ROC Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async retrieve_roc_request(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_CHANGE_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.txnId==null || req.txnId=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.retrieveROCRequest(req.txnId, profile)
  }

  @post('/resp_org/retrieve_subscription_request', {
    description: "Retrieve Subscription request",
    responses: {
      '200': {
        description: 'Result of Retrieve Subscription request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async retrieve_subscription_request(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.entity==null || req.entity=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.retrieveSubscriptionRequest(req.entity, profile)
  }

  @post('/resp_org/check_in_roc_request', {
    description: "Check In ROC request",
    responses: {
      '200': {
        description: 'Result of Check In ROC request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async checkinROCRequest(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.txnID==null || req.txnID=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.checkinROCRequest(req, profile)
  }

  @post('/resp_org/check_out_roc_request', {
    description: "Check Out ROC request",
    responses: {
      '200': {
        description: 'Result of Check Out ROC request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async checkoutROCRequest(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.txnID==null || req.txnID=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.checkoutROCRequest(req, profile)
  }

  @post('/resp_org/remove_tfn_request', {
    description: "Remove TFN request",
    responses: {
      '200': {
        description: 'Result of Remove TFN request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async removeTFNRequest(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.txnID==null || req.txnID=="" || req.numList==null)
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.removeTFNRequest(req, profile)
  }

  @post('/resp_org/cancel_roc_request', {
    description: "Cancel ROC request",
    responses: {
      '200': {
        description: 'Result of Cancel ROC request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async cancelRocRequest(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.txnID==null || req.txnID=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.cancelROCRequest(req, profile)
  }

  @post('/resp_org/process_roc_request', {
    description: "Process ROC request",
    responses: {
      '200': {
        description: 'Result of Process ROC request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async processROCRequest(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.txnID==null || req.txnID=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.processROCRequest(req, profile)
  }

  @post('/resp_org/escalate_roc_request', {
    description: "Escalate ROC request",
    responses: {
      '200': {
        description: 'Result of Escalate ROC request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async escalateROCRequest(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.txnID==null || req.txnID=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.escalateROCRequest(req, profile)
  }

  @post('/resp_org/create_subscription_request', {
    description: "Create subscription request",
    responses: {
      '200': {
        description: 'Result of Create subscription request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async create_subscription_request(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.entity==null || req.entity=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.createSubscriptionRequest(req, profile)
  }

  @post('/resp_org/update_subscription_request', {
    description: "Update subscription request",
    responses: {
      '200': {
        description: 'Result of Update subscription request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async update_subscription_request(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.entity==null || req.entity=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.updateSubscriptionRequest(req, profile)
  }

  @post('/resp_org/retrieve_list_of_failed_notification', {
    description: "Retrieve list of failed notification request",
    responses: {
      '200': {
        description: 'Result of Retrieve list of failed notification request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async retrieve_list_of_failed_notification(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_RESEND_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.entity==null || req.entity=="" || req.ntfnStartDate==null || req.ntfnStartDate=="" || req.ntfnEndDate==null || req.ntfnEndDate=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.retrieveListOfFailedNotificationRequest(req, profile)
  }

  @post('/resp_org/resend_failed_notification', {
    description: "Retrieve list of failed notification request",
    responses: {
      '200': {
        description: 'Result of Retrieve list of failed notification request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async resend_failed_notification(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              },
            }
          },
        },
      }) req: any,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_RESEND_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.entity==null)
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.respOrgService.resendFailedNotificationRequest(req, profile)
  }

  @get('/resp_org/retrieve_document', {
    description: "Retrieve document request",
    responses: {
      '200': {
        description: 'Result of Retrieve document request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async retrieveDocumentRequest(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('loaID') loaID: string,
      @param.query.string('docId') docId: string,
      @param.query.string('reqId') reqId: string,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_RESEND_SUBSCRIBER_NOTIFICATIONS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.respOrgService.retrieveDocumentRequest(profile, loaID, docId, reqId)
  }
}
