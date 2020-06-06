import { ResumeEntry } from './ResumeEntry';

export class Resume {
  private resumeEntryArray: ResumeEntry[];

  public getResume(): ResumeEntry[] {
    return this.resumeEntryArray;
  }

  public sortByDueDate(): void {
    this.resumeEntryArray.sort((a: ResumeEntry, b: ResumeEntry) => {
      return +new Date(a.startDate) - +new Date(b.startDate);
    });
  }
  public sort(): Resume {
    return this;
  }

  public insertResume(entry: ResumeEntry): Resume {
    this.resumeEntryArray.push(entry);
    this.sortByDueDate();
    return this;
  }
}
