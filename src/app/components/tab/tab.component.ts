import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {

  @Input() tabTitle: string;
  @Input() tabId: number;
  @Input() server: string;
  @Input() database: string;
  @Input() active = false;

  constructor() { }

  ngOnInit() {
  }

}
