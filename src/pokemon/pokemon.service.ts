import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  //Inyeccionde dependencias 
  constructor(
    @InjectModel(Pokemon.name) //inyectamos el modelo para poder usar en el servicio 
    private readonly pokemonModel: Model<Pokemon>,

  ) { }


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      //Creamos uyna insercion en nuestra BBDD
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    } catch (error) {
      this.handleException(error)
    }
  }


  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    //Mongo id
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    //Se hace una consulta a la BD por el nombre del Pokemon
    if (!pokemon) {
      console.log('probando la funcion', !pokemon)
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() })
      console.log('Ejecutnado la tercera funcion ', pokemon)

    }

    if (!pokemon) { //Ejecuta solo si no existe un pokemon, si no existe saltara el error 
      throw new NotFoundException(`Pokemon con id, nombre o no "${term}" no existen`)

    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })
      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {

      this.handleException(error)
    }

  }


  async remove(id: string) {
    // const pokemon = await this.findOne(id)

    // await pokemon.deleteOne()
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id }); //desestructura la informacion de mi peticion es decir cuenta cuando datos fueron o no eliminados 

    if (deletedCount === 0) { //basado en el cantidad de elementos eliminados sabremos si se elimino o no  
      throw new BadRequestException(`Pokemon con id "${id}" no existe`)
    }

    return;
  }


  //Crearemos una funcion para controlar los errores

  private handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon ya existe en la DB ${JSON.stringify(error.keyValue)}`);

    }
    throw new InternalServerErrorException(`No se puede crear pokemon - comprobar los registro del servidor`)

  }

}
