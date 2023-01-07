import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnimateNumberDirective } from './directives/animate-number.directive';
import { CheckAllDirective } from './directives/check-all.directive';
import { ProgressAnimateDirective } from './directives/progress-animate.directive';
import { SanitizeUrlPipe } from 'app/utils/pipes/sanitize_url.pipe';
import { MoneyPipe } from 'app/pipes/money.pipe';
import { FechaPipe } from 'app/pipes/fecha.pipe';

@NgModule({
  declarations: [
    AnimateNumberDirective,
    CheckAllDirective,
    ProgressAnimateDirective,
    SanitizeUrlPipe,
    MoneyPipe,
    FechaPipe
  ],
  exports: [
    AnimateNumberDirective,
    CheckAllDirective,
    ProgressAnimateDirective,
    SanitizeUrlPipe,
    MoneyPipe,
    FechaPipe
  ],
  imports: [
    CommonModule
  ]
})
export class UtilsModule {
}
