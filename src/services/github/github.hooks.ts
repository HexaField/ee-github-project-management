import authenticate from "@etherealengine/server-core/src/hooks/authenticate"
import { iff, isProvider } from 'feathers-hooks-common'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
