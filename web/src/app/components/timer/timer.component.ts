import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  template: `
    <div class="timer">{{ displayTime }}</div>
  `,
  styles: [`
.timer {
  text-align: center;
  font-size: 2em;
  position: fixed;
  top: 10%;
  left: 50%; /* Position at the center horizontally */
  transform: translateX(-50%); /* Adjust by half of the element's width */
  font-size: 32px;
  font-weight: bold; /* Makes the font bold */
  color: #ffffff;
  text-shadow: 2px 2px 2px #000000; /* Adds shadow with offset and blur */
}
  `]
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() seconds!: number;
  @Output() timerEnded = new EventEmitter<void>();

  displayTime!: string;
  private subscription!: Subscription;

  ngOnInit() {
    this.startTimer(this.seconds);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  startTimer(seconds: number) {
    this.subscription = interval(1000).pipe(
      take(seconds)
    ).subscribe(
      (elapsed) => {
        const remaining = seconds - elapsed - 1;
        this.displayTime = this.formatTime(remaining);
      },
      null,
      () => {
        this.displayTime = '00:00';
        this.timerEnded.emit();
      }
    );
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  pad(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }
}
