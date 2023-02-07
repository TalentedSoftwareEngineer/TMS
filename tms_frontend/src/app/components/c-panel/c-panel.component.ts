import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'c-panel',
  templateUrl: './c-panel.component.html',
  styleUrls: ['./c-panel.component.scss']
})
export class CPanelComponent implements OnInit, AfterViewInit {

  @ViewChild('display_panel_body') display_panel_body!: ElementRef;
  @ViewChild('panelBody_ngContent_container') panelBody_ngContent_container!: ElementRef;
  @Input('panelHeader_title') panelHeader_title!: string;

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.display_panel_body.nativeElement.appendChild(this.panelBody_ngContent_container.nativeElement);
  }

}
