import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

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
        this.http.post<any>(`${environment.apiUrl}/users/refresh_authentication`, null, { withCredentials: true })
        .subscribe(
            user => {
                this.currentUserSubject.next(user)
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
        // remove user from local storage to log user out
        this.currentUserSubject.next(null);
    }
}