import { ProjectEventHooks } from '@etherealengine/projects/ProjectConfigInterface'
import { Application } from '@etherealengine/server-core/declarations'

import packageJson from './package.json'

const config = {
  onInstall: async (app: Application) => {
    await app.service('route-activate').create({ project: packageJson.name, route: '/github', activate: true })
  }
} as ProjectEventHooks

export default config
