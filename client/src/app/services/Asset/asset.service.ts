import { Injectable } from '@angular/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { Interest } from '../../../../interfaces/interest';
import data from '../../../assets/interests.json';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  interests;
  data: any;

  constructor() {}

  /**
   * setInterests() render over the interests.json and set for each index the values of the new Interest object
   * and set it fix to interests
   */
   setInterests(){
     const interestsArray: Interest[] = [];
     this.data = data;
     this.data.forEach(function getElement(element, index){
       interestsArray[index] = new Interest(element.id, element.title);
     });
     this.interests = interestsArray;
  }

  getInterests() {
    return this.interests;
  }
}
