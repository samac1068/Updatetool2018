import { Component, OnInit } from '@angular/core';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {

 tableName: any[] = [];
 dataTable: any;

  constructor() { }

  ngOnInit() {
    this.tableName = [
      {field: 'CRC_ACTIONS'},
      {field: 'CRC_AFFILIATION_TYPE'},
      {field: 'CRC_ANNOUNCEMENT_TYPES'},
      {field: 'CRC_ANNOUNCEMENTS'},
      {field: 'CRC_AOC'},
      {field: 'CRC_AUTHORITY_COMMANDS'},
      {field: 'CRC_BIT_LOOKUP'},
      {field: 'CRC_BLACKOUT_DATES'},
      {field: 'CRC_CBT_COMMAND'},
      {field: 'CRC_Certificates'},
      {field: 'CRC_COMPANIES'},
      {field: 'CRC_COMPOS'},
      {field: 'CRC_DATE_DIMENSIONS'},
      {field: 'CRC_DEPLOYMENT_TYPE'},
      {field: 'CRC_DOCUMENT_TYPE'},
      {field: 'CRC_E_LOGS'},
      {field: 'CRC_FakeData'},
      {field: 'CRC_FAKEDATA_R3'},
      {field: 'CRC_FILEUPLOADS'},
      {field: 'CRC_HELPDESK_AUDIT'},
      {field: 'CRC_MEDICAL_HISTORY'},
      {field: 'CRC_MEDICAL_REASONS'},
      {field: 'CRC_MEDICAL_STATUS'},
      {field: 'CRC_MENU'},
      {field: 'CRC_MENU_ADMIN'},
      {field: 'CRC_MILITARYBRANCH'},
      {field: 'CRC_ORDER_FORMATS'},
      {field: 'CRC_ORDERTYPES'},
      {field: 'CRC_ORGANIZATIONS'},
      {field: 'CRC_RANGE_CARD'},
      {field: 'CRC_RANGE_LANES'},
      {field: 'CRC_RANGE_MARKSMANSHIP'},
      {field: 'CRC_RANGE_RIFLE_LANE_SEQ'},
      {field: 'CRC_RANGE_TYPES'},
      {field: 'CRC_RANKS'},
      {field: 'CRC_REJECTION_TYPE'},
      {field: 'CRC_REPORT_AUDIT'},
      {field: 'CRC_REPORTS'},
      {field: 'CRC_REPORTS_IGNORECOLS'},
      {field: 'CRC_REPORTUSERS'},
      {field: 'CRC_REQUEST_HISTORY'},
      {field: 'CRC_REQUESTS'},
      {field: 'CRC_REQUESTS_AUDIT'},
      {field: 'CRC_REQUESTS_TRAINING'},
      {field: 'CRC_REQUESTS_WEAPONS'},
      {field: 'CRC_RESOURCES'},
      {field: 'CRC_RESOURCES_LKUP'},
      {field: 'RC_ROLES'},
      {field: 'CRC_SUPPLY'},
      {field: 'CRC_SUPPLY_DRAW_COUNTRY'},
      {field: 'CRC_TRAINING'},
      {field: 'CRC_UPDATE_LOG'},
      {field: 'CRC_UPLOAD_FILE_TYPES'},
      {field: 'CRC_UPLOADED_FILES'},
      {field: 'CRC_USER_CERTIFICATES'},
      {field: 'CRC_USER_COMMENTS'},
      {field: 'CRC_USER_COMPANIES'},
      {field: 'CRC_USER_FEEDBACK'},
      {field: 'CRC_USER_MENU_ADMIN'},
      {field: 'CRC_USER_ORGANIZATIONS'},
      {field: 'CRC_USER_ROLES'},
      {field: 'CRC_USER_ROLES_AUDIT'},
      {field: 'CRC_USERS'},
      {field: 'CRC_USERS_AUTHORITY_COMMANDS'},
      {field: 'CRC_WEAPONS'}];
  }
}
