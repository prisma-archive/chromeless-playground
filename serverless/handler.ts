import Chromeless from 'chromeless'
import {callbackRuntime} from 'lambda-helpers'
import fetch from 'node-fetch'
import * as FormData from 'form-data'
import * as _ from 'lodash'
import { promisifyAll } from 'bluebird'
import 'source-map-support/register'

const redis = require('redis')
const redisAsync: any = promisifyAll(redis)

global['Chromeless'] = Chromeless

interface Payload {
  b64Code: string
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default callbackRuntime(async event => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers: {
        ...cors,
      },
    }
  }

  const redisClient = redisAsync.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  })

  const dateStr = new Date().getFullYear() + '-' + new Date().getMonth() + 1 + '-' + new Date().getDate()
  const ip = event.requestContext.identity.sourceIp
  const redisKey = `chromeless-playground-request-count-${ip}-${dateStr}`

  await redisClient.incrAsync(redisKey)
  await redisClient.expireAsync(redisKey, 1209600) // expire after 2 weeks (random number really - at least 1 day though)

  const requestCount = parseInt(await redisClient.getAsync(redisKey), 10)

  await redisClient.quitAsync()

  if (requestCount > 50) {
    return {
      statusCode: 429,
      body: JSON.stringify({
        message: 'Uh oh. You\'ve made too many requests. Please setup your own Chromeless function 🤓',
      }),
      headers: cors,
    }
  }


  const {b64Code} = JSON.parse(event.body) as Payload

  const functionBody = Buffer.from(b64Code, 'base64').toString()
  const code = new Function(functionBody)

  const results = [] as string[]

  console.log = x => {
    console.error(x)
    results.push(x)
  }

  try {
    process.env = _.pick(process.env, [
      'CHROMELESS_ENDPOINT_API_KEY',
      'CHROMELESS_ENDPOINT_URL',
    ])
    await code()
  } catch (e) {
    console.error(e)
    return {
      statusCode: 200,
      body: JSON.stringify([e.toString()]),
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
    headers: {
      ...cors,
    },
  }
})
