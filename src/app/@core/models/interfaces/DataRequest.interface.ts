export interface DataRequest<T = any> {
  Data: T;
  Message: string;
  Status: string;
  Success: boolean;
}
