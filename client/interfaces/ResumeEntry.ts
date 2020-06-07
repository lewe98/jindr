export class ResumeEntry {
  constructor(startDate: Date, endDate: Date, title: string, description: string, industrysector: string, employmentType: string) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.title = title;
    this.description = description;
    this.industrysector = industrysector;
    this.employmentType = employmentType;
  }
  public startDate: Date;
  public endDate: Date;
  public title: string;
  public description: string;
  public industrysector: string;
  public employmentType: string;
}

enum EmploymentType {
  employee,
  Freelancer,
  trainee
}
