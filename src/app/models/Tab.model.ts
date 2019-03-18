import { SortItem } from './SortItem.model';
import { Column } from './Column.model';
import { Table } from "./Table.model";

export class Tab {
  tabid: string;
  tabindex: number;
  server: string;
  servername: string
  database: string;
  table: Table;
  columns: Column[];

  active: boolean;
  
  tabtitle: string;
  seltbllist: Table[];
  querystr: string;
  
  databasearr: any[]; //id number, database name
  tablearr: any[];    //id number, table name, database id
  colfilterarr: string[];
  availcolarr: string[];
  joinarr: string[];
  wherearr: string[];
  wherearrcomp: any[];
  orderarr: SortItem[];

  getcount: boolean;
  limitRows: boolean;
  selectcnt: string;
}
