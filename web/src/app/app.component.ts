import {Component} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web';
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('pl');
    this.translate.use('pl');
  }
}
