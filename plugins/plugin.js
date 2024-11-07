import { bot } from '../lib/client/plugins.js'

bot(
  {
    pattern: 'install ?(.*)',
    desc: 'Installs A Plugin',
    type: 'system'
  },
  async (message, match) => {
    /** functionality here **/
  }
  )
