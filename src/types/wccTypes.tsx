export interface WCCItem {
  srNo: string | number;
  activity: string;
  qty: string | number;
}

export interface WCCData {
  id?: string;
  storeName: string;
  refNo: string;
  projectLocation: string;
  certificateDate: string;
  poNo: string;
  poDate?: string;
  gstin: string;
  items: WCCItem[];
  companyName: string; 
  clientName: string;
  clientId?: string;
}