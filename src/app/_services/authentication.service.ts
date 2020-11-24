import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

import jwt_decode from "jwt-decode";

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(undefined)
        this.currentUser = this.currentUserSubject.asObservable()
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    refreshAuthentication() {
        this.http.post<any>(`${environment.apiUrl}/users/authenticate`, null, { withCredentials: true })
        .subscribe(
            user => {
                this.currentUserSubject.next(user)
                const tokenInfo = jwt_decode(user.token)
                console.log(tokenInfo)
                const expiresAt = tokenInfo['exp'] * 1000
                const refreshAtLatest = expiresAt - 30000
                const refreshDelay = refreshAtLatest > Date.now() ? refreshAtLatest - Date.now() : 0
                console.log(`Token is valid until ${new Date(expiresAt).toLocaleString()} refresh scheduled at ${new Date(refreshAtLatest).toLocaleString()} in ${refreshDelay} ms`)
                setTimeout(() => this.refreshAuthentication(), refreshDelay)
            },
            error => {
                this.currentUserSubject.next(null)
                console.log('Refresh failed with error', error)

            }
        );
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { username, password }, { withCredentials: true })
            .pipe(map(user => {
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        this.currentUserSubject.next(undefined);
    }
}