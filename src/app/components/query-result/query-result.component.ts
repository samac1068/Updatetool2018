import { ExcelService } from '../../services/excel.service';
import { DataService } from '../../services/data.service';
import { StorageService } from '../../services/storage.service';
import { CommService } from '../../services/comm.service';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Tab } from 'src/app/models/Tab.model';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { QueryDialogComponent } from 'src/app/dialogs/query-dialog/query-dialog.component';
import {UpdaterDialogComponent} from '../../dialogs/updater-dialog/updater-dialog.component';
import {PrimkeyDialogComponent} from '../../dialogs/primkey-dialog/primkey-dialog.component';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.css']
})
export class QueryResultComponent implements OnInit {

  @Input() tabinfo: Tab;
  @ViewChild(MatSort) sort: MatSort;

  colHeader: string[];
  //rtnResults: any[];
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

    this.comm.copyToClipboardClicked.subscribe(() => {

    });
  }

  newTableSelected(){
    this.initializeTheQuery();
    this.constructSQLString();
  }

  initializeTheQuery() {
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
    this.tabinfo.querystr = "";

    //Build the string exactly like the web service
    let strSQL = "SELECT ";

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
      strSQL += this.constructWhereClause(true);

    // Order By
    if(this.tabinfo.orderarr.length > 0)
      strSQL += this.constructOrderBy();

    //Display the information
    this.tabinfo.querystr = strSQL;

    //Run the string based on this information (it won't be a direct run)
    this.executeSQL();
  }

  constructWhereClause(forDisplay: boolean){
    //Manually join the where clause adding in the appropriate conditioning statements
    let wStr: string = "WHERE ";
    for(let i = 0; i < this.tabinfo.wherearrcomp.length; i++){
      let row: any = this.tabinfo.wherearrcomp[i];

      //Add in the condition for the second + where item
      if(i > 0)
        wStr += " " + row.condition + " ";

      //Add the column and opeator
      if(forDisplay)
        wStr += row.name + " " + row.operator + " ";
      else
        wStr += row.name + " {" + this.store.operators.indexOf(row.operator) + "} ";

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
        wStr += "'" + this.checkForWildcards(row.value, forDisplay) + "'";
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

  checkForWildcards(rowValue: string, forDisplay: boolean) {
    return (forDisplay) ? rowValue : rowValue.replace(/%/g, "{14}");
  }

  constructOrderBy() {
    let oStr: string = "ORDER BY ";

    for (let i = 0; i < this.tabinfo.orderarr.length; i++){
      if(i > 0)
        oStr += ", ";

      oStr += this.tabinfo.orderarr[i].name + " " + this.tabinfo.orderarr[i].sort
    }

    return oStr;
  }

  constructJoin() {
    let jStr: string = "";

    for (let i = 0; i < this.tabinfo.joinarr.length; i++){
      jStr += " " + this.tabinfo.joinarr[i].joinclausestr;
    }

    return jStr;
  }

  executeSQL(){
    //Run out and get what we need
    let col: string = (this.tabinfo.colfilterarr[0] == "*") ? "" : this.tabinfo.colfilterarr.join();    //Separated by comma
    let where: string = (this.tabinfo.wherearrcomp.length > 0) ? this.constructWhereClause(false) : "";      // Separated by a space
    let join: string = (this.tabinfo.joinarr.length > 0) ? this.constructJoin() : "";                   //Separated by a space
    let order: string = (this.tabinfo.orderarr.length > 0) ? this.constructOrderBy() : "";              //Separated by a comma


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

    for(let key in results[0]){
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
      const dialogQuery = this.dialog.open(QueryDialogComponent, {width: '500px', height: '175px', autoFocus: true, data: this.tabinfo });
      dialogQuery.afterClosed().subscribe(() => {
        if(this.tabinfo.querytitle != undefined) {
          this.data.storeNewQuery(this.tabinfo.querytitle, this.tabinfo.querystr, this.tabinfo.server, this.tabinfo.database, this.store.getUserValue("userid"))
          .subscribe(() => {
            alert("The query has been stored under the title: " + this.tabinfo.querytitle + ".");
          });
        }
      });
    }
  }

  cellClickedHandler(col, value) {
    let cell = {col: col, value: value };

    // Store the column that has been selected for modification
    this.tabinfo.table["selectedColumn"] = col;
    this.tabinfo.table["curvalue"] = value;

    // Identify the appropriate column to be modified
    let obj = this.tabinfo.availcolarr.find(x => col === x.columnname);
    obj.colSelected = true;

    //Does this table have a primary key (is required)
    if(!this.tabinfo.hasPrimKey) {
      // Doesn't have a primary key, so user must select a unique identifier to be used in the where clause
      let tabdata: any = {col: col, tabinfo: this.tabinfo };
      const dialogPrimeKey = this.dialog.open(PrimkeyDialogComponent, { width: '350px', height: '200px', autoFocus: true, data: tabdata });
      dialogPrimeKey.afterClosed().subscribe((id) => {

        if(id != -1){
          // Need to update our local variable with the information
          let seltab = this.tabinfo.availcolarr.find(x => x.columnid == id);
          if(seltab != undefined) {
            seltab.primarykey = true;
            this.tabinfo.hasPrimKey = true;
            this.processCellClicked(obj);
          }
        } else
          alert("Unable to modify the selected value without a primary key. Operation canceled");
      });
    } else
        this.processCellClicked(obj);
  }

  processCellClicked(obj){
    if(!obj.primarykey) {
      this.tabinfo.table["valueLimiter"] = this.generateLimiter(this.tabinfo.table["selectedColumn"]);

      const dialogProcessChg = this.dialog.open(UpdaterDialogComponent, { width: '385px', height: '300px', autoFocus: true, data: this.tabinfo });
      dialogProcessChg.afterClosed()
        .subscribe((rtn) => {
        if (rtn.table["setvalue"] != undefined){
          //Value has been set to something new, so let's save it (//this.comm.runQueryChange.emit();)
          console.log(this.tabinfo, rtn);
          let selcol = this.tabinfo.availcolarr.find(x => x.columnname == this.tabinfo.table["selectedColumn"]);
          let updatekey = "SET [" + selcol.columnname + "] = " + this.store.determineValueType(this.tabinfo.table["setvalue"], selcol.vartype) + " WHERE " + this.tabinfo.table["valueLimiter"];

          // Signal the DB to update the information
          this.data.updateRowInfo(this.tabinfo.server.replace('{0}', this.tabinfo.database), this.tabinfo.database, this.tabinfo.table["name"], updatekey, this.tabinfo.wherearr.length > 0 ? this.tabinfo.wherearr.join(' and ') : "0")
            .subscribe((result) => {
            this.comm.runQueryChange.emit();
            alert("Record updated.");
          });
        }
      });
    }else
      alert("This column is a primary key and cannot be changed.");
  }

  generateLimiter(selectedcol) {
    // Based on the selected column, come up with the where clause to include the primary key value
    let primecol = this.tabinfo.availcolarr.find(x => x.primarykey == true);
    return primecol.columnname + " = " + this.store.determineValueType(this.dataSource.filteredData.find(x => x[selectedcol] == this.tabinfo.table["curvalue"])[primecol.columnname], primecol.vartype);
  }
}
