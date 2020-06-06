import {Injectable} from '@angular/core';
import {
  CameraDirection,
  CameraResultType,
  CameraSource,
  Plugins
} from '@capacitor/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { ToastService } from '../Toast/toast.service';
import {Platform} from "@ionic/angular";

const { Camera } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(
    private databaseControllerService: DatabaseControllerService,
    private toastService: ToastService
  ) {}

  /**
   * This method opens the camera or an options prompt, depending on the device.
   * Once the user captured or picked an image, it will call the upload method and
   * return the URL to the image, which can then be stored in the object (e.g. user.image)
   * @param usage an identifier for the image, e.g. profilePicture
   */
  async takePicture(usage: string): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        direction: CameraDirection.Front
      });
      const imageUrl = image.base64String;
      return new Promise((resolve, reject) => {
        this.uploadPicture(usage, imageUrl)
          .then((result) => {
            resolve(result);
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * This Method handles the file upload to the server
   * @param name the name will be passed from the takePicture() method
   * @param file base64 string of the image, will be passed from takePicture() method
   */
  uploadPicture(name: string, file: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const data = {
        name: name + '_' + Date.now(),
        file
      };
      await this.toastService.presentLoading('Upload..');
      this.databaseControllerService
        .postRequest('upload-image', JSON.stringify(data))
        .then((result) => {
          this.toastService.dismissLoading();
          resolve(result.data);
        })
        .catch((error) => {
          this.toastService.dismissLoading();
          reject(error);
        });
    });
  }
}
