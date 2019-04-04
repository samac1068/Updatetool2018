import { User } from './../../models/User.model';
import { CommService } from './../../services/comm.service';
import { Component, OnInit } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Database } from '../../models/Database.model';
import { Server } from '../../models/Server.model';
import { StorageService } from '../../services/storage.service';
import { Query } from 'src/app/models/Query.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-servers',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.css']
})
export class ServersComponent implements OnInit {

  servers: Server[];
  databases: Database[];
  queries: Query[];
  user: User;

  defaultServer: string = "";
  defaultDB: string = "";

  selectedQueryID: number = -1;

  constructor(private store: StorageService, private comm: CommService, private data: DataService) { }

  ngOnInit() {
    //Listeners
    this.comm.userInfoLoaded.subscribe(() => {
      //Now we can load and set the default selections for this user
      this.user = this.store.getUser();
     
      //set default selections
      this.defaultServer = this.store.getUserValue("servername");
      this.defaultDB = this.store.getUserValue("database");

      //Need to grab a list of the queries for this user
      this.queries = [];
      this.data.getUserSavedQueries().subscribe((results) => {

        for(var i=0; i < results.length; i++) {
          var q:Query = new Query();
          q.id = results[i].ID;
          q.title = this.store.customURLDecoder(results[i].QueryTitle);
          q.database = results[i].DatabaseName;
          q.server = results[i].ServerName;
          q.querybody = this.store.customURLDecoder(results[i].QueryBody);
  
          //console.log(q.querybody);
          
          this.queries.push(q);
        };
      });
  
      //Now load the selection fields. 
      this.store.setUserValue('storedqueries', this.queries); 
      this.servers = this.store.system['servers'];
      this.databases = this.store.system['databases'];
    });
  }

  onServerChanges() {
    this.store.setSystemValue("server", this.store.returnColByStringKey(this.servers, 'id', this.defaultServer, 'offName'));  //returnColByStringKey
    this.store.setSystemValue("servername", this.defaultServer);
  }

  onDatabaseChange() {
    this.store.setSystemValue("database", this.defaultDB);
  }

  executeSelectedStoredQuery() {
    this.comm.addNewTabClicked.emit(this.selectedQueryID);
  }

  createNewTab() {
    this.comm.addNewTabClicked.emit();
  }

  saveCurrentQuery() {
    this.comm.saveNewQuery.emit();
  }
}
