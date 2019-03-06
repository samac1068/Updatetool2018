import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { User } from '../models/User.model';
import { StorageService } from './storage.service';
import { Query } from '../models/Query.model';
import { Table } from '../models/Table.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient, private store: StorageService) { }

  private getWSPath(): string {
    return this.store.getURL();
  }

  /** Get the user information from the server **/
  getLocalToken(username: string): Observable<any> {
    return this.http.get<string>(`${this.getWSPath()}RequestLocalToken/${this.store.getPassKey()}/${username}`);
  }

  closeTokenSession() {
    return this.http.get(`${this.getWSPath()}CloseTokenSession/${this.store.user['token']}/${this.store.getUserValue('username')}`);
  }

  getUserSessionInfo(): Observable<any> {
    return this.http.get(`${this.getWSPath()}GetUserSessionInfo`);
  }

  //First service called when the application is first executed, unless executed locally
  validateUserToken(token: string): Observable<any> {
    return this.http.get(`${this.getWSPath()}ValidateUserToken/${this.store.getPassKey()}/${token}`);
  }

  //Second service called to pull in the user's specific information which is required for set up of the individual pages
  getUserInfo() {
    return this.http.get(`${this.getWSPath()}GetUserInfo/${this.store.getPassKey()}/${this.store.getUserValue('username')}`);
  }

  getUserSavedQueries(): Observable<any> {
    return this.http.get(`${this.getWSPath()}GetUserSavedQueries/${this.store.getPassKey()}/${this.store.getUserValue('userid')}`);
  }

  getAppUpdates() {
    return this.http.get(`${this.getWSPath()}GetAppUpdates/${this.store.getPassKey()}/${this.store.user['token']}`);
  }

  getTableDBList(server: string, db: string) {
    return this.http.get(`${this.getWSPath()}GetDbTableList/${this.store.getPassKey()}/${server}/${db}`);
  }

  getQueryData(server: string, db: string, tbl: string, col: string, where: string, join: string, order: string, cnt: boolean, lmtrow: boolean, speccnt: string) {
    return this.http.get(`${this.getWSPath()}GetQueryData/${this.store.getPassKey()}/${server}/${db}/${tbl}/${col}/${where}/${join}/${order}/${cnt}/${lmtrow}/${speccnt}`);
  }

  getTableProperties(server: string, db: string, tbl: string) {
    return this.http.get(`${this.getWSPath()}GetTableProperties/${this.store.getPassKey()}/${server}/${db}/${tbl}`);
  }
}
