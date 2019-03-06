import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tab } from 'src/app/models/Tab.model';

@Component({
  selector: 'app-select-pnl',
  templateUrl: './select-pnl.component.html',
  styleUrls: ['./select-pnl.component.css']
})
export class SelectPnlComponent implements OnInit {
  @Input() tabinfo: Tab;
  
  constructor() { }

  ngOnInit() {
    
  }
}
