import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase()
    try {

      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon

    } catch (error) {
      this.handleException(error)
    }

  }

  findAll() {
    return this.pokemonModel.find()
  }

  async findOne(id: string) {

    let pokemon: Pokemon


    // Number
    if (!isNaN(+id)) {


      pokemon = await this.pokemonModel.findOne({ no: id })


    }

    if (isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id)
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: id.toLowerCase() })
    }


    if (!pokemon) throw new NotFoundException('Pokemon with id, name or no not found')

    return pokemon

  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id)
    if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase()

    try {

      await pokemon.updateOne(updatePokemonDto, { new: true })

      return { ...pokemon.toJSON(), ...updatePokemonDto }

    } catch (error) {
      this.handleException(error)
    }
    
  }
  
  async remove(id: string) {

    const result = await this.pokemonModel.findByIdAndDelete(id)
    if (!result) {
      throw new BadRequestException(`Pokemon with id: "${id}" not found`)
    }
    return result
  }
    
  
  private handleException (error : any){
    if (error.code === 11000) {
      throw new BadRequestException('Pokemon exist in db')
    }
    console.log(error);
    throw new InternalServerErrorException('Cant create pokemon')
    
  }
}
