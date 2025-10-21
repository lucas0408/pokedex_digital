import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pokemon } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private refreshSubject = new BehaviorSubject<void>(undefined);
  public refresh$ = this.refreshSubject.asObservable();

  notifyChange() {
    this.refreshSubject.next();
  }

  private favoritesSubject = new BehaviorSubject<Pokemon[] | null>(null);
  public favorites$ = this.favoritesSubject.asObservable();

  setFavorites(list: Pokemon[] | null) {
    this.favoritesSubject.next(list);
  }
}
