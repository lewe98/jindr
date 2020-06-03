import { Injectable } from '@angular/core';
import { User } from '../../../../interfaces/user';
import { Plugins } from '@capacitor/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { set, remove } from '../storage';
import { Router } from '@angular/router';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User;
  constructor(
    private databaseController: DatabaseControllerService,
    private router: Router
  ) {}

  /**
   * Creates a truly unique device ID for authentication
   */
  async getDeviceID(): Promise<string> {
    const info = await Device.getInfo();
    return info.model + info.uuid + info.platform;
  }

  getUser(): User {
    return this.user;
  }

  /**
   * Method to register a user
   * @param firstName of the user
   * @param lastName of the user
   * @param email of the user
   * @param password of the user
   * Creates a user by sending all the information to the server to store the user in the database
   * resolves if successfully registered and created a new user
   * rejects if registration failed
   */
  async register(firstName: string, lastName: string, email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = {
        firstName,
        lastName,
        email,
        password
      };
      this.databaseController
          .postRequest('register', JSON.stringify({user: data}))
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
    });
  }

  /**
   * Method to log in a user
   * @param email of the user
   * @param password of the user
   * Creates a unique device ID and sends all information to the server for log in
   * set(key, value) is a localStorage helper method from services/storage.ts to write data to local storage
   * resolves if successfully logged in and sets user to logged in user
   * rejects if authentication failed
   */
  async login(email: string, password: string): Promise<any> {
    const deviceID: string = await this.getDeviceID();
    return new Promise<any>((resolve, reject) => {
      const data = {
        email,
        password,
        deviceID
      };
      this.databaseController
        .postRequest('login', JSON.stringify(data), User)
        .then((res) => {
          set('currentUser', res.data);
          this.user = res.data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Method to log out a user
   * Sets the user object to null, removes currentUser from storage and navigates to login page
   */
  async logOut() {
    this.databaseController
      .postRequest('logout', JSON.stringify({ dummy: '' }))
      .then(() => {
        remove('currentUser');
        this.user = null;
        this.router.navigate(['auth/login']);
      });
  }

  /**
   * Method to check if there is currently a user with this device ID logged in
   * if so, set current user to this user
   * if not, logout
   */
  async checkLogin(): Promise<boolean> {
    const deviceID: string = await this.getDeviceID();
    return new Promise<boolean>((resolve) => {
      this.databaseController.getRequest('login', deviceID, User).then(
        (res) => {
          set('currentUser', res.data);
          this.user = res.data;
          resolve(true);
        },
        () => {
          if (this.user) {
            this.logOut();
          }
          resolve(false);
        }
      );
    });
  }
}
