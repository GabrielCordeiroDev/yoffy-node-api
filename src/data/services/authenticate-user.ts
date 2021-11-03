import axios from 'axios'
import { sign } from 'jsonwebtoken'

import { AuthenticateUserUseCase } from '@domain/useCases'
import { UsersRepositoryContract } from '@data/contracts'

type GithubAccessTokenResponse = {
  access_token: string
}

type GithubUserResponse = {
  id: number
  name: string
  login: string
  avatar_url: string
}

export class AuthenticateUserService implements AuthenticateUserUseCase {
  constructor(private readonly usersRepository: UsersRepositoryContract) {}

  async execute({
    code
  }: AuthenticateUserUseCase.Params): Promise<AuthenticateUserUseCase.Result> {
    const url = 'https://github.com/login/oauth/access_token'

    const {
      data: { access_token: githubAccessToken }
    } = await axios.post<GithubAccessTokenResponse>(url, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      headers: {
        Accept: 'application/json'
      }
    })

    const {
      data: { id: githubId, name, login, avatar_url: avatarUrl }
    } = await axios.get<GithubUserResponse>('https://api.github.com/user', {
      headers: {
        authorization: `Bearer ${githubAccessToken}`
      }
    })

    let user = await this.usersRepository.findOneByGithubId(githubId)

    if (!user) {
      user = await this.usersRepository.create({
        name,
        login,
        avatarUrl,
        githubId
      })
    }

    const accessToken = sign(
      {
        user: {
          id: user.id,
          name,
          avatarUrl
        }
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: '1d'
      }
    )

    return { ...user, accessToken }
  }
}
