import { Injectable, EventEmitter } from "@angular/core";

@Injectable
({ providedIn: 'root'})
export class CommService {
    userValidated = new EventEmitter();
    userInfoLoaded = new EventEmitter();    //When user's information has been loaded
    tableSelected = new EventEmitter();    //When a table is selected from the list
    columnsUpdated = new EventEmitter();    //After the table is loaded and a list of columns is retrieved

    // Buttons Clicked Events
    columnBtnClicked = new EventEmitter();    //Customize Column Button clicked
    

}