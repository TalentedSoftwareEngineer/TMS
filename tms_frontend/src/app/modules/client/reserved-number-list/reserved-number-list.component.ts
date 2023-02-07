import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reserved-number-list',
  templateUrl: './reserved-number-list.component.html',
  styleUrls: ['./reserved-number-list.component.scss']
})
export class ReservedNumberListComponent implements OnInit {

  //Reserved Number List Table
  reservedNumbers: any[] = [];
  selectedReservedNumbers: any[] = [];
  reservedNumberListLoading: boolean = false;

  //Multi Creating Result
  multiCreatingResults: any[] =[];
  multiCreatingResultLoading: boolean = false;

  constructor() { }

  async ngOnInit() {
    this.reservedNumbers = [
      {
        id: 1,
        tollFreeNumber: '833-389-0285',
        auctionedTFN: '',
        reservedDate: '12/02/2022 12:00 AM',
        reservedUntilDate: '12/02/2022 12:00 AM',
        contactPerson: 'admin',
        contactNumber: '833-579-6883'
      },
    ];

    this.multiCreatingResults = [
      {
        id: 1,
        createdBy: 'XQG01RXK',
        submitDate: '11/29/2022 05:10 PM',
        templateName: '*XQG01-0003',
        effectiveTime: 'NOW',
        total: 1,
        completed: 1,
        message: '',
        progressStatus: true,
      }
    ];
  }

  onSpare = () => {

  }

  onActivate = () => {
    
  }

}
