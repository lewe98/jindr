import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/Auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ToastService } from '../../services/Toast/toast.service';
import { ResetPwService } from '../../services/Reset-PW/reset-pw.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./styles/login.page.scss', './styles/responsive.scss']
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  error;
  validationMessages = {
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    password: [
      { type: 'required', message: 'Password is required.' },
      {
        type: 'minlength',
        message: 'Password must be at least 6 characters long.'
      }
    ]
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    public resetPwService: ResetPwService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])
      ),
      password: new FormControl(
        '',
        Validators.compose([Validators.minLength(6), Validators.required])
      )
    });
  }

  /**
   * Returns true if platform is desktop, pwa or capacitor
   */
  checkPlatform() {
    return (
      this.platform.is('pwa') ||
      this.platform.is('desktop') ||
      this.platform.is('capacitor')
    );
  }

  /**
   * Method to log in
   * param: email user's email
   * param: password user's password
   * resolves if user was logged in successfully
   * rejects if an error occurred
   */
  async submit() {
    await this.toastService.presentLoading('Please wait...');
    this.authService
      .login(
        this.loginForm.controls.email.value,
        this.loginForm.controls.password.value
      )
      .then(() => {
        this.toastService.dismissLoading();
        this.router.navigate(['pages']).then(() => {
          this.error = '';
          this.loginForm.controls.email.setValue('');
          this.loginForm.controls.password.setValue('');
        });
      })
      .catch((err) => {
        this.toastService.dismissLoading();
        this.error = err.message;
      });
  }

  clearErr() {
    this.error = '';
  }

  ngOnInit() {
    const token = this.activatedRoute.snapshot.paramMap.get('token');
    if (document.location.href.includes('/auth/register/')) {
      this.authService.verifyRegistration(token);
    }
  }
}
