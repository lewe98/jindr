import { Coords } from '../src/app/services/Location/location.service';
import { Interest } from './interest';
import { JobOffer } from './jobOffer';

export class Job {
  // tslint:disable-next-line:variable-name
  public _id: string;
  public title: string;
  public description: string;
  public creator: string;
  public date: Date;
  public time: number;
  public payment: number;
  public interestedUsers: { user: string; time: number }[];
  public location: Coords;
  public isFinished: boolean;
  public image: string;
  public homepage: string;
  public interests: Interest[];
  public isHourly: boolean;
  public cityName: string;
  public jobOffer: JobOffer[];
  public lastViewed: number;
  public unread: number;
}
