import {
  Directive,
  AfterViewInit,
  ElementRef,
  HostListener,
  Output,
  EventEmitter
} from '@angular/core';

const MAX_HEIGHT = 120;

@Directive({
  // tslint:disable-next-line
  selector: 'ion-textarea[auto-resize][ngModel]'
})
export class AutoResizeDirective implements AfterViewInit {
  private textareaEl: HTMLTextAreaElement;
  private previousHeight: number;

  @Output() doResize = new EventEmitter();

  @HostListener('ionChange', [])
  onInput(): void {
    this.adjust();
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    this.adjust();
  }

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.textareaEl = !!this.elementRef.nativeElement.shadowRoot
        ? this.elementRef.nativeElement.shadowRoot.querySelector('textarea')
        : this.elementRef.nativeElement.querySelector('textarea');
      this.previousHeight = this.textareaEl.scrollHeight;
    }, 500);
  }

  adjust(): void {
    if (!this.textareaEl) {
      return;
    }

    this.textareaEl.style.height = 'auto';
    let newHeight = this.textareaEl.scrollHeight;

    // No height change detected!
    if (this.previousHeight === newHeight) {
      this.textareaEl.style.height = `${newHeight}px`; // Keep the height value
      return;
    }

    if (newHeight > MAX_HEIGHT) {
      this.textareaEl.style.overflow = 'auto';
      newHeight = MAX_HEIGHT;
    } else {
      this.textareaEl.style.overflow = 'hidden';
    }

    this.textareaEl.style.height = `${newHeight}px`;
    if (this.previousHeight !== newHeight) {
      this.previousHeight = newHeight;
    }

    setTimeout(() => {
      this.doResize.emit();
    });
  }
}
