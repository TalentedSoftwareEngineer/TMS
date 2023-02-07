import { Component, OnInit } from '@angular/core';
import { RESPORG_REG_EXP } from '../../constants';

@Component({
  selector: 'app-multi-dial-resporgchange',
  templateUrl: './multi-dial-resporgchange.component.html',
  styleUrls: ['./multi-dial-resporgchange.component.scss']
})
export class MultiDialResporgchangeComponent implements OnInit {

  gConst = {
    RESPORG_REG_EXP
  }

  inputDialNumbers: string = '';
  inputRequestName: string = '';
  inputNewRespOrg: string = '';
  roErr: boolean = false;
  inputMessage: string = '';

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  constructor() { }

  async ngOnInit() {
    this.activityLogs = [
      {
        id: 1,
        name: 'sadmin',
        newRespOrg: 'AKG01',
        createdBy: 'XQG01RXK',
        date: '11/29/2022 05:10 PM',
        total: 1,
        completed: 1,
        message: '',
        progressStatus: true,
      }
    ];
  }

  onCsvXlUploadAuto = (event: Event) => {

  }

  onInputNewRespOrg = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    let value = input.value.toUpperCase()
    this.inputNewRespOrg = value;

    input.setSelectionRange(start, end);

    let reg = this.gConst.RESPORG_REG_EXP

    if (!reg.test(value) && value.length >= 5) {
      this.roErr = true;
    } else {
      this.roErr = false;
    }
  }

  onSubmit = () => {
    
  }

  onClear = () => {

  }

}
