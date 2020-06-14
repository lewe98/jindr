import { Coords } from '../src/app/services/Location/location.service';

export class Job {
  // tslint:disable-next-line:variable-name
  public _id: string;
  public title: string;
  public description: string;
  public creator: string;
  public tile: number;
  public interestedUsers: string[];
  public location: Coords;
  public isFinished: boolean;
  public image: string;
}
