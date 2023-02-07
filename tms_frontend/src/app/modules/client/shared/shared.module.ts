import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FixedPipe} from "../../../pipes/fixed.pipe";
import {FixedTimePipe} from "../../../pipes/fixed-time.pipe";
import {RoundPipe} from "../../../pipes/round.pipe";
import {TimePipe} from "../../../pipes/time.pipe";
import {CalcPeriodUniquePercPipe} from "../../../pipes/calc-period-unique-perc.pipe";
import {SecondsToMinutesPipe} from "../../../pipes/seconds-to-minutes.pipe";
import {CeilWithMinimumPipe} from "../../../pipes/ceil-with-minimum.pipe";

@NgModule({
  declarations: [
    FixedPipe,
    FixedTimePipe,
    RoundPipe,
    TimePipe,
    CalcPeriodUniquePercPipe,
    CeilWithMinimumPipe,
    SecondsToMinutesPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    FixedPipe,
    FixedTimePipe,
    RoundPipe,
    TimePipe,
    CalcPeriodUniquePercPipe,
    CeilWithMinimumPipe,
    SecondsToMinutesPipe,
  ]
})
export class SharedModule { }
