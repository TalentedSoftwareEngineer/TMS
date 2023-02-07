import { Component, OnInit } from '@angular/core';
import { TMPL_ERR_TYPE } from '../../constants';

@Component({
  selector: 'app-multi-conversion-pointer-record',
  templateUrl: './multi-conversion-pointer-record.component.html',
  styleUrls: ['./multi-conversion-pointer-record.component.scss']
})
export class MultiConversionPointerRecordComponent implements OnInit {
  gConst = {
    TMPL_ERR_TYPE
  }

  inputDialNumbers: string = '';
  inputTemplateName: string = '';
  tmplErrType: string = this.gConst.TMPL_ERR_TYPE.NONE;
  inputRequestName: string = '';
  inputEffDateTime: Date|null = null;
  minEffDateTime: Date = new Date();
  effDateErr: boolean = false;
  inputNow: boolean = false;
  inputInterDate: Date|null = null;
  interDateErr: boolean = false;
  yes_no = [
    {name: 'YES', value: 'Y'},
    {name: 'NO', value: 'N'}
  ];
  inputYesNo = {name: 'YES', value: 'Y'};
  inputMessage: string = '';

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  constructor() { }

  async ngOnInit() {
    this.activityLogs = [
      {
        id: 1,
        name: 'sadmin',
        createdBy: 'XQG01RXK',
        submitDate: '11/29/2022 05:10 PM',
        effDateTime: '11/29/2022 05:15 PM',
        templateName: '',
        total: 1,
        completed: 1,
        message: '',
        progressStatus: true,
      }
    ];
  }

  onCsvXlUploadAuto = (event: Event) => {

  }

  onInputTemplateName = () => {
    this.tmplErrType = this.gConst.TMPL_ERR_TYPE.NONE;
  }

  onSubmit = () => {
    
  }

  onClear = () => {

  }

}
