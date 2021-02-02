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
  dataSource: any;
  rowsReturned: string;

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
    //  headleyt:  20210120  Added condition so this will be performed only on the active tab
    if (this.tabinfo === this.store.selectedTab){
      this.initializeTheQuery();
      this.constructSQLString();
    }
  }

  initializeTheQuery() {
    this.tabinfo.colfilterarr = [];
    this.tabinfo.colfilterarr.push("*");
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
    let displayStrSQL = "Select ";

    //console.log("before the top ten selector" );
    //Build the return
    if(this.tabinfo.getcount) {
      strSQL += "COUNT (*) AS [Count] FROM ";
      displayStrSQL += " the number of records ";
    }
    else if (parseInt(this.tabinfo.selectcnt) > 0) {
      strSQL += "TOP " + this.tabinfo.selectcnt + " ";
      displayStrSQL += " the top " + this.tabinfo.selectcnt + " records ";
    }
    else if (this.tabinfo.wherearrcomp.length == 0 && this.tabinfo.colfilterarr[0] == "*" && parseInt(this.tabinfo.selectcnt) != -9){
      strSQL += "TOP 10 ";
      displayStrSQL += " the top 10 records ";
    }
    else if (this.tabinfo.wherearrcomp.length == 0 && this.tabinfo.colfilterarr[0] == "*" && parseInt(this.tabinfo.selectcnt) == -9){
      displayStrSQL += " all records "
    }
    //console.log("after the top ten selector");

    //What columns do we want
    //  headleyt:  20210129  adding the displayStrSQL variable for the text version of the query
    //  made the selectcnt == -9 it's own check to make it work correctly
    if(this.tabinfo.colfilterarr[0] == "*" /*|| parseInt(this.tabinfo.selectcnt) == -9*/)
    {
      strSQL += "* ";
//  headleyt:  20210201  Added this checkt to keep from having at top #n statement and the all records statement
      if (this.tabinfo.wherearrcomp.length > 0) {
        displayStrSQL += " all records ";
      }
    }
    else if (parseInt(this.tabinfo.selectcnt) == -9)
    {
      strSQL += "* ";
      displayStrSQL += " all records ";
    }
    else
    {
      strSQL += this.tabinfo.colfilterarr.join() + " ";
      displayStrSQL += this.tabinfo.colfilterarr.join() + " ";
    }

    //Include the FROM
    strSQL += "FROM ";
    displayStrSQL += "from "

    //Add the database and table info
    strSQL += "[" + this.tabinfo.database + "]..[" + this.tabinfo.table.name + "] ";
    displayStrSQL += "table " + this.tabinfo.table.name + " in the " + this.tabinfo.database + " database ";

    //Add Join statement
    if(this.tabinfo.joinarr.length > 0)
      strSQL += this.constructJoin();

    //Where Clause
    if(this.tabinfo.wherearrcomp.length > 0){
      strSQL += this.constructWhereClause(true);
      displayStrSQL += this.constructWhereClauseSentence();
    }

    // Order By
    if(this.tabinfo.orderarr.length > 0)
      strSQL += this.constructOrderBy();

    //Display the information
//  headleyt:  20210129 displaying the text version of the query on the screen instead of the sql version
//    this.tabinfo.querystr = strSQL;
    this.tabinfo.querystr = displayStrSQL;

    //Run the string based on this information (it won't be a direct run)
    this.executeSQL();
  }

//  headley:  20210115  Integrating Sean's fixes for suspicious code; added parameter
  constructWhereClause(forDisplay: boolean){
    //Manually join the where clause adding in the appropriate conditioning statements
    let wStr: string = "WHERE ";
    for(let i = 0; i < this.tabinfo.wherearrcomp.length; i++){
      let row: any = this.tabinfo.wherearrcomp[i];

      //Add in the condition for the second + where item
      if(i > 0) wStr += " " + row.condition + " ";

      //Add the column and operator
      //  headleyt:  20210115  modifications integrated from Sean
      if(forDisplay)
        wStr += row.name + " " + row.operator + " ";
      else
        wStr += row.name + " {" + this.store.operators.indexOf(row.operator) + "} ";

      if (row.operator.toUpperCase() != "IS NULL" && row.operator.toUpperCase() != "IS NOT NULL"){
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
      } else {
        wStr = wStr.substr(0, wStr.length - 1);
      }
    }

    return wStr;
  }

  //  headley:  20200129  Build the where clause to display as a sentence vice SQL syntax
  constructWhereClauseSentence(){
    //Manually join the where clause adding in the appropriate conditioning statements
    let wStr: string = "where ";
    for(let i = 0; i < this.tabinfo.wherearrcomp.length; i++){
      let row: any = this.tabinfo.wherearrcomp[i];

      //Add in the condition for the second + where item
      if(i > 0)
        wStr += " " + (row.condition == 'IS NOT NULL' || row.condition == 'IS NULL') ? row.condition.toUpperCase() : row.condition + " ";

      //Add the column and operator
      //  headleyt:  20210115  modifications integrated from Sean
      wStr += this.TitleCase(row.name) + " " + this.getTextOperator(this.store.operators.indexOf(row.operator)) + " ";

      if (row.operator.toUpperCase() != "IS NULL" && row.operator.toUpperCase() != "IS NOT NULL"){
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
          wStr += "'" + this.checkForWildcards(row.value, true) + "'";
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
    }

    return wStr;
  }

  //  headleyt:  20210115  Integrated new function from Sean to check for wildcards
  checkForWildcards(rowValue: string, forDisplay: boolean) {
    return (forDisplay) ? rowValue: rowValue.replace(/%/g, "{14}");
  }

  //  headleyt:  20210129  Get the text equivalent of the operartor such as equals instead of ==
  getTextOperator(operator: any){
    return (operator == 'IS NULL' || operator == 'IS NOT NULL') ? this.store.operatorsText[operator].toUpperCase() : this.store.operatorsText[operator];
  }

  /* //  headleyt:  20210129  Added camelCase converter so the column names in sentence format are all the same
  camelCase(str: string) {
    // str = str.replace("_", "");
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index)
    {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }  */

   //  headleyt:  20210201  Added TitleCase converter so the column names in sentence format are all the same
   TitleCase(str: string) {
    return str.toLowerCase().split('_').map(word => {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
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
    this.rowsReturned = "Rows Returned: " + results.length;
  }

  exportAsXLSX(type: string):void {
    this.excel.exportAsExcelFile(this.dataSource.data, 'queryResults', type);
  }

  saveCurrentQuery() {
    //Only save if this query ISN'T a currently store query
    //  headleyt:  20210106  added qtype as a parameter to saving the new query
    if(this.tabinfo.isstoredquery)
      alert("This query is already saved.");
    else {
      if (this.tabinfo === this.store.selectedTab) {  //  headleyt:  20210120  added a condition to pop-up the dialog box only if it is the current tab
        const dialogQuery = this.dialog.open(QueryDialogComponent, {width: '500px', height: '175px', autoFocus: true, data: this.tabinfo });
        dialogQuery.afterClosed().subscribe(() => {
          if(this.tabinfo.querytitle != undefined) {
            //  headleyt:  20210128  Added check for the % wildcard when saving the query.  When the query is later opened and run, it is decoded in the API
            this.data.storeNewQuery(this.tabinfo.querytitle, this.checkForWildcards(this.tabinfo.querystr, false), this.tabinfo.server, this.tabinfo.database, this.store.getUserValue("userid"), this.tabinfo.qtype)
            .subscribe(() => {
              alert("The query has been stored under the title: " + this.tabinfo.querytitle + ".");
            });
          //  headleyt:  20210114  raise event to repopulate saved query list in servers.component
          this.comm.populateQueryList.emit();
          }
        });
      }
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
          //console.log(this.tabinfo, rtn);
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
