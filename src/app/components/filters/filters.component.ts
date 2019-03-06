import { Component, OnInit, Input } from '@angular/core';

import 'datatables.net';
import 'datatables.net-bs4';
import {StorageService} from '../../services/storage.service';
import { Tab } from 'src/app/models/Tab.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {
  @Input() tabinfo: Tab;
  
  rowOpt = [];
  conditionalOpt = [];

  constructor(private store: StorageService) { }

  ngOnInit() {
    this.rowOpt = this.store.rowOptions;
    this.conditionalOpt = this.store.conditionals
  }

}
