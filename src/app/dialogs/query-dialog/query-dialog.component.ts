import { Tab } from './../../models/Tab.model';
import { CommService } from './../../services/comm.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { User } from 'src/app/models/User.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-query-dialog',
  templateUrl: './query-dialog.component.html',
  styleUrls: ['./query-dialog.component.css']
})
export class QueryDialogComponent implements OnInit {

  querytitle: string = "";

  constructor(public dialogRef: MatDialogRef<QueryDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Tab, private comm: CommService) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  storeQuery() {
    this.data.querytitle = this.querytitle;
    this.closeDialog();
  }
}
