import { environment } from './../../../../environments/environment.prod';
import { Component, OnInit, Input } from '@angular/core';
import { observable, computed } from 'mobx-angular';

import { MovieService } from './../../../services/movie.service';
import { Movie } from './movie.model';
import { ImdbApiService } from '../../../services/imdb-api.service'
import * as orderFunctions from '../movieOrderFunctions'

@Component({
  selector: 'app-movie-create',
  templateUrl: './movie-create.component.html',
  styleUrls: ['./movie-create.component.css'],
})
export class MovieCreateComponent implements OnInit {

  movieInput: string = ""
  movies: Movie[] = []
  orderOptions: string[] = ['Name', 'Year', 'Rating']
  orderBy: string = 'Name'
  sortOrder: string = 'asc'
  errorMessage: string = ''
  @observable searchByTitle: string = ""

  imdbThreshold: number

  constructor(
    private movieService: MovieService,
    private imdbApiService: ImdbApiService
  ) {
    this.imdbThreshold = environment.imdbThreshold
  }

  ngOnInit(): void {
    this.movieService.getMovies().subscribe( movies => {
      this.movies = movies
    })
  }

  changeMoviesOrder(){
    switch (this.orderBy) {
      case 'Name':
        orderFunctions.orderByName(this.movies, this.sortOrder)
        break;
      case 'Year':
        orderFunctions.orderByYear(this.movies, this.sortOrder)
        break
      case 'Rating':
        orderFunctions.orderByRating(this.movies, this.sortOrder)
        break
      default:
        break;
    }
  }

  changeRadioValue(e: any){
    this.sortOrder = e.value
    this.changeMoviesOrder()
  }

  filterByTitle(title: string){
    return title.match(this.searchByTitle.toLowerCase())
  }

  @computed get filteredMovies() {
    return this.movies.filter(({Title}) => this.filterByTitle(Title.toLowerCase()))
  }

  showErrorMessage(msg: string){
    this.errorMessage = msg
    setTimeout(() => {
      this.errorMessage = ''
    }, 3000)
  }

  async saveMovie() {
    const data = /tt\d{7}/.test(this.movieInput)
            ? await this.imdbApiService.getMovieByImdbId(this.movieInput)
            : await this.imdbApiService.getMovieByTitle(this.movieInput)

    const { Title, Genre, Year, Plot, Poster, imdbID, imdbRating } = data

    if (!Title){
      this.showErrorMessage('Does this movie exist?')
      return
    }

    if (imdbRating > this.imdbThreshold){
      this.showErrorMessage('Oh no! this movie is not so bad!')
      return
    }

    const newMovie: Movie = {
      Title,
      Genre,
      Year,
      Plot,
      imdbID,
      imdbRating,
      Poster
    }

    this.movieService.create(newMovie).subscribe(response => {
      this.movies.push(response.data)
      this.movieService.showMessage('Movie added')
      this.movieInput = ""
    })

  }

}
