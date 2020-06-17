import { Coords } from '../src/app/services/Location/location.service';
import { Interest } from './interest';

export class Job {
  // tslint:disable-next-line:variable-name
  public _id: string;
  public title: string;
  public description: string;
  public creator: string;
  public date: Date;
  public time: number;
  public payment: number;
  public interestedUsers: string[];
  public location: Coords;
  public isFinished: boolean;
  public image: string;
  public homepage: string;
  public interests: Interest[];
  public isHourly: boolean;
  public cityName: string;
}
