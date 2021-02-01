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
      alert("Custom Column Error: You must select a table first.");
  }

  openOrderByWindow() {
    if(this.tabinfo.table)
      this.comm.orderByBtnClicked.emit();
    else
      alert("Order By Error: You must select a table first.");
  }

  openJoinWindow() {
    if(this.tabinfo.table)
      this.comm.joinBtnClicked.emit();
    else
      alert("Join Error: You must select a table first.")
  }

  openViewerWindow() {
    this.comm.viewerBtnClicked.emit();
  }

  exportToExcelHandler(type: string) {
    if(this.tabinfo.table != undefined)
      this.comm.exportToExcelClicked.emit(type);
    else
      alert("You must select table and have results to export data.");
  }

  copyToClipboard() {
    if(this.tabinfo.table != undefined)
      this.comm.copyToClipboardClicked.emit();
    else
      alert("You must select table and have results to export data.");
  }
}
