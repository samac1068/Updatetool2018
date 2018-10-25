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
    FiltersComponent
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DataTablesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
