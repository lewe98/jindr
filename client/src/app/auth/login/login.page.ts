import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/Auth/auth.service';
import { Router } from '@angular/router';

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
        message: 'Password must be at least 5 characters long.'
      }
    ]
  };

  constructor(private authService: AuthService, private router: Router) {
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
        Validators.compose([Validators.minLength(5), Validators.required])
      )
    });
  }

  async submit() {
    this.authService
      .login(
        this.loginForm.controls.email.value,
        this.loginForm.controls.password.value
      )
      .then(() => {
        this.router.navigate(['pages']).then(() => {
          this.error = '';
          this.loginForm.controls.email.setValue('');
          this.loginForm.controls.password.setValue('');
        });
      })
      .catch((err) => {
        this.error = err.message;
      });
  }

  clearErr() {
    this.error = '';
  }

  ngOnInit() {}
}
