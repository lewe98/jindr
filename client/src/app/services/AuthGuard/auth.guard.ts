import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, public authService: AuthService) {}
  canActivate() {
    if (!this.authService.user) {
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }
}
