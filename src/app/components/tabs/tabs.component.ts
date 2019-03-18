import { Component, OnInit, ViewChild} from '@angular/core';
import { Tab } from '../../models/Tab.model';
import { TabComponent } from '../tab/tab.component';
import { StorageService } from '../../services/storage.service';
import { CommService } from '../../services/comm.service';
import { FormControl } from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {

  tabs: any[] = [];
  selectedTab: number = -1;

  constructor(private store: StorageService, private comm: CommService) { }

  ngOnInit() {
    this.comm.userInfoLoaded.subscribe(() => {
      //Need to load up the default selected tab for this user
      if(this.store.getUserValue("server") != "")
      {
        this.addTab();
      }
    });
  }

  selectTab(tab: Tab) {
    this.selectedTab = tab.tabindex;
  }

  addTab() {
    //Create a new tab
    var tabCont:Tab = new Tab();
    tabCont.tabid = "tab0" + (this.tabs.length + 1);
    tabCont.tabindex = this.tabs.length;
    tabCont.server = this.store.getUserValue("server");
    tabCont.servername = this.store.getUserValue("servername");
    tabCont.database = this.store.getUserValue("database");
    tabCont.databasearr = [];
    tabCont.databasearr.push({id: tabCont.databasearr.length + 1, name: tabCont.database });
    tabCont.tabtitle = tabCont.servername.toUpperCase() + " - " + tabCont.database.toUpperCase();
    tabCont.active = false;
    this.tabs.push(tabCont);

    //Select the defaulted table now
    this.selectTab(this.tabs[this.tabs.length - 1]); 
  }

}
