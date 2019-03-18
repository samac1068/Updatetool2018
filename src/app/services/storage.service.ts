import { Injectable } from '@angular/core';

import { System } from '../models/System.model';
import { User } from '../models/User.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // Variables to store all of the global data
  private _appKey = 'MMA';
  private _passKey = "4A3F6BD3-61FB-467B-83D0-0EFBAF72AFC4";
  private _connectid = 'MobCopConnectionString';
  private  _url = 'http://localhost:64813/UserW/';

  // Public
  tabsArr = [];
  user: User = new User();
  system: System = new System();

  // Variable Constant
  rowOptions: any[] = [{lbl:'1 Row', value: 1}, {lbl: '10 Rows', value: 10}, {lbl: '50 Rows', value: 50}, {lbl:'100 Rows', value: 100},
    {lbl: '1000 Rows', value: 1000}, {lbl: '2000 Rows', value: 2000}, {lbl:'All Rows', value: -9}];
  conditionals: string[] = ["AND", "OR"];
  operators: string[] = ["LIKE","NOT LIKE","=","<>","!=",">",">=","!>","<","<=","!<","IN","IS NULL","IS NOT NULL"];

  constructor() { }

  // This will allow you to set a specific object for either the tab or the user variables
  setTabValue(section: string, value: any) {
    this.tabsArr[section] = value;
  }

  setUserValue(section: string, value: any) {
    this.user[section] = value;
  }

  setSystemValue(section: string, value: any) {
    this.system[section] = value;
  }

  getUserValue(section: string): any {
    return this.user[section];
  }

  getSystemValue(section: string): any {
    return this.system[section];
  }

  getUser(){
    return this.user;
  }

  getAppKey() {
    return this._appKey;
  }

  getPassKey() {
    return this._passKey;
  }

  getConnectID() {
    return this._connectid;
  }

  getURL() {
    return this._url;
  }

  /// Global Services - Let's see if this will work
  findIndexByValue(arr: any, key: string, value: any){
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key] === value) {
          return i;
      }
    }
    return -1;
  }

  findObjByValue(arr: any, key: string, value: any){
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key] === value) {
          return arr[i];
      }
    }
    return null;
  }
}
