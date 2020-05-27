import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DatabaseControllerService {
  apiURL = environment.apiUrl;
  constructor(public http: HttpClient) { }

  /**
   * Method sends a post request to the server and returns a promise with the response
   * @param URL the URL of the route (not including the base path) e.g. '/register'
   * @param data the data to be sent to the server as valid JSON string (JSON.stringify({user: new User()});)
   * @param type generic type of the class Class you expect the returned data to be. Will make all
   * objects in the response an instance of this class. e.g. User
   * Example: postRequest('/login', JSON.stringify({email: 'abc@def.de', password: '1234'}), User);
   * will return the expected user as instance of class User
   * @return Will reject promise if passed data is not a valid JSON string
   * @return Will reject with error message if server request went wrong
   * @return Will resolve with message and data if request was successful
   */
  postRequest<T>(URL: string, data: string, type?: T): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!this.isJsonData(data)) {
        reject('Data is not valid JSON');
        return;
      }
      this.http.post(`${this.apiURL}/${URL}`, data)
          .subscribe(res => {
            resolve(this.convert(res, type));
          }, error => {
            reject(error.error);
          });
    });
  }


  /**
   * Method sends a get request to the server and returns a promise with the response
   * @param URL the URL of the route (not including the base path) e.g. '/user'
   * @param data the data to be sent to the server as string
   * @param type generic type of the class Class you expect the returned data to be. Will make all
   * objects in the response an instance of this class. e.g. User
   * Example: getRequest('/user', 6574, User);
   * will return the expected user (with id 6574) as instance of class User
   * @return Will reject with error message if server request went wrong
   * @return Will resolve with message and data if request was successful
   */
  getRequest<T>(URL: string, data: string, type?: T): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiURL}/${URL}/${data}`)
          .subscribe(res => {
            resolve(this.convert(res, type));
          }, error => {
            reject(error.error);
          });
    });
  }

  /**
   * Method to convert an object or array of objects to required type
   * @param data object (e.g. {name: 'Test', email: 'test@as.de'})
   * @param type the required class, e.g. User
   * @return the converted class, e.g. User(name: 'Test', email: 'test@as.de') or an array of it
   */
  convert<T>(data, type: T) {
    if (data.data && type) {
      if (!data.data.length) {
        data.data = this.makeObject(type, data.data);
        return data;
      } else {
        data.data = this.makeObjectArr(type, data.data);
        return data;
      }
    } else {
      return data;
    }
  }

  /**
   * Method to check if passed string is a valid JSON string
   * @param data string to check
   * @return true if string is valid
   * @return false if string is invalid
   */
  isJsonData(data: string) {
    if (typeof data !== 'string') {
      return false;
    }
    try {
      const result = JSON.parse(data);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch (e) {
      return false;
    }
  }

  /**
   * Creates an Instance of a class from an object
   * @param type required class, e.g. User
   * @param object the object to be converted
   * @return the converted Instance
   */
  makeObject(type, object) {
    const factory = new Factory();
    return Object.assign(factory.create(type), object);
  }

  /**
   * Creates an array of Instances of a class from an array of objects
   * @param type required class, e.g. User
   * @param object an array of objects to be converted
   * @return the converted Instance as array
   */
  makeObjectArr(type, object) {
    const factory = new Factory();
    return object.map(o => Object.assign(factory.create(type), o));
  }
}

/**
 * Helper class to generate generic type class, since typescript loses generic information
 * on compilation
 */
class Factory {
  create<T>(type: (new () => T)): T {
    return new type();
  }
}
