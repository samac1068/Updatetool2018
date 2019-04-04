import { JoinDialogComponent } from './../../dialogs/join-dialog/join-dialog.component';
import { CommService } from './../../services/comm.service';
import { DataService } from './../../services/data.service';
import { StorageService } from './../../services/storage.service';
import { Tab } from './../../models/Tab.model';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ColumnsDialogComponent } from '../../../app/dialogs/columns-dialog/columns-dialog.component';
import { Column } from '../../models/Column.model';
import { OrderbyDialogComponent } from 'src/app/dialogs/orderby-dialog/orderby-dialog.component';
import { ViewerDialogComponent } from 'src/app/dialogs/viewer-dialog/viewer-dialog.component';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {

  @Input() tabinfo: Tab;
  tabid: string = "";
  
  constructor(private store: StorageService, private data: DataService, private comm: CommService, public dialog: MatDialog) { }

  ngOnInit() {
    //Table was selected
    this.comm.tableSelected.subscribe((data) => {
      //Need to pull all of the columns for the selected table
      this.data.getTableProperties(this.tabinfo.server.replace('{0}', this.tabinfo.database), this.tabinfo.database, this.tabinfo.table.name).subscribe((results) => {
        this.tabinfo.columns = [];

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
          
          if(this.tabinfo.colfilterarr.indexOf(r.columnname) > -1)
            r.selected = true;
          else
            r.selected = false;
            
          this.tabinfo.columns.push(r);
          this.tabinfo.availcolarr.push(r);
        }
      });

      this.comm.columnsUpdated.emit(this.tabinfo);
    });
    
    //Custom Column button selected
    this.comm.columnBtnClicked.subscribe(() => {
      if(this.tabinfo === this.store.selectedTab) {
        //Now open the dialog with the information
        const dialogRef = this.dialog.open(ColumnsDialogComponent, { width: '550px', height: '330px', autoFocus: true, data: this.tabinfo });
        dialogRef.afterClosed().subscribe(() => {
          this.comm.runQueryChange.emit();
        });
      }
    });

    //Order By button clicked
    this.comm.orderByBtnClicked.subscribe(() => {
      if(this.tabinfo === this.store.selectedTab) {
        //Open a dialog window
        const dialogRef = this.dialog.open(OrderbyDialogComponent, {width: '600px', height: '450px', autoFocus: true, data: this.tabinfo });
        dialogRef.afterClosed().subscribe(() => {
          this.comm.runQueryChange.emit();
        });
      }
    });

    //Join button clicked
    this.comm.joinBtnClicked.subscribe(() => {
      if(this.tabinfo === this.store.selectedTab) {
        //Open a dialog window
        const dialogRef = this.dialog.open(JoinDialogComponent, {width: '700px', height: '520px', autoFocus: true, data: this.tabinfo });
        dialogRef.afterClosed().subscribe(() => {
          this.comm.runQueryChange.emit();
        });
      }
    });

    // Proc Viewer clicked
    this.comm.viewerBtnClicked.subscribe(() => {
      if(this.tabinfo === this.store.selectedTab) {
        //Open a dialog window
        const dialogRef = this.dialog.open(ViewerDialogComponent, {width: '1000px', height: '730px', autoFocus: true, data: this.tabinfo });
      }
    });

    // A stored query was requested
    if(this.tabinfo.isstoredquery) {
      setTimeout(() => {
        if(this.tabinfo === this.store.selectedTab) {
          this.comm.runStoredQuery.emit(this.tabinfo);
        }
      }, 500);
    }
  }
}
