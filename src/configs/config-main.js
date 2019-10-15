/* Main app configs go here */
const deployed = require('./deployed.json')

export const appConfig = {
  name: 'NectarDAO',
  shortName: 'NectarDAO',
  description: '',
  splashScreenBackground: '#ffffff',
  factory: deployed.factoryAddress
}
