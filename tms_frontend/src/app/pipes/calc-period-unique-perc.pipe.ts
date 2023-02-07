import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calcPeriodUniquePerc'
})
export class CalcPeriodUniquePercPipe implements PipeTransform {

  transform(value: number, reference: number): any {
    let percent = ((value / reference) * 100);
    return parseFloat(percent.toString()).toFixed(2);
  }

}
