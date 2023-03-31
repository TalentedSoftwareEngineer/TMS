import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/store/store.service';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { PAGE_NO_PERMISSION_MSG } from '../../constants';

@Component({
  selector: 'app-roc-rlu',
  templateUrl: './roc-rlu.component.html',
  styleUrls: ['./roc-rlu.component.scss']
})
export class RocRluComponent implements OnInit {

  constructor(
    private store: StoreService,
    private messageService: MessageService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.ROC_LOA_UPLOAD)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })
  }

  onBrowse = (event: any) => {

  }

  onClickSubmit = () => {

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
