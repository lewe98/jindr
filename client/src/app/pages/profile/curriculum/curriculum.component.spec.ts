import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CurriculumComponent } from './curriculum.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('CurriculumComponent', () => {
  let component: CurriculumComponent;
  let fixture: ComponentFixture<CurriculumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CurriculumComponent],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurriculumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('check functionality', () => {
    it('should calculate Year and Month and return 1 Month', (done) => {
      expect(component.getResumeEntryTime(new Date('2019-04-23T11:53:32.118Z'), new Date('2019-05-27T11:53:32.118Z')))
        .toEqual('1 Month');
      done();
    });
    it('should calculate Year and Month and return 5 Months', (done) => {
      expect(component.getResumeEntryTime(new Date('2018-12-27T11:53:32.118Z'), new Date('2019-05-27T11:53:32.118Z')))
        .toEqual('5 Months');
      done();
    });
    it('should calculate Year and Month and return 1 Year', (done) => {
      expect(component.getResumeEntryTime(new Date('2018-12-27T11:53:32.118Z'), new Date('2019-12-27T11:53:32.118Z')))
        .toEqual('1 Year');
      done();
    });
    it('should calculate Year and Month and return 1 year, 6 Months', (done) => {
      expect(component.getResumeEntryTime(new Date('2017-01-27T11:53:32.118Z'), new Date('2018-07-27T11:53:32.118Z')))
        .toEqual('6 Months, 1 Year');
      done();
    });
    it('should calculate Year and Month and return 3 Years, 1 Months', (done) => {
      expect(component.getResumeEntryTime(new Date('2016-04-27T11:53:32.118Z'), new Date('2019-05-22T11:53:32.118Z')))
        .toEqual('1 Month, 3 Years');
      done();
    });
    it('should calculate Year and Month and return 3 Years, 3 Months', (done) => {
      expect(component.getResumeEntryTime(new Date('2016-05-27T11:53:32.118Z'), new Date('2019-08-20T11:53:32.118Z')))
        .toEqual('3 Months, 3 Years');
      done();
    });
  });
});
