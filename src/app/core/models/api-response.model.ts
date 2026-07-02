export interface ApiDataResponse<T> {
  data: T;
}

export interface ApiMessageResponse<T = unknown> {
  message: string;
  data?: T;
}