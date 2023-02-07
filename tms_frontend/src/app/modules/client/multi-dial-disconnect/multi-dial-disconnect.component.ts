import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-multi-dial-disconnect',
  templateUrl: './multi-dial-disconnect.component.html',
  styleUrls: ['./multi-dial-disconnect.component.scss']
})
export class MultiDialDisconnectComponent implements OnInit {

  inputDialNumbers: string = '';
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
        date: '11/29/2022 05:10 PM',
        effDateTime: '11/29/2022 05:15 PM',
        interceptDate: '11/29/2022 05:20 PM',
        total: 1,
        completed: 1,
        message: '',
        progressStatus: true,
      }
    ];
  }

  onCsvXlUploadAuto = (event: Event) => {

  }

  onSubmit = () => {
    
  }

  onClear = () => {

  }

}
