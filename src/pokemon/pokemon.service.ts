import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaulLimit: number
  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService
  ) {
    this.defaulLimit = configService.get<number>('defaultLimit')
   }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase()
    try {

      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon

    } catch (error) {
      this.handleException(error)
    }

  }

  findAll(paginationDto: PaginationDto) {
    const {limit = this.defaulLimit, offset = 0 }= paginationDto
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v')
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

  async removeAll(){
    await this.pokemonModel.deleteMany({})
  }

  async Insertmany (data){
    await this.pokemonModel.insertMany(data)
  }

    
  
  private handleException (error : any){
    if (error.code === 11000) {
      throw new BadRequestException('Pokemon exist in db')
    }
    console.log(error);
    throw new InternalServerErrorException('Cant create pokemon')
    
  }
}
