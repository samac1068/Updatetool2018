import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { BannerComponent } from './components/banner/banner.component';
import { ServersComponent } from './components/servers/servers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExporterComponent } from './components/exporter/exporter.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabComponent } from './components/tab/tab.component';
import { QueryResultComponent } from './components/query-result/query-result.component';
import { SelectPnlComponent } from './components/select-pnl/select-pnl.component';
import { TablesComponent } from './components/tables/tables.component';
import { QueryBtnsComponent } from './components/query-btns/query-btns.component';
import { FiltersComponent } from './components/filters/filters.component';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableFilterPipe } from './services/tablefilter.pipe';

// Services
import { StorageService } from './services/storage.service';
import { ConfirmationDialogService } from  './services/confirm-dialog.service';
import { ConfigService } from './services/config.service';
import { DataService } from './services/data.service';

// Angular Material Imports
import { MatTabsModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Dialog Imports
import { ColumnsDialogComponent } from './dialogs/columns-dialog/columns-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { OrderbyDialogComponent } from './dialogs/orderby-dialog/orderby-dialog.component';
import { JoinDialogComponent } from './dialogs/join-dialog/join-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    BannerComponent,
    ServersComponent,
    ExporterComponent,
    TabsComponent,
    TabComponent,
    QueryResultComponent,
    SelectPnlComponent,
    TablesComponent,
    QueryBtnsComponent,
    FiltersComponent,
    TableFilterPipe,
    ColumnsDialogComponent,
    ConfirmDialogComponent,
    OrderbyDialogComponent,
    JoinDialogComponent
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DataTablesModule,
    HttpClientModule
    ,MatTabsModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  providers: [
    DataService,
    StorageService,
    ConfigService,
    ConfirmationDialogService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ColumnsDialogComponent,
    ConfirmDialogComponent,
    OrderbyDialogComponent,
    JoinDialogComponent
  ]
})
export class AppModule { }
