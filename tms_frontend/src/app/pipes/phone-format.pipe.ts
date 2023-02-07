import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat'
})
export class PhoneFormatPipe implements PipeTransform {

  transform(rawNum: any) {
    let countryCodeStr;
    let areaCodeStr;
    let midSectionStr;
    let lastSectionStr;

    if(rawNum?.length == 10) {
      countryCodeStr = '';
      areaCodeStr = rawNum.slice(0,3);
      midSectionStr = rawNum.slice(3,6);
      lastSectionStr = rawNum.slice(6);
    } else if(rawNum?.length == 11) {
      rawNum = "+"+ rawNum;

      countryCodeStr = rawNum.slice(0,2) + ' ';
      areaCodeStr = rawNum.slice(2,5);
      midSectionStr = rawNum.slice(5,8);
      lastSectionStr = rawNum.slice(8);
    }

    return `${countryCodeStr}(${areaCodeStr}) ${midSectionStr}-${lastSectionStr}`;
  }

}
