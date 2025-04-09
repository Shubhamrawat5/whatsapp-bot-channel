## Whatsapp Channel Bot

### DEPLOY TO HEROKU

On your Heroku App go to Settings > Buildpacks, and add: https://buildpack-registry.s3.amazonaws.com/buildpacks/jontewks/puppeteer.tgz and Deploy the app again.

#### Env

- `NPM_CONFIG_PRODUCTION = false`
- `MONGODB_URI = ""`
