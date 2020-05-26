import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpClient } from '@angular/common/http'
import { Observable, EMPTY } from 'rxjs';
import { map, catchError } from 'rxjs/operators'

import { Movie } from './../components/movie/movie-create/movie.model';


@Injectable({
  providedIn: 'root'
})
export class MovieService {

  baseUrl:string = ''

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.baseUrl = environment.serverBaseUrl
   }

  showMessage(msg :string, isError: boolean = false): void {
    this.snackBar.open(msg, 'x', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? ['msg-erro'] : ['msg-success']
    })
  }

  errorHandler(err: any): Observable<any> {
    this.showMessage(err, true)
    return EMPTY
  }

  create(movie: Movie){
    return this.http.post(`${this.baseUrl}/movies`, movie).pipe(
      map(obj => obj),
      catchError(err => this.errorHandler(`Error adding movie`))
    )
  }

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.baseUrl}/movies`).pipe(
      map(obj => obj),
      catchError(err => this.errorHandler(`Error getting the movies`))
    )
  }

  getMovieByID(id: string): Observable<Movie> {
    const url = `${this.baseUrl}/movies/${id}`
    return this.http.get<Movie>(url).pipe(
      map(obj => obj),
      catchError(err => this.errorHandler(`Get movie error`))
    )
  }

  delete(id: string): Observable<Movie> {
    const url = `${this.baseUrl}/movies/${id}`
    return this.http.delete<Movie>(url).pipe(
      map(obj => obj),
      catchError(err => this.errorHandler(`Delete movie error`))
    )
  }

  updateMovie(movie: Movie) {
    const url = `${this.baseUrl}/movies/${movie._id}`
    return this.http.patch(url, movie).pipe(
      map(obj => obj),
      catchError(err => this.errorHandler(`Update movie error`))
    )
  }

}
