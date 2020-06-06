export class ResumeEntry {
  public startDate: Date;
  public endDate: Date;
  public title: string;
  public description: string;
  public industrysector: string;
  public employmentType: EmploymentType;
}

enum EmploymentType {
  employee,
  Freelancer,
  trainee
}
