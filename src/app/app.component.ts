import { CommService } from './services/comm.service';
import { Component, OnInit } from '@angular/core';

import { ConfigService } from './services/config.service';
import { StorageService } from './services/storage.service';
import { DataService } from './services/data.service';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  minHeightDefault: number = 943;
  minWidthDefault: number = 1322;
  urlToken: string = "";

  constructor(private config: ConfigService, private store: StorageService, private data: DataService, private comm: CommService, private route: ActivatedRoute,
    private location: Location) {}

  ngOnInit() {
    //Pull in any parameter from the URL
    this.route.paramMap.subscribe(params => {
      this.urlToken = params.get("token")
    });

    //this.comm.userUpdatedReloadSys.subscribe(() => { this.getUserInformation() });
    
    this.getSystemConfig();
    this.getServerConfig();
    this.identifyLocale();
    this.captureUserTokenData();
    this.getApplicationBuild();
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

  getApplicationBuild() {
    this.data.getAppUpdates().subscribe((results) => {
      this.store.setSystemValue('build', results);
    });
  }

  identifyLocale(){
    switch(this.store.system['webservice']['type'])
    {
        case 'LOCAL':
          this.store.system['webservice']['locale'] = 'herndon';
          console.log("local webservice - devmode is " + this.store.isDevMode());
          break;
        case 'DEV':
          this.store.system['webservice']['locale'] = 'development';
          console.log('development (herndon) webservice - devmode is ' + this.store.isDevMode());
          break;
        case 'PROD':
          this.store.system['webservice']['locale'] = 'production';
          this.store.shutOffDev();
          console.log('production webservice - devmode is ' + this.store.isDevMode());
          break;
    }
  }

  captureUserTokenData() {
    // This will retrieve the user's information so there is individuals log in information
    if(this.urlToken == "" || this.urlToken == null || this.urlToken == undefined){
      if(this.store.isDevMode()) {
        //Utilize a defaulted user and generate a fake token for testing only
        this.data.getLocalToken("sean.mcgill")
        .subscribe(result => { 
          this.urlToken = result["token"];
          this.validateCapturedToken(this.urlToken);
        });
      } else {
        //Blank URL and on Prod
        alert("Your access cannot be validated.  Returning to previous application.");
        this.location.back();
      }  
    } else 
      this.validateCapturedToken(this.urlToken);
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
      if(results[0] != undefined) {
        var row: any = results[0];
        if(results[0].UserID != -9) {
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
        } else {
          this.store.setUserValue("userid", row["UserID"]);
          this.store.setUserValue("fname", row["FirstName"]);
          this.store.setUserValue("lname", row["LastName"]);
          this.store.setUserValue("appdata", row["AppData"]);

          this.comm.noToolUserInfoFound.emit();  //Signaling that only part or none of the data was found
        }
      } else {
        this.comm.noToolUserInfoFound.emit();
      }
      
    });
  }
}
