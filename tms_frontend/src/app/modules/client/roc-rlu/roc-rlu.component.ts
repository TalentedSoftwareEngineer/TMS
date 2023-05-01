import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/store/store.service';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { PAGE_NO_PERMISSION_MSG } from '../../constants';
import { toBase64 } from 'src/app/helper/utils';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-roc-rlu',
  templateUrl: './roc-rlu.component.html',
  styleUrls: ['./roc-rlu.component.scss']
})
export class RocRluComponent implements OnInit {

  uploadLoaFileContent: any;

  constructor(
    private store: StoreService,
    private messageService: MessageService,
    public router: Router,
    private api: ApiService
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

    // this.store.state$.subscribe(async (state)=> {

    // })

    if(this.store.getUser().permissions?.includes(PERMISSIONS.ROC_LOA_UPLOAD)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }
  }

  onClickBrowse = (event: Event) => {
    let input: any = (event.target as HTMLInputElement);
    input.value = null;
  }

  onChangeBrowse = async (event: any) => {
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

        this.uploadLoaFileContent = {extension: file_extension, encoded_file}
      } catch (e) {
      } finally {}
    }
  }

  onClickSubmit = () => {
    if(Boolean(this.uploadLoaFileContent)) {
      this.api.uploadLOA(this.uploadLoaFileContent).subscribe(res=>{
        this.uploadLoaFileContent = null;
      }); 
    }
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
