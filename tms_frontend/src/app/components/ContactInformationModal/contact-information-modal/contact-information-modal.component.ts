import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CONTACT_NAME_REG_EXP, CONTACT_NUMBER_REG_EXP } from 'src/app/modules/constants';
import {StoreService} from "../../../services/store/store.service";
import { ApiService } from 'src/app/services/api/api.service';
import { Router } from '@angular/router';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'contact-information-modal',
  templateUrl: './contact-information-modal.component.html',
  styleUrls: ['./contact-information-modal.component.scss']
})
export class ContactInformationModalComponent implements OnInit {

  openModal: boolean = false;

  inputContactName: string = '';
  validContactName: boolean = true;
  inputContactNumber: string = '';
  validContactNumber: boolean = true;
  inputNotes: string = '';
  inputChangeDefaultContactInformation: boolean = false;

  timeout_id: any;

  @HostListener('document:click', ['$event'])
  clickWindow(event: any) {
    if(event.target.id=='btn_contactInformation') {
      this.inputContactName = this.store.getContactInformation()?.name;
      this.validContactName = CONTACT_NAME_REG_EXP.test(this.inputContactName==undefined?'':this.inputContactName);
      this.inputContactNumber = this.store.getContactInformation()?.number;
      this.validContactNumber = CONTACT_NUMBER_REG_EXP.test(this.inputContactNumber==undefined?'':this.inputContactNumber);
      this.inputNotes = this.store.getContactInformation()?.notes;
      this.inputChangeDefaultContactInformation = false;
      this.openModal = true;
    }

    clearTimeout(this.timeout_id);
    this.timeout_id = setTimeout(()=>{
      this.onSignout();
    }, 900000);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    clearTimeout(this.timeout_id);
    this.timeout_id = setTimeout(()=>{
      this.onSignout();
    }, 900000);
  }

  constructor(
    public store: StoreService,
    public api: ApiService,
    private route: Router,
  ) { }

  async ngOnInit() {
    // this.api.test().subscribe(res=>{
    //   console.log(res);
    // });
  }

  onSignout = () => {
    this.store.removeCurrentRo();
    this.store.removeToken();
    // this.store.removeUser();

    this.route.navigateByUrl(ROUTES.login);
  }

  onInputContactName = () => {
    this.validContactName = CONTACT_NAME_REG_EXP.test(this.inputContactName==undefined?'':this.inputContactName);
  }

  onInputContactNumber = () => {
    this.validContactNumber = CONTACT_NUMBER_REG_EXP.test(this.inputContactNumber==undefined?'':this.inputContactNumber);
  }

  closeModal = () => {
    this.openModal = false;
  }

  SaveContactInformation = () => {
    this.validContactName = CONTACT_NAME_REG_EXP.test(this.inputContactName==undefined?'':this.inputContactName);
    this.validContactNumber = CONTACT_NUMBER_REG_EXP.test(this.inputContactNumber==undefined?'':this.inputContactNumber);
    if(!this.validContactName || !this.validContactNumber) {
      return;
    }

    this.api.updateContactInformation({
      contact_name: this.inputContactName,
      contact_number: this.inputContactNumber,
      ro: this.store.getCurrentRo(),
      isDefault: this.inputChangeDefaultContactInformation,
    }).subscribe(res=>{
      this.store.storeContactInformation({
        name: this.inputContactName,
        number: this.inputContactNumber,
        notes: this.inputNotes
      });
    });

    this.closeModal();
  }
  

}
