import { ResumeEntry } from './ResumeEntry';

export class User {
  // tslint:disable-next-line:variable-name
  public _id: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public image: string;
  public distance: number;
  public allowNotifications: boolean;
  public description: string;
  public dateofbirth: number;
  public resume: ResumeEntry[];
}
