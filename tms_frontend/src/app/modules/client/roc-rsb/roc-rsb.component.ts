import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ROUTES } from 'src/app/app.routes';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ApiService } from 'src/app/services/api/api.service';
import { StoreService } from 'src/app/services/store/store.service';
import * as gFunc from 'src/app/utils/utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_COMMON,
  SPECIFICNUM_REG_EXP,
  PHONE_NUMBER_WITH_HYPHEN_REG_EXP,
  PAGE_NO_PERMISSION_MSG
 } from '../../constants';
 import { toBase64 } from 'src/app/helper/utils';
 import Cookies from "universal-cookie";

@Component({
  selector: 'app-roc-rsb',
  templateUrl: './roc-rsb.component.html',
  styleUrls: ['./roc-rsb.component.scss']
})
export class RocRsbComponent implements OnInit {

  gConst = {
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_COMMON,
  }

  requestTypeOptions: any[] = [
    {name: 'Resp Org Change', value: 'EMERGENCY'},
    {name: 'Future Date a Resp Org Change', value: 'FUTURE'},
    {name: 'Expedite Resp Org Change', value: 'EXPEDITE'},
  ];
  selectRequestType: any = 'EMERGENCY';

  inputEffDate: any;
  radioContactInfo: string = 'USE_MY_INFO';
  inputContactName: string = '';
  inputContactNumber: string = '';
  inputContactEmail: string = '';
  inputContactCompany: string = '';
  inputNotes: string = '';

  inputTollFreeNumbers: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;

  respOrgIDOptions: any[] = [];
  selectRespOrgID: string = '';
  oldRespOrgID: string = '';

  attachmentTypeOptions: any[] = [
    {name: 'LOA is not Required', value: 'LoaN'},
    {name: 'Add LOA Attachment', value: 'LoaA'},
    {name: 'Generate LOA Attachment', value: 'LoaG'},
  ];
  selectAttachmentType: string = 'LoaN';

  standardLoaForm: FormGroup = new FormGroup({
    custName: new FormControl('', [Validators.required, Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>&'']{1,50}$"))]),
    lastName: new FormControl(''), 
    cmpyAddress1: new FormControl('', [Validators.required, Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>]{1,500}$"))]),
    cmpyAddress2: new FormControl('', [Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>]{1,500}$"))]),
    city: new FormControl('', [Validators.required, Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>&']{1,50}$"))]),
    zipCode: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required, Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>&']{1,50}$"))]),
    authCusContact: new FormControl('', [Validators.required, Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>&'']{1,50}$"))]),
    authCusTitle: new FormControl('', [Validators.required, Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>&'']{1,50}$"))]),
    authCusPhone: new FormControl('', [Validators.required, Validators.pattern(RegExp("^[0-9]{10}$"))]),
    authCusExt: new FormControl('', [Validators.pattern(/^\d+$/)]),
    email: new FormControl('', [Validators.pattern(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)]),
    respOrgInst: new FormControl('', [Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>'&]{0,300}$"))]),
    endUsrInf: new FormControl('', [Validators.pattern(RegExp("^[\\w\\d@!#\\$%&*()`+=\\-\\[\\]\\\\';,\\./\\{\\}\\:\\?\\s][^<>'&]{0,700}$"))]),
  });

  flagOpenModal: boolean = false;
  inputFirstName: string = '';
  validFirstName: boolean = true;
  inputLastName: string = '';
  validLastName: boolean = true;
  inputCmpyAddress1: string = '';
  validCmpyAddress1: boolean = true;
  inputCmpyAddress2: string = '';
  inputCity: string = '';
  validCity: boolean = true;
  inputZipCode: string = '';
  validZipCode: boolean = true;
  inputState: string = '';
  validState: boolean = true;
  inputAuthCusContact: string = '';
  validAuthCusContact: boolean = true;
  inputAuthCusTitle: string = '';
  validAuthCusTitle: boolean = true;
  inputAuthCusPhone: string = '';
  validAuthCusPhone: boolean = true;
  inputAuthCusExt: string = '';
  inputEmail: string = '';
  inputRespOrgInst: string = '';
  inputEndUsrInf: string = '';

  fileIds: any[] = [];
  loaId: any;
  isLoaGenerate: boolean = false;
  generatedLoaFile: any;

  constructor(
    public api: ApiService,
    public store: StoreService,
    private messageService: MessageService,
    public router: Router
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

    if(this.store.getUser().permissions?.includes(PERMISSIONS.ROC_CHANGE_REQUEST)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }
    
    this.store.state$.subscribe(async (state) => {
      this.inputContactName = state.contactInformation.name;
      this.inputContactNumber = state.contactInformation.number;
    })

    let loggedUser_ros = this.store.getUser().ro.split(',');
    loggedUser_ros.sort();
    this.respOrgIDOptions = loggedUser_ros.map(item=>({name: item, value: item}));

    this.initialDataLoading();
  }

  initialDataLoading = () => {
    const cookies = new Cookies();
    let numList = cookies.get("numList");
    let newRespOrgID = cookies.get("newRespOrgID");
    let oldRespOrgID = cookies.get("oldRespOrgID");
    let requestType = cookies.get("requestType");
    let loaId = cookies.get("loaId");
    let loaFileName = cookies.get("loaFileName");
    let additionalDocuments = cookies.get("additionalDocuments");
    let effectiveDate = cookies.get("effectiveDate");
    
    if(Boolean(numList) && numList!='undefined')
    {
      this.inputTollFreeNumbers = numList.toString();
      this.onNumFieldFocusOut();
    }

    if(Boolean(newRespOrgID) && newRespOrgID!='undefined')
    {
      setTimeout(()=>{this.selectRespOrgID = String(newRespOrgID).trim();}, 1000)
    }

    if(Boolean(oldRespOrgID) && oldRespOrgID!='undefined')
      this.oldRespOrgID = oldRespOrgID;

    if(Boolean(requestType) && requestType!='undefined')
      this.selectRequestType = requestType;

    if(Boolean(loaId) && loaId!='undefined')
      this.loaId = loaId;

    if(Boolean(loaFileName) && loaFileName!='undefined')
      this.selectAttachmentType = 'LoaA'

    if(Boolean(additionalDocuments) && additionalDocuments!='undefined')
      this.fileIds = additionalDocuments.map((item: any)=>(item.documentID));

    if(Boolean(effectiveDate) && effectiveDate!='undefined')
      this.inputEffDate = new Date(effectiveDate)

    cookies.remove("numList");
    cookies.remove("newRespOrgID");
    cookies.remove("oldRespOrgID");
    cookies.remove("requestType");
    cookies.remove("loaId");
    cookies.remove("loaFileName");
    cookies.remove("additionalDocuments");
    cookies.remove("effectiveDate");
    console.log(this.selectRespOrgID);
  }

  isSubmitDisable = (selectAttachmentType: string): boolean => {
    if(this.inputTollFreeNumbers == '' || this.invalidNumType === this.gConst.INVALID_NUM_TYPE_COMMON) {
      return true;
    } else {
      switch(selectAttachmentType) {
        case 'LoaN':
          return false;
        case 'LoaA':
          return !Boolean(this.loaId);
        case 'LoaG':
          return !this.isLoaGenerate;
        default:
          return true;
      }
    }
  }

  isStandardLoaFormFieldValid(field: string) {
    return !this.standardLoaForm.get(field)?.valid && this.standardLoaForm.get(field)?.touched;
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(field => {  //{2}
      const control = formGroup.get(field);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  onChangeRequestType = () => {

  }

  onCsvXlUploadAuto = async (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      let file: File = event.target.files.item(0)

      const reader: FileReader = new FileReader()
      if (file.type === 'text/csv') {
        reader.readAsText(file)

        reader.onload = (e: any) => {
          const data = e.target.result;
          let arr_csvContent = String(data).split("\n");
          let phoneNumbers = arr_csvContent.filter(item=>PHONE_NUMBER_WITH_HYPHEN_REG_EXP.test(item)).map(item=>item.replace('\r', ''));
          this.inputTollFreeNumbers = phoneNumbers.toString();
          this.onNumFieldFocusOut();
        }
      }
    }
  }

  onNumFieldFocusOut = () => {

    let num = this.inputTollFreeNumbers;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
      nums = nums.filter((item, index)=>(nums.indexOf(item)===index));
      this.inputTollFreeNumbers = nums.join(",");
      // check if the number list is valid
      let specificNumReg = SPECIFICNUM_REG_EXP
      let isValid = true
      for (let el of nums) {
        if (!specificNumReg.test(el)) {   // if anyone among the number list is invalid, the number list is invalid.
          isValid = false
          break
        }
      }

      if (!isValid) {
        this.invalidNumType = INVALID_NUM_TYPE_COMMON
      } else {
        this.invalidNumType = INVALID_NUM_TYPE_NONE;
      }
    } else if (num == null || num === "") {
      this.invalidNumType = INVALID_NUM_TYPE_NONE;
    }
  }

  onChangeAttachmentType = () => {
    this.isLoaGenerate = false;
    this.generatedLoaFile = null;
    this.loaId = '';
  }

  onClickUploadAttachmentFile = (event: Event) => {
    let input: any = (event.target as HTMLInputElement);
    input.value = null;
  }

  onUploadAttachmentFile = async (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      try {
        let file: File = event.target.files.item(0)
        const items = file.name.split('.')
        let file_extension = items[items.length - 1]
        let encoded_file: any = await toBase64(file)
        encoded_file = encoded_file.split(',')[1];

        if(encoded_file.length > 1024*1024*2) {
          this.showWarn('Invalid File Size. Allowed size are 2MB.');
          return;
        }
        if(file_extension!='pdf' && file_extension!='tiff') {
          this.showWarn('Invalid File Format. Allowed formats are .pdf,.tiff.');
          return;
        }

        let body = {extension: file_extension, encoded_file}

        let formData = new FormData();
        formData.set('file', event.target.files[0]);

        this.api.uploadLOA(body).subscribe(res=>{
          this.loaId = res.loaID;
        });
      } catch (e) {
      } finally {}
    }
  }

  onClickGenerate = () => {
    this.flagOpenModal = true;
  }

  onClickGeneratedLoaDownload = () => {
    const content = `data:${this.generatedLoaFile.mimeType};base64,${this.generatedLoaFile.fileContent}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = content;
    downloadLink.download = this.generatedLoaFile.fileName;
    downloadLink.click();
    downloadLink.remove();
  }

  onClickUploadDocFile = (event: Event) => {
    let input: any = (event.target as HTMLInputElement);
    input.value = null;
  }

  onSelectDocFile = async (event: any) => {
    if (event.files && event.files.length > 0) {

      let file: File = event.files.item(0)
      const items = file.name.split('.')
      let file_extension = items[items.length - 1]
      let encoded_file: any = await toBase64(file)
      encoded_file = encoded_file.split(',')[1];

      let body = {extension: file_extension, encoded_file}

      this.api.uploadDoc(body).subscribe(res=>{
        this.fileIds.push(res.fileId);
      });
    }
  }

  onRemoveDocFile = async (event: any) => {

  }

  onCancel = () => {

  }

  onSubmit = () => {
    let data: any = {
      numList: this.inputTollFreeNumbers.split(',').map(item=>(item.replace(/\D/g, ''))),
      newRespOrgID: this.selectRespOrgID,
      requestType: this.selectRequestType,
    }

    if(this.selectAttachmentType == 'LoaA' && Boolean(this.loaId))
      data.loaId = this.loaId;

    if(this.fileIds.length > 0)
      data.additionalDocuments = this.fileIds.map(item=>({fileId: item}));

    if(Boolean(this.inputNotes))
      data.notes = this.inputNotes;

    if(this.selectRequestType=='FUTURE' && Boolean(this.inputEffDate))
      data.effectiveDate = this.inputEffDate;
    
    this.api.submitROC(data).subscribe(res=>{
      this.fileIds = [];
      this.selectAttachmentType = 'LoaN'
      this.loaId = ''
      this.showSuccess('Resp Org Change Request Submitted Successfully.');
    });
  }

  closeModal = () => {
    this.flagOpenModal = false;
    this.standardLoaForm.reset();
  }

  onModalSubmit = () => {
    if (this.standardLoaForm.invalid) {
      this.validateAllFormFields(this.standardLoaForm)
      return
    }

    let data = {
      numList: this.inputTollFreeNumbers.split(',').map(item=>(item.replace(/\D/g, ''))),
      custName: this.inputFirstName,
      cmpyAddress1: this.inputCmpyAddress1,
      cmpyAddress2: this.inputCmpyAddress2,
      city: this.inputCity,
      zipCode: this.inputZipCode,
      state: this.inputState,
      authCusContact: this.inputAuthCusContact,
      authCusTitle: this.inputAuthCusTitle,
      authCusPhone: this.inputAuthCusPhone,
      authCusExt: this.inputAuthCusExt,
      email: this.inputEmail,
      respOrgInst: this.inputRespOrgInst,
      endUsrInf: this.inputEndUsrInf,
    }

    this.api.generateLOAFile(data).subscribe(res=>{
      console.log(res);
      this.closeModal();
      this.isLoaGenerate = true;
      this.generatedLoaFile = res;
      this.showSuccess('Success Generated!');
    });
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
