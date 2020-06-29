import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OffersComponent } from './offers.component';
import { UrlSerializer } from '@angular/router';

describe('OffersComponent', () => {
  let component: OffersComponent;
  let fixture: ComponentFixture<OffersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OffersComponent],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: UrlSerializer }]
    }).compileComponents();

    fixture = TestBed.createComponent(OffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
