import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-referral-number-query',
  templateUrl: './referral-number-query.component.html',
  styleUrls: ['./referral-number-query.component.scss']
})
export class ReferralNumberQueryComponent implements OnInit {

  inputTollFreeNumber: string = '';

  results: any[] = [];
  resultLoading: boolean = false;

  constructor() { }

  async ngOnInit() {
    this.results = [
      {
        id: 1,
        createdBy: 'XQG01RXK',
        submitDate: '11/29/2022 05:10 PM',
        total: 1,
        completed: 1,
        message: '',
        progressStatus: true,
      }
    ];
  }

  onRetrieve = () => {

  }

}
