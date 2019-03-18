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
      this.data.getUserSavedQueries().subscribe(results => {
        this.queries = results; 
      });

      //Now load the selection fields. 
      this.servers = this.store.system['servers'];
      this.databases = this.store.system['databases'];
    });
  }
}
