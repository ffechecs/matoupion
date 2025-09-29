import { deepFreeze } from '../helpers/deepFreeze'

export default {
  install: (app: any) => {
    app.config.globalProperties.$deepFreeze = deepFreeze
    // Make it available in composition API
    app.provide('deepFreeze', deepFreeze)
  }
}