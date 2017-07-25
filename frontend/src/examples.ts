interface Example {
  title: string
  code: string
}

const examples: Example[] = [{
  title: 'Screenshot',
  code: `\
const chromeless = new Chromeless({ remote: true })

const screenshot = await chromeless
  .goto('https://www.graph.cool')
  .scrollTo(0, 2000)
  .screenshot()

console.log(screenshot)

await chromeless.end()`,
}, {
  title: 'Google Search',
  code: `\
const chromeless = new Chromeless({ remote: true })

const screenshot = await chromeless
  .goto('https://www.google.com')
  .type('chromeless', 'input[name="q"]')
  .press(13)
  .wait('#resultStats')
  .screenshot()
  .scrollTo(0, 1000)

console.log(screenshot)

await chromeless.end()`,
}]

export default examples