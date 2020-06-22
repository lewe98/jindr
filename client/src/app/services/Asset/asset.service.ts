import { Injectable } from '@angular/core';
import { Interest } from '../../../../interfaces/interest';
// @ts-ignore
import data from '../../../assets/interests.json';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  interests: Interest[];
  data: any;

  constructor() {}

  /**
   * setInterests() render over the interests.json and set for each index the values of the new Interest object
   * and set it fix to interests
   */
  setInterests() {
    const interestsArray: Interest[] = [];
    this.data = data;
    this.data.forEach(function getElement(element, index) {
      interestsArray[index] = new Interest(element.id, element.title);
    });
    this.interests = interestsArray;
    this.interests.sort((a, b) =>
      a.title > b.title ? 1 : b.title > a.title ? -1 : 0
    );
  }

  getInterests() {
    return this.interests;
  }
}
