import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-multi-dial-spare',
  templateUrl: './multi-dial-spare.component.html',
  styleUrls: ['./multi-dial-spare.component.scss']
})
export class MultiDialSpareComponent implements OnInit {

  inputDialNumbers: string = '';
  inputRequestName: string = '';
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
