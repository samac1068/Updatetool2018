import { CommService } from './../../services/comm.service';
import { DataService } from './../../services/data.service';
import { StorageService } from './../../services/storage.service';
import { Tab } from './../../models/Tab.model';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ColumnsDialogComponent } from 'src/app/dialogs/columns-dialog/columns-dialog.component';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {

  @Input() tabinfo: Tab;
  
  constructor(private store: StorageService, private data: DataService, private comm: CommService, public dialog: MatDialog) { }

  ngOnInit() {
    //Listeners
    
    //Table was selected
    this.comm.tableSelected.subscribe((data) => {
      this.tabinfo = data;  //Updating the information for all children that use it
    });
    
    //List of columns updated
    this.comm.columnsUpdated.subscribe((data) => {
      this.tabinfo.availcolarr = data;
    });

    //Custom Column button selected
    this.comm.columnBtnClicked.subscribe(() => { 
      //We need to pull the table properties
      this.data.getTableProperties(this.tabinfo.server.replace('{0}', this.tabinfo.database), this.tabinfo.database, this.tabinfo.table.name).subscribe((results) => {
        //Received the list of columns for this table
        


        //Now open the dialog with the information
        const dialogRef = this.dialog.open(ColumnsDialogComponent, { width: '500px', autoFocus:true });
      });
    });
  }


}
