import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/store/store.service';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

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

  constructor(
    private store: StoreService,
    public router: Router,
    private messageService: MessageService
  ) { }

  async ngOnInit() {
    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.RESERVE_NUMBER_LIST)) {
      } else {
        // no permission
        this.showWarn("You have no permission for this page")
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

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
