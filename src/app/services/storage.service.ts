import { Injectable } from '@angular/core';
import { System } from '../models/System.model';
import { User } from '../models/User.model';
import { Tab } from '../models/Tab.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // Variables to store all of the global data
  private _appKey = 'MMA';
  private _passKey = "4A3F6BD3-61FB-467B-83D0-0EFBAF72AFC4";
  private _connectid = 'MobCopConnectionString';
  private _appVersion = '2.0.0';
  private _inDev: boolean = false;

  // Public
  tabsArr = [];
  user: User = new User();
  system: System = new System();
  selectedTabID: string;
  selectedTab: Tab;

  // Variable Constant
  rowOptions: any[] = [{lbl:'1 Row', value: 1}, {lbl: '10 Rows', value: 10}, {lbl: '50 Rows', value: 50}, {lbl:'100 Rows', value: 100},
    {lbl: '1000 Rows', value: 1000}, {lbl: '2000 Rows', value: 2000}, {lbl:'All Rows', value: -9}];
  conditionals: string[] = ["AND", "OR"];
  operators: string[] = ["LIKE","NOT LIKE","=","<>","!=",">",">=","!>","<","<=","!<","IN","IS NULL","IS NOT NULL"];
  dbNumericals: string[] = ["bit","tinyint","bool","boolean","smallint","mediumint","int","integer","bigint","float","double","decimal","double precision","dec"];
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

  setDevMode(value: boolean) {
    this._inDev = value;
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

  getVersion() {
    return this._appVersion;
  }

  isDevMode() {
    return this._inDev;
  }

  shutOffDev() {
    this._inDev = false;
  }

  /// Global Services - Let's see if this will work
  findIndexByValue(arr: any, key: string, value: any){
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key].toLowerCase() === value.toLowerCase()) {
          return i;
      }
    }
    return -1;
  }

  findObjByValue(arr: any, key: string, value: any){
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key].toLowerCase() === value.toLowerCase()) {
          return arr[i];
      }
    }
    return null;
  }

  returnColByStringKey(arr: any, key: any, value: any, rtncol: string){
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key].toLowerCase() === value.toLowerCase()) {
          return arr[i][rtncol];
      }
    }
    return null;
  }

  searchArr(arr: any, value: any): number {
    for(var i = 0; i < arr.length; i++){
      if(arr[i] == value)
        return i;
    }

    return -1;
  }

  customURLEncoder(str: string) {
    str = str.replace(/^\s+|\s+$/gm,'');
    str = str.replace(/ /gi, "%20");
    str = str.replace(/\*/gi, "!");

    return str;
  }

  customURLDecoder(str: string) {
    str = str.replace(/%20/gi, " ");
    str = str.replace(/\!/gi, "*");

    return str;
  }

  determineValueType(value, vartype)
  {
    return (this.dbNumericals.find(x => x == vartype) == undefined) ? "'" + value + "'" : value;
  }
}
