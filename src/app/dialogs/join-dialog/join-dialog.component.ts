import { StorageService } from './../../services/storage.service';
import { Column } from './../../models/Column.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Tab } from 'src/app/models/Tab.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-join-dialog',
  templateUrl: './join-dialog.component.html',
  styleUrls: ['./join-dialog.component.css']
})
export class JoinDialogComponent implements OnInit {

  databasearr = [];
  tablearr = [];

  serverfull: string = "";
  server: string = "";
  joindatabase: string = "";
  jointable: string = "";

  constructor(public dialogRef: MatDialogRef<JoinDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Tab, private store: StorageService, private ws: DataService) { }

  ngOnInit() {
      // Get the server information first
      this.server = this.store.system['webservice']['locale'];
      this.serverfull = this.store.returnColByKey(this.store.system['servers'], 'id', this.server, 'offName');
      var dbs: any = this.store.getSystemValue('databases')

      //Get list of all available databases
      for(var i=0; i < dbs.length; i++){
        if(dbs[i].system.indexOf(this.server) != -1)
          this.databasearr.push(dbs[i].id);  
      }
  }

  getAvailableTables(){
    this.ws.getTableDBList(this.serverfull.replace('{0}', this.joindatabase), this.joindatabase)
    .subscribe((results) => {
      this.tablearr = results;
    }); 
  }
}
