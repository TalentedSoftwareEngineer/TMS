import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ceilWithMinimum'
})
export class CeilWithMinimumPipe implements PipeTransform {

  transform(value: number, minimum: number): number {
    return (Math.ceil(value) < 1) ? minimum : Math.ceil(value);
  }

}
