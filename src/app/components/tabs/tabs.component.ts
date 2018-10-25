import { Component, OnInit} from '@angular/core';
import { Tab } from '../../models/Tab';
import {TabComponent} from '../tab/tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {

  // This is just a test
  temp: any[] = [
    { tabid: 1, server: 'production', database: 'dampsa', active: false },
    { tabid: 2, server: 'production', database: 'order_viewer', active: false }
  ];

  tabs: TabComponent[] = [];

  constructor() { }

  ngOnInit() {
    this.temp.forEach(item => {
      const tabc: TabComponent = new TabComponent();
      tabc.tabId = item.tabid;
      tabc.server = item.server;
      tabc.database = item.database;
      tabc.active = item.active;

      this.addTab(tabc);
    });
  }

  selectTab(tab: Tab) {
    this.tabs.forEach((tab) => {
      tab.active = false;
    });

    tab.active = true;
    console.log('tab selected');
  }

  addTab(tab: TabComponent) {
    if (this.tabs.length === 0) {
      tab.active = true;
    }

    this.tabs.push(tab);
  }

}
