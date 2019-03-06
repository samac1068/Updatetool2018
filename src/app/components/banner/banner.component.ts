import { CommService } from './../../services/comm.service';
import { DataService } from './../../services/data.service';
import { Component, OnInit } from '@angular/core';

import { User } from '../../models/User.model';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  user: User; // There can only be one user at a time
  
  constructor(private data: DataService, private store: StorageService, private comm: CommService) { }

  ngOnInit() {
    //Listing listeners and services

    //After the user's information is loaded, then setup the appropriate fields
    this.comm.userInfoLoaded.subscribe(() => {
      this.user = this.store.getUser();
    })
  }

}
