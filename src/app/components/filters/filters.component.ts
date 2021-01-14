import { ConfirmationDialogService } from '../../services/confirm-dialog.service';
import { CommService } from '../../services/comm.service';
import { Component, OnInit, Input } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { Tab } from 'src/app/models/Tab.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {
  @Input() tabinfo: Tab;

  rowOpt = [];
  conditionalOpt = [];
  operatorOpt = [];

  curCondition: string;
  curInput: string;
  curOperator: string = "LIKE";
  curColumn: string;
  curColumnType: string;
  curWID: number;
  curIndex: number;

  tableSelected: boolean = false;
  isBitColumn: boolean = false;
  filterAdded: boolean = false;
  hasWhere: boolean = false;
  colSelected: boolean = false;

  addUpdateBtn: string = "Add";

  constructor(private store: StorageService, private comm: CommService, private dialogBox: ConfirmationDialogService) { }

  ngOnInit() {
    this.rowOpt = this.store.rowOptions;
    this.conditionalOpt = this.store.conditionals;
    this.operatorOpt = this.store.operators;
    this.tabinfo.wherearrcomp = [];

    //Listener
    this.comm.columnsUpdated.subscribe((data) => {
      //Columns are updated so load them here.
      this.tabinfo = data;
      this.tableSelected = true;
    });
  }

  updateGetCount(){
    this.tabinfo.getcount = !this.tabinfo.getcount;
    this.evaluateBtnStatus();
  }

  allowLimitSelect(){
    this.tabinfo.limitRows = !this.tabinfo.limitRows;
    this.evaluateBtnStatus();
  }

  determineType(){
    this.colSelected = (this.curColumn != "-9");
    for(let i = 0; i < this.tabinfo.columns.length; i++)
    {
      if(this.tabinfo.columns[i].columnname.toLowerCase() == this.curColumn.toLowerCase()){
        this.curColumnType = this.tabinfo.columns[i].vartype;
        break;
      }
    }
  }

  createWID(cnt: number){
    let d: any = new Date();
    return Math.floor((Math.random() * (100 + cnt)) + 1) + (d.getHours() + d.getMinutes() + d.getSeconds());
  }

  buildWhereItem(){
    let whereItemStr = "";

    // set the conditional
    this.curCondition = ((this.curCondition != "" && this.curCondition != '-9') ? this.curCondition : "AND");

    // Add the where string
    whereItemStr += this.curColumn + " " + this.curOperator + " ";

    //Do we need to wrap in quotes for not based on the column properties
    switch (this.curColumnType) {
      case "varchar":
      case "datetime":
      case "date":
        whereItemStr += "'" + this.curInput + "'";
        break;
      case "int":
      case "bit":
        whereItemStr += this.curInput;
        break;
    }

    //Now add or edit it to the array
    if(this.curIndex > -1 && this.curWID != -1) {
        //Need to update the existing values
        this.tabinfo.wherearrcomp[this.curIndex].str = whereItemStr;
        this.tabinfo.wherearrcomp[this.curIndex].condition = this.curCondition;
        this.tabinfo.wherearrcomp[this.curIndex].type = this.curColumnType;
        this.tabinfo.wherearrcomp[this.curIndex].name = this.curColumn;
        this.tabinfo.wherearrcomp[this.curIndex].operator = this.curOperator;
        this.tabinfo.wherearrcomp[this.curIndex].value = this.curInput;
    } else {
      //Add to the table
      this.tabinfo.wherearrcomp.push({
        wid: this.createWID(this.tabinfo.wherearrcomp.length), str: whereItemStr, condition: this.curCondition, type: this.curColumnType,
        name: this.curColumn, operator: this.curOperator, value: this.curInput
      });
    }

    //Finally reset the fields
    this.resetFilterFields();
    this.evaluateBtnStatus();
  }

  resetFilterFields(){
    this.curColumn = "";
    this.curColumnType = "";
    this.curCondition = "";
    this.curOperator = "LIKE";
    this.curInput = "";
    this.curIndex = -1;
    this.curWID = -1;
  }

  removeAllWhereItems(){
    this.tabinfo.wherearrcomp= [];
    this.resetFilterFields();
    this.evaluateBtnStatus();
    this.signalExecuteQuery();
  }

  removeWhereItem(wid: number){
    this.dialogBox.confirm('Confirm Deletion', 'Are you sure you want to delete this item?')
    .then((confirmed) => {
      this.tabinfo.wherearrcomp.splice(this.findIndexByWID(wid),1);
    });
    //.catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    this.evaluateBtnStatus();
  }

  editWhereItem(wid: number){
    let i: number = this.findIndexByWID(wid);

    //We want to reload the information into the cur fields
    this.curCondition = this.tabinfo.wherearrcomp[i].condition;
    this.curInput = this.tabinfo.wherearrcomp[i].value;
    this.curOperator = this.tabinfo.wherearrcomp[i].operator;
    this.curColumn = this.tabinfo.wherearrcomp[i].name;
    this.curColumnType = this.tabinfo.wherearrcomp[i].type;
    this.curWID = this.tabinfo.wherearrcomp[i].wid;
    this.curIndex = i;

    //Need to update the value of the button label
    this.addUpdateBtn = "Update";
  }

  findIndexByWID(wid: number){
    for(let k=0; k < this.tabinfo.wherearrcomp.length; k++){
      if(this.tabinfo.wherearrcomp[k].wid == wid){
        return k;
      }
    }
  }

  evaluateBtnStatus(){
    //Apply button
    this.filterAdded = this.tabinfo.wherearrcomp.length > 0 || this.tabinfo.getcount || this.tabinfo.limitRows;

    // Clear all button
    this.hasWhere = (this.tabinfo.wherearrcomp.length > 0);
  }

  applyWhereClause(){
    if(this.tabinfo.wherearrcomp.length > 0 || this.tabinfo.getcount || this.tabinfo.limitRows){
      this.addUpdateBtn = "Add";
    }

    this.signalExecuteQuery();
  }

  signalExecuteQuery() {
    this.comm.runQueryChange.emit();
  }

  evaluateChar(evt: any) {
    if(this.store.ignoreChars.find(i => i === evt.key) != undefined)
      evt.preventDefault();
  }
}
