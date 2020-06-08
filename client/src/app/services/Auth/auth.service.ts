import { Injectable } from '@angular/core';
import { User } from '../../../../interfaces/user';
import { Plugins } from '@capacitor/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { set, remove } from '../storage';
import { Router } from '@angular/router';
import { ToastService } from '../Toast/toast.service';
import { BehaviorSubject } from 'rxjs';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User;
  token: string;
  exp: Date;
  private userSubject = new BehaviorSubject<User>(null);
  user$ = this.userSubject.asObservable();
  constructor(
    private databaseController: DatabaseControllerService,
    private router: Router,
    private toastService: ToastService
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
   * status message is reported by ToastService
   * resolves if successfully registered and created a new user
   * rejects if registration failed
   */
  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = {
        user: {
          firstName,
          lastName,
          email,
          password
        }
      };
      this.databaseController
        .postRequest('register', JSON.stringify(data))
        .then((res) => {
          this.toastService.presentToast(res.message);
          resolve();
        })
        .catch((err) => {
          this.toastService.presentWarningToast(
            err.errors.email,
            err.message + ': '
          );
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
          this.userSubject.next(res.data);
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
  async logOut(): Promise<any> {
    this.databaseController
      .postRequest('logout', JSON.stringify({ userID: this.user._id }))
      .then(() => {
        remove('currentUser');
        this.user = null;
        this.router.navigate(['auth/login']);
        return;
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
          this.userSubject.next(res.data);
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

  /**
   * Method to update a user in the database
   * @param user the user to be updated (with updated values)
   * @param password Optional a password, if the password has changed.
   * NOTE: if a password is passed, ONLY the password will be updated
   */
  updateUser(user: User, password?: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const data = { user, password: password ? password : null };
      this.databaseController
        .putRequest('update-user', JSON.stringify(data), User)
        .then((res) => {
          this.user = res.data;
          this.userSubject.next(res.data);
          set('currentUser', res.data);
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

    /**
     * Method to send a mail to user that includes the link to reset the password
     * @param email user's email
     * resolves if mail was sent successfully
     * rejects if email could not be sent
     */
    async sendmail(email: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const BASE_URL = document.location.origin;
            const data = { user: {email, BASE_URL} };
            this.databaseController
                .postRequest('sendmail', JSON.stringify(data))
                .then((res) => {
                    this.toastService.presentToast(res.message);
                    resolve();
                })
                .catch((err) => {
                    this.toastService.presentWarningToast(
                        err.errors,
                        err.message
                    );
                    reject(err);
                });
        });
    }

    /**
     * Method to get token and expiration date
     * resolves if token and expiration date were sent successfully
     * rejects if token could not be assigned to a user
     */
    async get(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.databaseController.getRequest('forgot-pw', '')
                .then((res) => {
                    this.token = res.token;
                    this.exp = res.exp;
                    resolve();
                })
                .catch((err) => {
                    this.router.navigate(['']);
                    this.toastService.presentWarningToast(
                        err.message,
                        'Error:'
                    );
                    reject(err);
                });
        });
    }

    /**
     * Method to reset a password
     * @param password user's new password
     * resolves if password was changed successfully
     * rejects if email could not be sent
     */
    async resetPassword(password: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const data = {user: {password}};
            this.databaseController
                .postRequest('forgot-pw/' + this.token, JSON.stringify(data))
                .then((res) => {
                    this.toastService.presentToast(res.message);
                    resolve();
                })
                .catch((err) => {
                    this.toastService.presentWarningToast(
                        err.message,
                        'Error: ');
                    reject(err);
                });
        });
    }
}
