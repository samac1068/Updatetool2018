import { Join } from './../../models/Join.model';
import { StorageService } from './../../services/storage.service';
import { Column } from './../../models/Column.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Tab } from 'src/app/models/Tab.model';
import { DataService } from 'src/app/services/data.service';
import { ConfirmationDialogService } from 'src/app/services/confirm-dialog.service';
import { OkDialogService } from 'src/app/services/ok-dialog.service';

@Component({
  selector: 'app-join-dialog',
  templateUrl: './join-dialog.component.html',
  styleUrls: ['./join-dialog.component.css']
})
export class JoinDialogComponent implements OnInit {

  serverfull: string = "";
  server: string = "";
  
  //Local Global Variables
  tablearr = [];
  operators: string[] = [];
  availtblleft: string[] = [];
  availtblright: string[] = [];
  msgarr: string = "";

  joinclausearr: Join[] = [];    //Maintains all of the various joins for this tab

  // List of temporary holding variables 
  tleftdbarr: any[] = [];
  tleftdb: string = "";
  tlefttable: string = "";
  tleftcolumn: string = "";
  tlefttblarr: any[] = [];
  tleftcolarr: Column[] = [];

  trightdbarr: any[] = [];
  trightdb: string = "";
  trighttable: string = "";
  trightcolumn: string = "";
  trighttblarr: any[] = [];
  trightcolarr: Column[] = [];
  
  tjtype: string = "JOIN";
  tjop: string = "=";
  tjoinid: number = -1;

  useDefault: boolean = false;

  constructor(public dialogRef: MatDialogRef<JoinDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Tab, private store: StorageService, 
  private ws: DataService, private dialogBox: ConfirmationDialogService) { }

  ngOnInit() {
      // Get the stored information from the tab
      this.server = this.store.system['webservice']['locale'];
      this.serverfull = this.store.returnColByStringKey(this.store.system['servers'], 'id', this.server, 'offName');
      this.tleftdbarr = this.trightdbarr = this.store.getSystemValue('databases')
      this.operators = this.store.operators;
      this.joinclausearr = this.data.joinarr;

      // If we don't have any other joins, then disable the left side with the primary db and table
      this.checkforDefaults();
  }

  findIndexByID(id: number){
    for(var k=0; k < this.joinclausearr.length; k++){
      if(this.joinclausearr[k].jid == id){
        return k;
      }
    }
  }

  identifyLimitSide(side: string){
    let tbl = (side === "left") ? this.tlefttable : this.trighttable;
    var i: number;
    var found: boolean = false;

    if(this.joinclausearr.length > 0) {
      // Search for the table
      for(i = 0; i < this.joinclausearr.length; i++) {
        if(this.joinclausearr[i].tableleft == tbl || this.joinclausearr[i].tableright == tbl) {
          found = true;
          break;
        }
      }

      if(!found) {
        //We need to limit the database and tables on the remaining side - Only display those items currently available in the join
        var dbarr = [];
        var tblarr = [];

        for(i = 0; i < this.joinclausearr.length; i++) {
          
          // Add the databases to the temp arr
          if(this.store.findIndexByValue(dbarr, 'id', this.joinclausearr[i].dbleft) == -1)
            dbarr.push({id: this.joinclausearr[i].dbleft});

          if(this.store.findIndexByValue(dbarr, 'id', this.joinclausearr[i].dbright) == -1)
            dbarr.push({id: this.joinclausearr[i].dbright});

          // Add the table to the temp arr
          if(this.store.findIndexByValue(tblarr, 'id', this.joinclausearr[i].tableleft) == -1)
            tblarr.push({Name: this.joinclausearr[i].tableleft});
          
          if(this.store.findIndexByValue(tblarr, 'id', this.joinclausearr[i].tableright) == -1)
            tblarr.push({Name: this.joinclausearr[i].tableright});
        }
        
        // With the list created, now assign them to the appropriate dropdown
        if(side == 'left') {
          this.tleftdbarr = dbarr;
          this.tlefttblarr = tblarr;
        } else {
          this.trightdbarr = dbarr;
          this.trighttblarr = tblarr;
        }
      }
    }        
  }
  
  checkforDefaults(){
    if(this.joinclausearr.length == 0) {
      this.useDefault = true;
      this.tleftdb = this.data.database;
      this.tlefttable = this.data.table.name;
      this.getAvailableTables('left');
      this.getAvailableColumns('left');
    }
  }

  //Handler when a Database is selected
  getAvailableTables(side: string){
    this.ws.getTableDBList(this.serverfull.replace('{0}', (side == "left") ? this.tleftdb : this.trightdb), (side == "left") ? this.tleftdb : this.trightdb)
    .subscribe((results) => {
      var arr: any = [];
      for(var i = 0; i < results.length; i++) {
          arr.push(results[i]);
      }

      //Now add to the appropriate side
      if(side == "left")
        this.tlefttblarr = arr;
      else
        this.trighttblarr = arr;
    });
  }

  //Handler when table is selected
  getAvailableColumns(side: string) {
    //A table was selected, so we must also limit the opposing side or identify this side as the limited one - only if the other side is blank
    this.msgarr = "";
    
    if(this.tlefttable === this.trighttable) {
      this.msgarr = "You cannot have the same table on both sides of the join statement. Please try again.";
      setTimeout(() => {
        if(side === "left")
          this.tlefttable = "";
        else
          this.trighttable = "";
      });
    } else {
      if((side == "left" && this.trightdb == "" || this.trighttable == "" || this.trightcolumn == "") ||
        (side == "right" && this.tleftdb == "" || this.tlefttable == "" || this.tleftcolumn == ""))
        this.identifyLimitSide(side);
  
      this.ws.getTableProperties(this.serverfull.replace('{0}', (side == "left") ? this.tleftdb : this.trightdb), (side == "left") ? this.tleftdb : this.trightdb, 
        (side == "left") ? this.tlefttable : this.trighttable).subscribe((results) => {
        for(let row of results)
        {
          var r: Column = new Column(); 
          r.tablename = row.TableName;
          r.columnid = row.ColumnID;
          r.columnname = row.ColumnName;
          r.vartype = row.VarType;
          r.maxlength = row.MaxLength;
          r.primarykey = row.PrimaryKey;
          r.precise = row.Precise;
          r.scale = row.Scale;
          r.charfulllength = row.CharFullLength;
          
          //Shove into the appropriate columns side
          if(side == "left")
            this.tleftcolarr.push(r);
          else
            this.trightcolarr.push(r);
        }
      });
    }
  }

  doesDatabaseExistInArr(db) {
    return (this.store.findObjByValue(this.data.databasearr, 'name', db) > -1);
  }

  doesTableExistInArr(tbl) {
    return (this.store.findObjByValue(this.data.tablearr,'Name', tbl) > -1);
  }

  resetAllFields() {
    this.tleftdb = "";
    this.tlefttable = "";
    this.tleftcolumn = "";
    this.tlefttblarr = [];
    this.tleftcolarr = [];

    this.trightdb = "";
    this.trighttable = "";
    this.trightcolumn = "";
    this.trighttblarr = [];
    this.trightcolarr = [];
  
    this.tjtype = "JOIN";
    this.tjop = "=";
    this.tjoinid = -1;

    this.useDefault = false;

    this.checkforDefaults();
  }

  closeDialog() {
    this.dialogRef.close(this.data);
  }

  saveJoinClause() {
    this.data.joinarr = this.joinclausearr;
  }

  addJoin() {
    var temp: Join = new Join();
    temp.jid = this.joinclausearr.length + 1;
    temp.type = this.tjtype;

    temp.dbleft = this.tleftdb;
    temp.tableleft = this.tlefttable;
    temp.columnleft = this.tleftcolumn;

    temp.dbright = this.trightdb;
    temp.tableright = this.trighttable;
    temp.columnright = this.trightcolumn;

    temp.operator = this.tjop;

    //Properly construct the where clause. 
    temp.joinclausestr = temp.type;
    
    if(temp.tableleft != this.data.table.name) {
      temp.joinclausestr = temp.type + " [" + temp.dbleft + "]..[" + temp.tableleft + "] ON [" + temp.tableleft + "].[" + temp.columnleft + "] " + temp.operator + 
                        " [" + temp.tableright + "].[" + temp.columnright + "]";   
    }else{
      temp.joinclausestr = temp.type + " [" + temp.dbright + "]..[" + temp.tableright + "] ON [" + temp.tableleft + "].[" + temp.columnleft + "] " + temp.operator + 
                        " [" + temp.tableright + "].[" + temp.columnright + "]";
    }
                        
    this.joinclausearr.push(temp); 
    this.resetAllFields();
  }

  removeJoinItem(itemid: number) {
    this.dialogBox.confirm('Confirm Deletion', 'Are you sure you want to delete this item?')
    .then((confirmed) => {
      this.joinclausearr.splice(this.findIndexByID(itemid),1);
      this.resetAllFields();
    });
  }

  editJoinItem(itemid: number) {
    //Populate this items which will update the select fields
    var temp: Join = this.joinclausearr[this.findIndexByID(itemid)];
    
    this.tleftdb = temp.dbleft;
    this.tlefttable = temp.tableleft;
    this.tleftcolumn = temp.columnleft;
    this.trightdb = temp.dbright;
    this.trighttable = temp.tableright;
    this.trightcolumn = temp.columnright;
    
    this.tjtype = temp.type;
    this.tjop = temp.operator;
    this.tjoinid = temp.jid;

    //Need to populate these items automatically
    this.getAvailableTables('left');
    this.getAvailableColumns('left');
    this.getAvailableTables('right');
    this.getAvailableColumns('right');
  }
}
