import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/Auth/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/Toast/toast.service';

@Component({
  selector: 'app-forgot-pw',
  templateUrl: './forgot-pw.component.html',
  styleUrls: ['./styles/forgot-pw.component.scss', './styles/responsive.scss']
})
export class ForgotPwComponent implements OnInit {
  resetForm: FormGroup;
  token = document.location.pathname.replace('/auth/forgot-pw/', '');
  error;
  validationMessages = {
    password: [
      { type: 'required', message: 'Password is required.' },
      {
        type: 'minlength',
        message: 'Password must be at least 6 characters long.'
      }
    ],
    confirmPassword: [
      { type: 'required', message: 'Password is required.' },
      {
        type: 'minlength',
        message: 'Password must be at least 6 characters long.'
      }
    ]
  };

  constructor(
    private toastService: ToastService,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = new FormGroup({
      password: new FormControl(
        '',
        Validators.compose([Validators.minLength(6), Validators.required])
      ),
      confirmPassword: new FormControl(
        '',
        Validators.compose([Validators.minLength(6), Validators.required])
      )
    });
  }

  ngOnInit(): void {}

  /**
   * Method to submit the new password
   * param: password user's new password
   * param: confirmPassword confirmation of user's new password
   * resolves if password was changed successfully
   * rejects if an error occurred
   */
  async submit() {
    if (
      this.resetForm.controls.password.value !==
      this.resetForm.controls.confirmPassword.value
    ) {
      await this.toastService.presentWarningToast(
        'Passwords have to be identical!',
        'Error:'
      );
    } else {
      this.authService
        .resetPassword(this.resetForm.controls.password.value, this.token)
        .then(() => {
          // this.toastService.presentToast('Password changed.');
          this.router.navigate(['auth/login']).then(() => {
            this.clearErr();
            this.resetForm.controls.password.setValue('');
            this.resetForm.controls.confirmPassword.setValue('');
          });
        })
        .catch((err) => {
          this.error = err.message;
          this.toastService.presentWarningToast(err.message, 'Error:');
        });
    }
  }

  clearErr() {
    this.error = '';
  }
}
