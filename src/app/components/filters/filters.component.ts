import { Component, OnInit } from '@angular/core';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {
  tableName: any[] = [];
  dataTable: any;

  constructor() { }

  ngOnInit() {
   /* const table: any = $('dbFilters');
    this.dataTable = table.DataTable({
      'aaData': this.tableName,
      'scrollY': '25vh',
      'paging': false,
      'bSortClasses': false,
      'bInfo': false,
      'sDom': '<"H"lr>t<"F"ip>',
      'oLanguage': {
        'sSearch': 'Filter: ',
        'sEmptyTable': 'No Table Fields Found'
      },
      'aoColumns': [
        { 'sTitle': 'Field', mData: 'field'}
      ]
    });*/
  }

}
