import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PokeResponse } from './interfaces/poke_response.interface';

import { PokemonService } from 'src/pokemon/pokemon.service';
import { AxiosAdapter } from '../common/adapters/axios.adapter';


@Injectable()
export class SeedService {
  constructor(
    @Inject(PokemonService)
    private readonly PokemonService:PokemonService,
    private readonly http: AxiosAdapter
  ){}
  
  
  async executeSeed(){
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')
    this.PokemonService.removeAll()
    let pokemonToInsert: {name: string, no: number}[] = []
    try {
      data.results.forEach(async ({name, url}) => {
        const segments = url.split('/')
        const no: number = +segments[segments.length - 2]
        pokemonToInsert.push({
          name, no
        })
      })
      await this.PokemonService.Insertmany(pokemonToInsert)
      return 'Seed Executed'
      
    } catch (error) {
      throw new BadRequestException(error)
    }
    
  }
}
