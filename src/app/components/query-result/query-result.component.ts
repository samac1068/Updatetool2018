import { ExcelService } from './../../services/excel.service';
import { DataService } from './../../services/data.service';
import { StorageService } from './../../services/storage.service';
import { CommService } from './../../services/comm.service';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Tab } from 'src/app/models/Tab.model';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { QueryDialogComponent } from 'src/app/dialogs/query-dialog/query-dialog.component';

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

  constructor(private comm: CommService, private data: DataService, private store: StorageService, private excel: ExcelService, public dialog: MatDialog) { }

  ngOnInit() {
    //Listner
    this.comm.tableSelected.subscribe(() => {
      this.newTableSelected();  
    });

    //Change to the query has happened so run the query
    this.comm.runQueryChange.subscribe(() => {
      this.constructSQLString();
    });

    this.comm.runStoredQuery.subscribe((data) => {
      this.executeStoredQuery(data);
    });

    this.comm.exportToExcelClicked.subscribe((data) => {
      this.exportAsXLSX(data);
    });

    this.comm.saveNewQuery.subscribe(() => {
      this.saveCurrentQuery();
    });
  }

  newTableSelected(){
    this.initilizeTheQuery();
    this.constructSQLString();
  }

  initilizeTheQuery() {
    this.tabinfo.colfilterarr = ["*"];
    this.tabinfo.wherearr = [];
    this.tabinfo.wherearrcomp = []; //{wid: 0, str: "", condition: "", type: "", name: "", operator: "", value: ""}
    this.tabinfo.joinarr = [];
    this.tabinfo.orderarr = [];
    this.tabinfo.getcount = false;
    this.tabinfo.limitRows = false;
    this.tabinfo.selectcnt = "0";
    this.colHeader = [];
  }

  constructSQLString() {
    //Build the string exactly like the web service
    var strSQL = "SELECT ";

    //Build the return
    if(this.tabinfo.getcount)
      strSQL += "COUNT (*) AS [Count] FROM ";
    else if (parseInt(this.tabinfo.selectcnt) > 0)
      strSQL += "TOP " + this.tabinfo.selectcnt + " ";
    else if (this.tabinfo.wherearrcomp.length == 0 && this.tabinfo.colfilterarr[0] == "*" && parseInt(this.tabinfo.selectcnt) != -9) 
      strSQL += "TOP 10 ";
      
    //What columns do we want
    if(this.tabinfo.colfilterarr[0] == "*" || parseInt(this.tabinfo.selectcnt) == -9)
      strSQL += "* ";
    else
      strSQL += this.tabinfo.colfilterarr.join() + " ";
    
    //Include the FROM
    strSQL += "FROM ";
    
    //Add the database and table info
    strSQL += "[" + this.tabinfo.database + "]..[" + this.tabinfo.table.name + "] ";

    //Add Join statement
    if(this.tabinfo.joinarr.length > 0)
      strSQL += this.constructJoin();
    
    //Where Clause
    if(this.tabinfo.wherearrcomp.length > 0)
      strSQL += this.constructWhereClause();
    
    // Order By  
    if(this.tabinfo.orderarr.length > 0)
      strSQL += this.constructOrderBy();
      
    //Display the information  
    this.tabinfo.querystr = strSQL;
    
    //Run the string based on this information (it won't be a direct run)
    this.executeSQL();
  }

  constructWhereClause(){
    //Manually join the where clause adding in the appropriate conditioning statements
    var wStr: string = "WHERE ";
    for(var i = 0; i < this.tabinfo.wherearrcomp.length; i++){
      var row: any = this.tabinfo.wherearrcomp[i];

      //Add in the condition for the second + where item  
      if(i > 0)
        wStr += " " + row.condition + " ";

      //Add the column and opeator
      wStr += row.name + " " + row.operator + " ";
      
      //Add the value (quote if type requires)
      switch (row.type) {
        case "char":
				case "varchar":
				case "datetime":
				case "date":
				case "time":
				case "xml":
				case "nvarchar":
				case "nchar":
				case "ntext":
				case "text":
				case "uniqueidentifier":
        wStr += "'" + row.value + "'";
					break;
				case "float":
				case "bigint":
				case "int":
				case "bit":
				case "decimal":
        wStr += row.value;
					break;
      }
    }

    return wStr;
  }

  constructOrderBy() {
    var oStr: string = "ORDER BY ";

    for (var i = 0; i < this.tabinfo.orderarr.length; i++){
      if(i > 0)
        oStr += ", ";
      
      oStr += this.tabinfo.orderarr[i].name + " " + this.tabinfo.orderarr[i].sort
    }

    return oStr;
  }

  constructJoin() {
    var jStr: string = "";

    for (var i = 0; i < this.tabinfo.joinarr.length; i++){
      jStr += " " + this.tabinfo.joinarr[i].joinclausestr;
    }

    return jStr;
  }

  executeSQL(){
    //Run out and get what we need
    var col: string = (this.tabinfo.colfilterarr[0] == "*") ? "" : this.tabinfo.colfilterarr.join();    //Separated by comma
    var where: string = (this.tabinfo.wherearrcomp.length > 0) ? this.constructWhereClause() : "";      // Separated by a space
    var join: string = (this.tabinfo.joinarr.length > 0) ? this.constructJoin() : "";                   //Separated by a space
    var order: string = (this.tabinfo.orderarr.length > 0) ? this.constructOrderBy() : "";              //Separated by a comma

    this.data.getQueryData(this.tabinfo.server.replace('{0}', this.tabinfo.database), this.tabinfo.database, this.tabinfo.table.name, 
    (col.length == 0) ? '0' : col, (where.length == 0) ? '0' : where, (join.length == 0) ? '0' : join, (order.length == 0) ? '0' : order, 
      this.tabinfo.getcount, this.tabinfo.limitRows, this.tabinfo.selectcnt).subscribe((results) => {
        this.processReturnedData(results);
      });
  }

  executeStoredQuery(tab: Tab) {
    //I need to confirm what tab I should be on
    if(tab.sqid != undefined){
      tab.querystr = this.tabinfo.sqbody;
      this.data.executeQStr(tab.sqid).subscribe((results) => {
        this.processReturnedData(results);
      });
    } else {
      alert("Current tab id doesn't match that for the selected stored query.  Execution aborted.");
    }
  }

  processReturnedData(results){
    //Need to collect the column headers first
    this.colHeader = [];

    for(var key in results[0]){
      this.colHeader.push(key);
    }

    //Load the data into the common variable
    this.dataSource = new MatTableDataSource(results);
    this.dataSource.sort = this.sort;
  }

  exportAsXLSX(type: string):void {
    this.excel.exportAsExcelFile(this.dataSource.data, 'queryResults', type);
  }

  saveCurrentQuery() {
    //Only save if this query ISN'T a currently store query
    if(this.tabinfo.isstoredquery)
      alert("This query is already saved.");
    else {
      const dialogRef = this.dialog.open(QueryDialogComponent, {width: '500px', height: '175px', autoFocus: true, data: this.tabinfo });
      dialogRef.afterClosed().subscribe(() => {
        if(this.tabinfo.querytitle != undefined) {
          this.data.storeNewQuery(this.tabinfo.querytitle, this.tabinfo.querystr, this.tabinfo.server, this.tabinfo.database, this.store.getUserValue("userid"))
          .subscribe(() => {
            alert("The query has been stored under the title: " + this.tabinfo.querytitle + ".");
          });
        }
      });
    }
  }
}
