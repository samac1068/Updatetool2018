import { CommService } from './services/comm.service';
import {Component, OnInit} from '@angular/core';

import {ConfigService} from './services/config.service';
import {StorageService} from './services/storage.service';
import {DataService} from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  minHeightDefault: number = 943;
  minWidthDefault: number = 1322;

  constructor(private config: ConfigService, private store: StorageService, private data: DataService, private comm: CommService) {}

  ngOnInit() {
    this.getSystemConfig();
    this.getServerConfig();
    this.captureUserTokenData();
  }

  getSystemConfig() {
    const results = this.config.getSystemConfig();
    this.store.setSystemValue('webservice', results);
    this.store.setSystemValue('window', { minHeight: this.minHeightDefault, minWidth: this.minWidthDefault });
  }

  getServerConfig() {
    const results = this.config.getServerConfig();
    this.store.setSystemValue('servers', results.servers);
    this.store.setSystemValue('databases', results.databases);
  }

  captureUserTokenData() {
    // This will retrieve the user's information so there is individuals log in information
    if(this.store.system['webservice']['type'] === 'LOCAL'){  //Used to generate a local token which is required at the start of the application
      this.data.getLocalToken("sean.mcgill")
      .subscribe(result => { 
        this.validateCapturedToken(result["token"]);
      });  
    }
    else
    {
      //Pull in the token from the URL - also required
      console.log('remote');
      //Also stored at the same location
      //this.storage.setUserValue("token", tokenstringfromurl);
    }
  }

  //Validate the token
  validateCapturedToken(token: string) {
    this.data.validateUserToken(token)
    .subscribe(result => {
      this.store.setUserValue("token", token);
      this.store.setUserValue("username", result[0]["Username"]);
      this.store.setUserValue("initalapp", result[0]["InitalApp"]);
      this.store.setUserValue("tokencreatedate", result[0]["CreateDate"]);
      
      //Signal that user has been validated
      this.getUserInformation();
    });
  }

  getUserInformation() {
    this.data.getUserInfo().subscribe((results) => {
      var row: any = results[0];

      this.store.setUserValue("fname", row["FirstName"]);
      this.store.setUserValue("lname", row["LastName"]);
      this.store.setUserValue("appdata", row["AppData"]);
      this.store.setUserValue("lastversion", row["UpdateVersion"]);
      this.store.setUserValue("lastversiondt", row["UpdateDate"]);
      this.store.setUserValue("userid", row["UserID"]);

      var n: any = row["Network"].split("|");
      this.store.setUserValue("servername", n[0]);

      var p: any = n[1].split("#");
      this.store.setUserValue("server", p[0]);
      this.store.setUserValue("database", p[1]);

      //Signal that user data has been loaded
      this.comm.userInfoLoaded.emit(true);
    });
  }
}
