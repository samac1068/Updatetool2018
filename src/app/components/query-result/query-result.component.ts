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
    this.comm.tableSelected.subscribe(() => {
      this.newTableSelected();  
    });

    //Change to the query has happened so run the query
    this.comm.runQueryChange.subscribe(() => {
      this.constructSQLString();
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
    strSQL += this.tabinfo.database + ".." + this.tabinfo.table.name + " ";

    //Add Join statement
    if(this.tabinfo.joinarr.length > 0)
      strSQL += this.tabinfo.joinarr.join(' ');
    
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

  constructOrderBy(){
    var oStr: string = "ORDER BY ";

    for (var i = 0; i < this.tabinfo.orderarr.length; i++){
      if(i > 0)
        oStr += ", ";
      
      oStr += this.tabinfo.orderarr[i].name + " " + this.tabinfo.orderarr[i].sort
    }

    return oStr;
  }

  executeSQL(){
    //Run out and get what we need
    var col: string = (this.tabinfo.colfilterarr[0] == "*") ? "" : this.tabinfo.colfilterarr.join();  //Separated by comma
    var where: string = (this.tabinfo.wherearrcomp.length > 0) ? this.constructWhereClause() : "";  // Separated by a space
    var join: string = this.tabinfo.joinarr.join(" ");    //Separated by a space
    var order: string = (this.tabinfo.orderarr.length > 0) ? this.constructOrderBy() : "";     //Separated by a comma

    this.data.getQueryData(this.tabinfo.server.replace('{0}', this.tabinfo.database), this.tabinfo.database, this.tabinfo.table.name, 
    (col.length == 0) ? '0' : col, (where.length == 0) ? '0' : where, (join.length == 0) ? '0' : join, (order.length == 0) ? '0' : order, 
      this.tabinfo.getcount, this.tabinfo.limitRows, this.tabinfo.selectcnt).subscribe((results) => {
        this.processReturnedData(results);
      });
  }

  processReturnedData(results){
    //Need to collect the column headers first
    this.colHeader = [];

    for(var key in results[0]){
      this.colHeader.push(key);
    }

    //Load the data into the common variable
    this.dataSource = new MatTableDataSource(results);

    //Enable sorting
    this.dataSource.sort = this.sort;
  }
}
