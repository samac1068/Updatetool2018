import { DataService } from './../../services/data.service';
import { StorageService } from './../../services/storage.service';
import { CommService } from './../../services/comm.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Tab } from 'src/app/models/Tab.model';
import { MatSort, MatTableDataSource } from '@angular/material';


@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.css']
})
export class QueryResultComponent implements OnInit {
  
  @Input() tabinfo: Tab;
  @ViewChild(MatSort) sort: MatSort;
  
  colHeader: string[];
  rtnResults: any[];
  dataSource: any;

  constructor(private comm: CommService, private data: DataService, private store: StorageService) { }

  ngOnInit() {
    //Listner
    this.comm.tableSelected.subscribe((data) => {
      this.newTableSelected();  
    });
  }

  newTableSelected(){
    this.initilizeTheQuery();
    this.tabinfo.querystr = `SELECT TOP 10 ${this.tabinfo.colfilterarr}  FROM ${this.tabinfo.database}..${this.tabinfo.table.name}`
    this.executeSQL();
  }

  initilizeTheQuery() {
    this.tabinfo.colfilterarr = ["*"];
    this.tabinfo.wherearr = [""];
    this.tabinfo.joinarr = [""];
    this.tabinfo.orderarr = [""];
    this.tabinfo.getcount = false;
    this.tabinfo.limitRows = false;
    this.tabinfo.selectcnt = "0";
    this.colHeader = [];
  }

  executeSQL(){
    //Run out and get what we need
    var col: string = (this.tabinfo.colfilterarr[0] == "*") ? "" : this.tabinfo.colfilterarr.join();  //Separated by comma
    var where: string = this.tabinfo.wherearr.join(" ");  // Separated by a space
    var join: string = this.tabinfo.joinarr.join(" "); //Separated by a space
    var order: string = this.tabinfo.orderarr.join(); //Separated by a comma
    
    this.data.getQueryData(this.tabinfo.server.replace('{0}', this.tabinfo.database), this.tabinfo.database, this.tabinfo.table.name, 
    (col.length == 0) ? '0' : col, (where.length == 0) ? '0' : where, (join.length == 0) ? '0' : join, (order.length == 0) ? '0' : order, 
      this.tabinfo.getcount, this.tabinfo.limitRows, this.tabinfo.selectcnt).subscribe((results) => {
        this.processReturnedData(results);
      })
  }

  processReturnedData(results){
    //Need to collect the column headers first
    for(var key in results[0]){
      this.colHeader.push(key);
    }
    
    this.tabinfo.availcolarr = this.colHeader;

    //Want to store the list of columns available
    this.comm.columnsUpdated.emit(this.colHeader);

    //Load the data into the common variable
    this.dataSource = new MatTableDataSource(results);

    //Enable sorting
    this.dataSource.sort = this.sort;
  }
}
