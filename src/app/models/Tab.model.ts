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
  
  colfilterarr: string[];
  availcolarr: string[];
  joinarr: string[];
  wherearr: string[];
  orderarr: string[];

  getcount: boolean;
  limitRows: boolean;
  selectcnt: string;
}
