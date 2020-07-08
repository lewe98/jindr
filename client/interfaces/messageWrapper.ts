import { Message } from './message';

export class MessageWrapper {
  // tslint:disable-next-line:variable-name
  _id: string;
  employer: string;
  employee: string;
  employeeName: string;
  employerName: string;
  employerImage: string;
  employeeImage: string;
  unread: number;
  employerLastViewed: number;
  employeeLastViewed: number;
  jobID: string;
  messages: Message[];
}
