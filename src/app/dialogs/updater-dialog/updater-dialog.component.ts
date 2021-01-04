import {Component, Inject, OnInit} from '@angular/core';
import {Tab} from '../../models/Tab.model';
import {StorageService} from '../../services/storage.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-updater-dialog',
  templateUrl: './updater-dialog.component.html',
  styleUrls: ['./updater-dialog.component.css']
})
export class UpdaterDialogComponent implements OnInit {

  strQuery: string = "";
  curValue: string = "";
  newValue: string = "";
  col: any;

  constructor(public dialogRef: MatDialogRef<UpdaterDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Tab, private store: StorageService) { }

  ngOnInit() {
    // Generate the query for display
    this.col = this.data.availcolarr.find(x => x.columnname == this.data.table["selectedColumn"]);
    this.curValue = this.data.table["curvalue"];
    this.setTheQueryText();
  }

  setTheQueryText() {
    this.strQuery = "UPDATE [" + this.data.database + "]..[" + this.data.table.name + "] SET " + this.data.table["selectedColumn"] + " = ";
    this.strQuery += this.store.determineValueType(((this.newValue.length > 0) ? this.newValue : this.data.table["curvalue"]), this.col.vartype);

    // Include the where clause here
    this.strQuery += " WHERE " + this.data.table["valueLimiter"];
  }

  closeHandler() {
    this.dialogRef.close(this.data);
  }

  submitHandler() {
    if(this.newValue.length > 0) {
      this.data.table["setvalue"] = this.newValue;

    } else
      alert("No value updated; operation canceled.");

    this.closeHandler();
  }
}
