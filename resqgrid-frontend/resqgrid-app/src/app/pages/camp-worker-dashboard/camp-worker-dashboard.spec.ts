import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampWorkerDashboard } from './camp-worker-dashboard';

describe('CampWorkerDashboard', () => {
  let component: CampWorkerDashboard;
  let fixture: ComponentFixture<CampWorkerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampWorkerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(CampWorkerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
