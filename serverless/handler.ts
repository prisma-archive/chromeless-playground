import Chromeless from 'chromeless'
import {callbackRuntime} from 'lambda-helpers'
import fetch from 'node-fetch'
import * as FormData from 'form-data'
import 'source-map-support/register'

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

  const {b64Code} = JSON.parse(event.body) as Payload

  const functionBody = Buffer.from(b64Code, 'base64').toString()
  const code = new Function(functionBody)

  const results = [] as string[]

  console.log = x => {
    console.error(x)
    results.push(x)
  }

  try {
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
