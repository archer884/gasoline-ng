import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/toPromise';

const BEARER_TOKEN_KEY: string = 'unleaded_auth_service_bearer_token';

@Injectable()
export class AuthenticatedHttp {
    private headers = new Headers({
        'Content-Type': 'application/json'
    });

    private token: string | null;

    // Why I can use this.http is absolutely black magic to me.
    constructor(private http: Http) {
        // FIXME: this code assumes the token is still valid, which may not be the case. We need 
        // to examine the token and determine whether or not it has expired. Maybe the easiest 
        // way to do that is to just make a request to the server to say, "Hey, is this token
        // good?" Then, if it is, great, and if not we need to authenticate.
        this.token = localStorage.getItem(BEARER_TOKEN_KEY);
    }

    // I am guessing that this function will attempt to get a token for this instance of the 
    // service, and that we will then be able to use that token to authenticate future requests
    // made by other services. Fuck if I know.
    public authenticate(user: string, password: string): Promise<void> {
        let requestBody = JSON.stringify({ user: user, password: password });
        let requestHeaders = { headers: this.headers };
        
        return this.http.post('/auth', requestBody, requestHeaders).toPromise()
            .then(response => { this.token = response.toString(); })
            .catch(e => console.log(e));
    }

    // Not sure what we'll use this for, but, basically, if this isn't set, then your service 
    // needs to authenticate before you can use it to add authorization headers to any of your 
    // requests. Note: I haven't the fucking foggiest how to know whether or not this works.
    public mustAuthenticate(): Boolean {
        return typeof this.token == 'undefined';
    }

    public get(url: string, headers: Headers = new Headers()): Observable<Response> {
        this.addAuthHeader(headers);
        return this.http.get(url, { headers: headers });
    }

    public post(url: string, headers: Headers = new Headers()): Observable<Response> {
        this.addAuthHeader(headers);
        this.addContentTypeHeader(headers);
        return this.http.post(url, { headers: headers });
    }

    // This is the best thing I was able to come up with for authenticating requests from other
    // services. There's probably some better way to do it, but they ought to send me their 
    // headers and, when I get them, I'll add the auth header with the bearer token.
    addAuthHeader(headers: Headers) {
        headers.append("Authorization", "Bearer " + this.token);
    }

    addContentTypeHeader(headers: Headers) {
        headers.append("Content-Type", "application/json");
    }
}
