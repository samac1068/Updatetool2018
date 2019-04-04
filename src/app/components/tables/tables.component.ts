import { CommService } from './../../services/comm.service';
import { DataService } from 'src/app/services/data.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { Tab } from 'src/app/models/Tab.model';
import { Table } from 'src/app/models/Table.model';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {

 @Input() tabinfo: Tab; 
 
 searchTerm: string;

  constructor(private data: DataService, private comm: CommService) { }

  ngOnInit() {
    //Listeners
    if(this.tabinfo)
    {
      this.data.getTableDBList(this.tabinfo.server.replace('{0}', this.tabinfo.database), this.tabinfo.database).subscribe((results) => {
        this.processTableList(results);
      });  
    }
  }

  processTableList(tables: any){
    var tempArr = [];

    for (var tbl of tables)
    {
        var temp:Table = new Table();
        temp.name = tbl.Name;
    
        tempArr.push(temp);
    }

    this.tabinfo.seltbllist = tempArr;
    this.storeTableList(tempArr);
  }

  storeTableList(tables: any) {
    var index: number = 0;
    var dbid: number = -1;

    //Determine the DB ID
    for (var db of this.tabinfo.databasearr) {
      if(db.name == this.tabinfo.database){
        dbid = db.id;
        break;
      }
    }

    for(var i=0; i < tables.length; i++) {
      index++;
      this.tabinfo.tablearr.push({id: index, name: tables[i].name, dbid: dbid}); 
    }
  }

  tableClickHandler(table: Table) {
    //Make sure there was a change before sending the information
    if(this.tabinfo.table == undefined || this.tabinfo.table.name != table.name)
    {
      for (var tbl of this.tabinfo.seltbllist)
        tbl.isSelected = (tbl.name == table.name) ? true : false;
  
      //Update tabinfo before sending
      this.tabinfo.table = table;
  
      //report the table selection
      this.comm.tableSelected.emit(this.tabinfo);    
    }
  }

  resetSearchTerm() {
    this.searchTerm = "";
  }

  reloadCurrentData() {
    if(this.tabinfo.querystr != "" && this.tabinfo.querystr != undefined)
      this.comm.runQueryChange.emit();
    else
      alert("No query has been created. Request Aborted.");
  }
}
