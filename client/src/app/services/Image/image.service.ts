import { Injectable, Inject } from '@angular/core';
import {
  CameraDirection,
  CameraResultType,
  CameraSource,
  Plugins
} from '@capacitor/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { ToastService } from '../Toast/toast.service';
import { DOCUMENT } from '@angular/common';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';

const { Camera } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  fileInput;
  usage: string;
  private file = new BehaviorSubject<any>(null);
  file$ = this.file.asObservable();
  private fileSubscription: Subscription;

  constructor(
    private databaseControllerService: DatabaseControllerService,
    private toastService: ToastService,
    @Inject(DOCUMENT) private document: HTMLDocument,
    private imageCompress: NgxImageCompressService,
    private platform: Platform
  ) {}

  /**
   * This method opens the camera or an options prompt, depending on the device.
   * Once the user captured or picked an image, it will call the upload method and
   * return the URL to the image, which can then be stored in the object (e.g. user.image)
   */
  private async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        direction: CameraDirection.Front
      });
      this.file.next('data:image/jpeg;base64,' + image.base64String);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Method to check wether to use capacitor camera plugin or file input
   * @param usage an identifier for the image, e.g. profilePicture
   */
  getImage(usage: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      this.usage = usage;
      if (this.isWeb()) {
        this.cameraOnWeb();
      } else {
        await this.takePicture();
      }
      this.fileSubscription = this.file$.subscribe(async (res) => {
        if (res) {
          await this.toastService.presentLoading('Upload..');
          const compressed = await this.compressFile(res);
          this.uploadPicture(this.usage, compressed)
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject(err.message);
            })
            .finally(() => {
              this.toastService.dismissLoading();
              this.fileSubscription.unsubscribe();
              this.file.next(null);
              this.usage = '';
            });
        }
      });
    });
  }

  /**
   * Returns true if platform is desktop, pwa or capacitor
   */
  private isWeb() {
    return (
      this.platform.is('pwa') ||
      this.platform.is('desktop') ||
      this.platform.is('capacitor')
    );
  }

  cameraOnWeb() {
    this.fileInput = this.document.createElement('input');
    this.fileInput.setAttribute('type', 'file');
    this.fileInput.setAttribute('accept', 'image/*');
    this.fileInput.addEventListener('change', (e) => this.onFileSelected(e));
    this.fileInput.click();
  }

  private async onFileSelected(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // tslint:disable-next-line
    reader.onload = (_event) => {
      this.file.next(reader.result);
    };
  }

  private async compressFile(image): Promise<string> {
    if (!image) {
      return;
    }
    let img = image;
    while (this.imageCompress.byteCount(img) > 350000) {
      await this.imageCompress.compressFile(img, 1, 50, 50).then((result) => {
        img = result;
      });
    }
    return img;
  }
  /**
   * This Method handles the file upload to the server
   * @param name the name will be passed from the takePicture() method
   * @param file base64 string of the image, will be passed from takePicture() method
   */
  private uploadPicture(name: string, file: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const data = {
        name: name + '_' + Date.now(),
        file
      };
      this.databaseControllerService
        .postRequest('upload-image', JSON.stringify(data))
        .then((result) => {
          resolve(result.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
