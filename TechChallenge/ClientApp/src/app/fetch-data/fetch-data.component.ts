import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {   timer, throwError, range, zip } from 'rxjs';
import 'rxjs/add/operator/map'
import { retry, retryWhen, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/Rx'

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public forecasts: WeatherForecast[];
  public hasErrors: boolean;
  public currentAttempt:number;
  
  constructor() {

    this.hasErrors = false;
    this.currentAttempt = 5;

    const attempts = 5;
    const delay = 1000;  
    const weatherServiceURL =  "https://localhost:44315/api/weather";

    Observable.ajax(weatherServiceURL)    
    .retryWhen(errors => this.retryWithDelay(errors, delay, attempts))
    .subscribe(result => {
      this.hasErrors = false;
      this.forecasts = result.response as WeatherForecast[];
    }, error =>{ 
      this.hasErrors = true;
    });
  }

  retryWithDelay(errors, delay, attempts) {
    return errors
      .scan((count, err) => {
        ++count;
        if (count >= attempts) {
          throw err;
        }
        return count;
      }, 0)
      .takeWhile(count => count < attempts)
      .do(count => this.currentAttempt-- )
      .delay(delay);
  }
}

interface WeatherForecast {
  dateFormatted: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
