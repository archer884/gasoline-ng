import { AuthenticatedHttp } from './http.service';
import { Headers } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

const VEHICLE_ENDPOINT: string = '/api/vehicles';

@Injectable()
export class VehicleService {
    constructor(private http: AuthenticatedHttp) {}

    public get(page: number = 0): Promise<any> {
        let url = VEHICLE_ENDPOINT + '?page=' + page;
        return this.http.get(url).toPromise()
            .then(response => response.json())
            .catch(e => console.log(e));
    }
}
