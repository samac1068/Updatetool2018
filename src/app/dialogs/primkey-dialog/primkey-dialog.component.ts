import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {CommService} from '../../services/comm.service';
import {DataService} from '../../services/data.service';
import {StorageService} from '../../services/storage.service';

@Component({
  selector: 'app-primkey-dialog',
  templateUrl: './primkey-dialog.component.html',
  styleUrls: ['./primkey-dialog.component.css']
})
export class PrimkeyDialogComponent implements OnInit {

  tabs: any;
  selectcol: string = "";
  availcol: any = [];
  primecolid: number = -1;

  constructor(public dialogRef: MatDialogRef<PrimkeyDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: any, private comm: CommService, private store: StorageService) { }

  ngOnInit() {
    // Getting the information in for this pop means we should populate the dropdown with all the columns except
    this.tabs = this.data.tabinfo.availcolarr;
    this.selectcol = this.data.col;

    for(let i=0; i < this.tabs.length; i++){
      if(this.tabs[i].columnname != this.selectcol) {
        this.availcol.push(this.tabs[i]);
      }
    }
  }

  recordChange(e) {
    this.primecolid = e.target.value;
  }

  submitHandler() {
    let colname = this.availcol.find(x => x.columnid = this.primecolid);

    if(confirm("Are you sure you want to make " + colname.columnname + " the temporary primary key?")) {
      this.dialogRef.close(this.primecolid);
    }
  }

  cancelHandler() {
    this.dialogRef.close(-1);
  }

}
