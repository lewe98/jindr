import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChatOverviewComponent } from './chat-overview.component';
import { UrlSerializer } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ChatOverviewComponent', () => {
  let component: ChatOverviewComponent;
  let fixture: ComponentFixture<ChatOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatOverviewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: UrlSerializer }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
