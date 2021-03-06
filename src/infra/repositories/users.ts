import { prismaClient } from '@infra/db'
import { UsersRepositoryContract } from '@data/contracts'
import { UserDTO, CreateUserDTO } from '@data/dtos'
import { User } from '@prisma/client'

export class UsersRepository implements UsersRepositoryContract {
  async findOneByGithubId(githubId: number): Promise<UserDTO> {
    const user = await prismaClient.user.findFirst({
      where: {
        githubId
      }
    })

    return user
  }

  async create(data: CreateUserDTO): Promise<UserDTO> {
    const user = await prismaClient.user.create({
      data
    })

    return user
  }

  async findOneById(userId: string): Promise<User> {
    const user = await prismaClient.user.findFirst({
      where: {
        id: userId
      }
    })

    return user
  }
}
