import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-number-list',
  templateUrl: './number-list.component.html',
  styleUrls: ['./number-list.component.scss']
})
export class NumberListComponent implements OnInit {

  //sql Scripts Table
  sqlScripts: any[] = [];
  selectedSqlScripts: any[] =[]
  sqlScriptsLoading: boolean = false;

  autoRunStatuses: any[] = [];

  //Number List Table
  numberList: any[] = [];
  selectedNumbers: any[] =[];
  numberListLoading: boolean = false;
  filterEntities: any[] = [];
  filterRespOrgIds: any[] = [];
  filterTemplateName: any[] = [];
  filterStatus: any[] = [];

  constructor() { }

  async ngOnInit() {
    this.sqlScripts = [
      {
        id: 1,
        username: 'xqg01rxk1',
        sqlScript: `SQL START SET PAGES 60 SELECT ENTITY, ORG, DIALNBR, NUMBERSTATUS FROM RHDB_NAREP_XQG18;SQL END`,
        autoRun: true
      },
      {
        id: 2,
        username: 'sadmin',
        sqlScript: `SQL START SET PAGES 60 SELECT ENTITY, ORG, DIALNBR, NUMBERSTATUS FROM RHDB_NAREP_XQG01; SQL END`,
        autoRun: false
      },
    ];

    this.autoRunStatuses = [
      {label: 'TRUE', value: true},
      {label: 'FALSE', value: false},
    ];

    this.numberList = [
      {
        id: 1,
        entity: 'AK',
        respOrgId: 'AKG01',
        templateName: '*AKBRBRC01-8041',
        tollFreeNumber: '833-539-8657',
        status: 'WORKING',
        submitDate: '01/09/2023 12:00 AM',
      },
      {
        id: 2,
        entity: 'EJ',
        respOrgId: 'EJT01',
        templateName: '',
        tollFreeNumber: '833-389-0285',
        status: 'UNAVAILABLE',
        submitDate: '11/02/2022 12:00 AM',
      },
      {
        id: 3,
        entity: 'TT',
        respOrgId: 'TTA01',
        templateName: '*AKBRBRC01-8041',
        tollFreeNumber: '833-539-8657',
        status: 'RESERVED',
        submitDate: '11/02/2022 12:00 AM',
      },
    ];
  }

  onSubmit = () => {

  }

  onConvert = () => {

  }

  onActivate = () => {
    
  }

  onDownload = () => {
    
  }

}
