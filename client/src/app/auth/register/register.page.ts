import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/Auth/auth.service';
import {Router} from '@angular/router';
import {DatabaseControllerService} from '../../services/DatabaseController/database-controller.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./styles/register.page.scss', './styles/responsive.scss']
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  error;
  validationMessages = {
    firstname: [
      { type: 'required', message: 'Firstname is required.' },
    ],
    lastname: [
      { type: 'required', message: 'Lastname is required.' },
    ],
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

  constructor(private authService: AuthService, private router: Router, private databaseControllerService: DatabaseControllerService) {
    this.registerForm = new FormGroup({
      firstname: new FormControl(
          '',
          Validators.compose([
            Validators.required,
          ])
      ),
      lastname: new FormControl(
          '',
          Validators.compose([
            Validators.required,
          ])
      ),
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
            this.registerForm.controls.firstname.value,
            this.registerForm.controls.lastname.value,
            this.registerForm.controls.email.value,
            this.registerForm.controls.password.value
        )
        .then(() => {
          this.router.navigate(['pages']).then(() => {
            this.error = '';
            this.registerForm.controls.firstname.setValue('');
            this.registerForm.controls.lastname.setValue('');
            this.registerForm.controls.email.setValue('');
            this.registerForm.controls.password.setValue('');
          });
        })
        .catch((err) => {
          this.error = err.message;
        });
  }

  redirectToLogin(){
    this.router.navigate(['auth/login']);
  }

  clearErr() {
    this.error = '';
  }

  ngOnInit() {}
}
