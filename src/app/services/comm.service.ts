import { Injectable, EventEmitter } from "@angular/core";

@Injectable
({ providedIn: 'root'})
export class CommService {
    userValidated = new EventEmitter();
    userInfoLoaded = new EventEmitter();    //When user's information has been loaded
    tableSelected = new EventEmitter();    //When a table is selected from the list
    columnsUpdated = new EventEmitter();    //After the table is loaded and a list of columns is retrieved

    noToolUserInfoFound = new EventEmitter();    //Displays when no user's information was saved
    userUpdatedReloadSys = new EventEmitter();    //Only some of the data was found

    runQueryChange = new EventEmitter();    //Execute the current query
    runStoredQuery = new EventEmitter();     //Execute a stored query
    storeUserOptions = new EventEmitter();    // Store the selected user options, if there is a change
    saveNewQuery = new EventEmitter();        //Save the currently created query to the database
    
    // Buttons Clicked Events
    columnBtnClicked = new EventEmitter();    //Customize Column Button clicked
    orderByBtnClicked = new EventEmitter();    //Order By Button clicked
    joinBtnClicked = new EventEmitter();       // Join Button clicked
    viewerBtnClicked = new EventEmitter();     //Store proc viewer button clicked 

    addNewTabClicked = new EventEmitter();    //A new tab has been requested either for the stored query or for the selected server and database

    exportToExcelClicked = new EventEmitter();        //When the button is clicked

    tabFault = new EventEmitter();            //Used when there is an issue withe the data updating the wrong tab
}