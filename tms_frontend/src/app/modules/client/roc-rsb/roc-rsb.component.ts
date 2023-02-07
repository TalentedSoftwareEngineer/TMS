import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { StoreService } from 'src/app/services/store/store.service';
import * as gFunc from 'src/app/utils/utils';
import {
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_COMMON,
  SPECIFICNUM_REG_EXP,
  PHONE_NUMBER_WITH_HYPHEN_REG_EXP
 } from '../../constants';

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

  attachmentTypeOptions: any[] = [
    {name: 'LOA is not Required', value: 'LoaN'},
    {name: 'Add LOA Attachment', value: 'LoaA'},
    {name: 'Generate LOA Attachment', value: 'LoaG'},
  ];
  selectAttachmentType: string = 'LoaN';

  constructor(
    public api: ApiService,
    public store: StoreService,
  ) { }

  async ngOnInit() {
    // this.inputContactName = this.store.getContactInformation()?.name;
    // this.inputContactNumber = this.store.getContactInformation()?.number;
    this.store.state$.subscribe(async (state) => {
      this.inputContactName = state.contactInformation.name;
      this.inputContactNumber = state.contactInformation.number;
    })
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
      this.inputTollFreeNumbers = nums.join(",");
      // check if the number list is valid
      let specificNumReg = SPECIFICNUM_REG_EXP
      let isValid = true
      for (let el of nums) {
        console.log("el: " + el)
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

  }

  onUploadAttachmentFile = () => {

  }

  onClickGenerate = () => {

  }

  onUploadDocFile = () => {

  }

  onCancel = () => {
    
  }

  onSubmit = () => {
    
  }
}