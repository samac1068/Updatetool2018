import { CommService } from './../../services/comm.service';
import { Component, OnInit, Input } from '@angular/core';
import { Tab } from 'src/app/models/Tab.model';

@Component({
  selector: 'app-query-btns',
  templateUrl: './query-btns.component.html',
  styleUrls: ['./query-btns.component.css']
})
export class QueryBtnsComponent implements OnInit {
  
  @Input() tabinfo: Tab;
  constructor(private comm: CommService) { }

  ngOnInit() {
  }

  openColumnWindow() {
    //Just announce the button was clicked
    if(this.tabinfo.table)
      this.comm.columnBtnClicked.emit();
    else
      alert("You need to select a table first");
  }
}
