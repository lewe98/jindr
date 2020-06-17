import { ResumeEntry } from './ResumeEntry';
import { Interest } from './interest';

export class User {
  // tslint:disable-next-line:variable-name
  public _id: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public image: string;
  public distance: number;
  public allowNotifications: boolean;
  public aboutMe: string;
  public resume: ResumeEntry[];
  public dateOfBirth: number;
  public notificationToken: string;
  public interest: Interest[];
}
