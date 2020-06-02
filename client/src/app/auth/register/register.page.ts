import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/Auth/auth.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TermsComponent } from '../terms/terms.component';
import { PrivacyComponent } from '../privacy/privacy.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./styles/register.page.scss', './styles/responsive.scss']
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  error;
  validationMessages = {
    firstName: [{ type: 'required', message: 'First name is required.' }],
    lastName: [{ type: 'required', message: 'Last name is required.' }],
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    password: [
      { type: 'required', message: 'Password is required.' },
      {
        type: 'minlength',
        message: 'Password must be at least 5 characters long.'
      }
    ]
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    public modalController: ModalController
  ) {
    this.registerForm = new FormGroup({
      firstName: new FormControl('', Validators.compose([Validators.required])),
      lastName: new FormControl('', Validators.compose([Validators.required])),
      email: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])
      ),
      password: new FormControl(
        '',
        Validators.compose([Validators.minLength(5), Validators.required])
      )
    });
  }

  async submit() {
    this.authService
      .register(
        this.registerForm.controls.firstName.value,
        this.registerForm.controls.lastName.value,
        this.registerForm.controls.email.value,
        this.registerForm.controls.password.value
      )
      .then(() => {
        this.router.navigate(['pages']).then(() => {
          this.error = '';
          this.registerForm.controls.firstName.setValue('');
          this.registerForm.controls.lastName.setValue('');
          this.registerForm.controls.email.setValue('');
          this.registerForm.controls.password.setValue('');
        });
      })
      .catch((err) => {
        this.error = err.message;
      });
  }

  redirectToLogin() {
    this.router.navigate(['auth/login']).then(()=>{});
  }

  clearErr() {
    this.error = '';
  }

  ngOnInit() {}

  async showTermsModal() {
    const modal = await this.modalController.create({
      component: TermsComponent
    });
    return await modal.present();
  }

  async showPrivacyModal() {
    const modal = await this.modalController.create({
      component: PrivacyComponent
    });
    return await modal.present();
  }
}
