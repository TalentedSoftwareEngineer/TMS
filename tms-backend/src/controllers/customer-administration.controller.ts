// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {CustomerRecordService, MessageQueueService, PointerRecordService, TfnRegistryApiService} from "../services";
import {get, HttpErrors, param, put, post, requestBody, response} from "@loopback/rest";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {repository} from "@loopback/repository";
import {ActivityRepository, ActivityResultRepository} from "../repositories";
import {TemplateRequest} from "../models";

@authenticate('jwt')
export class CustomerAdministrationController {
    constructor(
        @service(CustomerRecordService)
        public customerRecordService: CustomerRecordService,
        @service(PointerRecordService)
        public pointerRecordService: PointerRecordService,
    ) {
    }

    @get('/customer-record/retrieve', {
        description: 'Retrieve Customer record',
        responses: {
            '200': {
                description: 'Customer Record',
                content: {
                    'application/json': {
                        schema: {
                            type: "array",
                            items: {
                                type: 'object'
                            }
                        }
                    }
                },
            }
        }
    })
    async customer_retrieve(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.string('ro') ro: string,
        @param.query.string('num') num: string,
        @param.query.string('effDtTm') effDtTm: string,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (ro == "" || num == "")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        // GET: https://sandbox-api-tfnregistry.somos.com/v3/ip/cus/rec/tfnum/{num}
        return this.customerRecordService.retrieve(ro, num, effDtTm, profile, true)
    }

    @put('/customer-record/lock')
    @response(200, {
        description: 'Lock customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_lock(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/lockCADTFN'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.srcNum=="" || body.custRecCompPart=="" || body.custRecAction=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        return this.customerRecordService.lock(req.ro, body, profile)
    }

    @put('/customer-record/unlock')
    @response(200, {
        description: 'Unlock customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_unlock(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/unlockCADTFN'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            return { success: false, message: MESSAGES.MISSING_PARAMETERS}
            // throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.num=="")
            return { success: false, message: MESSAGES.MISSING_PARAMETERS}
            // throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        return this.customerRecordService.unlock(req.ro, body, profile)
    }

    @put('/customer-record/copy')
    @response(200, {
        description: 'Copy customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_copy(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/copyCAD'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.srcNum=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.custRecCompPart=="" || body.srcRecVersionId=='')
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.customerRecordService.copy(req.ro, body, profile)

        return { success: true }
    }

    @put('/customer-record/transfer')
    @response(200, {
        description: 'Transfer customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_transfer(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/transferCAD'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.srcNum=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.custRecCompPart=="" || body.srcRecVersionId=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.customerRecordService.transfer(req.ro, body, profile)

        return { success: true }
    }

    @put('/customer-record/disconnect')
    @response(200, {
        description: 'Disconnect customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_disconnect(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/disconnectCAD'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.srcNum=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.custRecCompPart=="" || body.srcRecVersionId=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.customerRecordService.disconnect(req.ro, body, profile)

        return { success: true }
    }

    @put('/customer-record/create')
    @response(200, {
        description: 'Create customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/createCAD'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        // if (body.srcTmplName=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.tmplRecCompPart=="")
        //   throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.customerRecordService.create(req.ro, body, profile)

        return { success: true }
    }

    @put('/customer-record/update')
    @response(200, {
        description: 'Update customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_update(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/updateCAD'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.num=="" || body.cmd=="" || body.recVersionId=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.customerRecordService.update(req.ro, body, profile)

        return { success: true }
    }

    @put('/customer-record/delete')
    @response(200, {
        description: 'Delete customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_delete(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/deleteCAD'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.num=="" || body.effDtTm=="" || body.recVersionId=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.customerRecordService.delete(req.ro, body.num, body.effDtTm, body.recVersionId, profile)

        return { success: true }
    }

    @put('/customer-record/convert')
    @response(200, {
        description: 'Convert customer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async customer_convert(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/convertCAD'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.numList==null || body.numList=="" || body.numList.length==0 || body.tmplName=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.customerRecordService.convert(req.ro, body, profile)

        return { success: true }
    }

    @get('/pointer-record/retrieve', {
        description: 'Retrieve Pointer record',
        responses: {
            '200': {
                description: 'Pointer Record',
                content: {
                    'application/json': {
                        schema: {
                            type: "array",
                            items: {
                                type: 'object'
                            }
                        }
                    }
                },
            }
        }
    })
    async pointer_retrieve(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.string('ro') ro: string,
        @param.query.string('num') num: string,
        @param.query.string('effDtTm') effDtTm: string,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (ro == "" || num == "")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        // GET: https://sandbox-api-tfnregistry.somos.com/v3/ip/cus/rec/tfnum/{num}
        return this.pointerRecordService.retrieve(ro, num, effDtTm, profile, true)
    }

    @put('/pointer-record/lock')
    @response(200, {
        description: 'Lock pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_lock(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/lockPTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.srcNum=="" || body.ptrRecAction=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        return this.pointerRecordService.lock(req.ro, body, profile)
    }

    @put('/pointer-record/unlock')
    @response(200, {
        description: 'Unlock pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_unlock(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/unlockPTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            return { success: false, message: MESSAGES.MISSING_PARAMETERS}
            // throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.num=="")
            return { success: false, message: MESSAGES.MISSING_PARAMETERS}
            // throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        return this.pointerRecordService.unlock(req.ro, body, profile)
    }

    @put('/pointer-record/copy')
    @response(200, {
        description: 'Copy pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_copy(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/copyPTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.tgtNum=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.custRecCompPart=="" || body.recVersionId=='')
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.pointerRecordService.copy(req.ro, body, profile)

        return { success: true }
    }

    @put('/pointer-record/transfer')
    @response(200, {
        description: 'Transfer pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_transfer(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/transferPTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.num=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.custRecCompPart=="" || body.recVersionId=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.pointerRecordService.transfer(req.ro, body, profile)

        return { success: true }
    }

    @put('/pointer-record/disconnect')
    @response(200, {
        description: 'Disconnect pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_disconnect(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/disconnectPTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.num=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.custRecCompPart=="" || body.recVersionId=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.pointerRecordService.disconnect(req.ro, body, profile)

        return { success: true }
    }

    @put('/pointer-record/create')
    @response(200, {
        description: 'Create pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/createPTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        // if (body.srcTmplName=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.tmplRecCompPart=="")
        //   throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.pointerRecordService.create(req.ro, body, profile)

        return { success: true }
    }

    @put('/pointer-record/update')
    @response(200, {
        description: 'Update pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_update(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/updatePTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.num=="" || body.cmd=="" || body.recVersionId=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.pointerRecordService.update(req.ro, body, profile)

        return { success: true }
    }

    @put('/pointer-record/delete')
    @response(200, {
        description: 'Delete pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_delete(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/deletePTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        if (body.num=="" || body.effDtTm=="" || body.recVersionId=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.pointerRecordService.delete(req.ro, body.num, body.effDtTm, body.recVersionId, profile)

        return { success: true }
    }

    @put('/pointer-record/convert')
    @response(200, {
        description: 'Convert pointer record',
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                    }
                }
            }
        },
    })
    async pointer_convert(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                            ro: {
                                type: 'string',
                            },
                            body: {
                                type: 'string',
                                example: 'https://developer.somos.com/tfn/redoc/v3#operation/convertPTR'
                            },
                        },
                        required: ['ro', 'body']
                    },
                },
            },
        })
            req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.POINT_ADMIN_DATA))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro=="" || req.body=="")
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        const body = JSON.parse(req.body);
        // if (body.numList==null || body.numList=="" || body.numList.length==0 || body.tmplName=="")
        //     throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        this.pointerRecordService.convert(req.ro, body, profile)

        return { success: true }
    }
}
