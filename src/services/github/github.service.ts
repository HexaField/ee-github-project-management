import { GITHUB_PER_PAGE, GITHUB_URL_REGEX } from '@etherealengine/common/src/constants/GitHubConstants'
import { Application } from '@etherealengine/server-core/declarations'
import { getAuthenticatedRepo } from '@etherealengine/server-core/src/projects/project/github-helper'
import { BadRequest } from '@feathersjs/errors'
import { Octokit } from '@octokit/rest'
import hooks from './github.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'github-project': {
      get: (repo: string, params: any) => ReturnType<ReturnType<typeof getGithubIssues>>
    }
  }
}

const getGithubIssues = (app: Application) => async (orgRepo: string, params: any) => {
  const [org, repo] = orgRepo.toLowerCase().split('/')
  
  const userId = params!.user?.id

  const githubIdentityProvider = await app.service('identity-provider').Model.findOne({
    where: {
      userId,
      type: 'github'
    }
  }) as any | undefined

  const token = githubIdentityProvider?.oauthToken ?? process.env.GITHUB_ACCESS_TOKEN

  const repoPath = await getAuthenticatedRepo(token, `https://github.com/${orgRepo.toLowerCase()}`)
  if (!repoPath) throw new BadRequest('Invalid Github URL')

  const octo = new Octokit({ auth: token })
  const issues = [] as Awaited<ReturnType<typeof octo.issues.listForRepo>>['data']
  let page = 1
  let end = false

  while (!end) {
    const issuesPage = await octo.issues.listForRepo({
      owner: org,
      repo: repo,
      per_page: GITHUB_PER_PAGE,
      page
    })
    issues.push(...issuesPage.data)
    page++
    if (issuesPage.data.length < GITHUB_PER_PAGE) end = true
  }

  return issues
}

export default (app: Application): void => {
  app.use('github-project', {
    get: getGithubIssues(app)
  })

  const service = app.service('github-project')
  service.hooks(hooks)
}
