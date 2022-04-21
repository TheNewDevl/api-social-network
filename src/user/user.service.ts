import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

  ) { }

  async signUp(createUserDto: CreateUserDto) {
    try {
      const { email, password, username } = createUserDto
      const hash = await bcrypt.hash(password, 10)
      const user = this.userRepository.create({
        email: email,
        password: hash,
        username: username
      })
      const dbUser = await this.userRepository.save(user)
      return { message: 'Utilisateur créé avec succes' }

    } catch (error) {

      throw new ConflictException('Email ou nom d\'utilisateur déjà utilisé')

    }
  }

  async findOne(username: string) {
    const user = await this.userRepository.createQueryBuilder('user')
      .where("user.email = :username or user.username = :username",
        { username }
      )
      .getOne()

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable')
    }

    return user
  }
  /*
    async login(loginData: LoginUserDto) {
      try {
        const { username, password } = loginData
  
        //user can pass email or username to login
         const user = await this.userRepository.createQueryBuilder('user')
          .where("user.email = :username or user.username = :username",
            { username }
          )
          .getOne() 
  
        //check password
        const isMatch = await bcrypt.compare(password, user.password)
  
        //Create payload token
        const payload = {
          id: user.id,
          username: user.username,
          role: user.role
        }
  
        const token = this.jwtService.sign(payload)
  
        return { token }
  
      } catch (error) {
  
        console.log(error);
        throw new NotFoundException('Mot de passe ou username incorrects. Veuillez vérifier vos identifiants')
  
      }
    }*/

  async deleteUser(username: string) {

    const deletion = await this.userRepository.delete({ username })
    if (deletion.affected === 0) {
      throw new NotFoundException('Cet utilisateur n\'a pas été retrouvé')
    }

    return { deletion, message: 'Utilisateur supprimé !' }
  }


  async findAll() {
    return await this.userRepository.find()
  }
}
