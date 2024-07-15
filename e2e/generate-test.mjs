#!/usr/bin/env node
import prompts from 'prompts'
import fs from 'node:fs/promises'

function dedent (strings, ...parts) {
  const nonSpacingChar = /\S/m.exec(strings[0])
  if (nonSpacingChar == null) return ''

  const indent = nonSpacingChar.index - strings[0].lastIndexOf('\n', nonSpacingChar.index) - 1
  const dedentEachLine = str => str.split('\n').map((line, i) => line.slice(i && indent)).join('\n')
  let returnLines = dedentEachLine(strings[0].slice(nonSpacingChar.index), indent)
  for (let i = 1; i < strings.length; i++) {
    returnLines += String(parts[i - 1]) + dedentEachLine(strings[i], indent)
  }
  return returnLines
}

const packageNames = await fs.readdir(new URL('../packages/@ImgEditTests', import.meta.url))
const unwantedPackages = ['core', 'companion', 'redux-dev-tools', 'utils']

const { name } = await prompts({
  type: 'text',
  name: 'name',
  message: 'What should the name of the test be (e.g `dashboard-tus`)?',
  validate: (value) => /^[a-z|-]+$/i.test(value),
})

const { packages } = await prompts({
  type: 'multiselect',
  name: 'packages',
  message: 'What packages do you want to test?',
  hint: '@ImgEditTests/core is automatically included',
  choices: packageNames
    .filter((pkg) => !unwantedPackages.includes(pkg))
    .map((pkg) => ({ title: pkg, value: pkg })),
})

const camelCase = (str) => str
  .toLowerCase()
  .replace(/([-][a-z])/g, (group) => group.toUpperCase().replace('-', ''))

const html = dedent`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <title>${name}</title>
        <script defer type="module" src="app.js"></script>
      </head>
      <body>
        <div id="app"></div>
      </body>
    </html>
  `
  const test = dedent`
  describe('${name}', () => {
    beforeEach(() => {
      cy.visit('/${name}')
    })
  })
`
const testUrl = new URL(`cypress/integration/${name}.spec.ts`, import.meta.url)

const htmlUrl = new URL(`clients/${name}/index.html`, import.meta.url)


const appUrl = new URL(`clients/${name}/app.js`, import.meta.url)
const app = dedent`
    import ImgEditTests from '@ImgEditTests/core'
    ${packages.map((pgk) => `import ${camelCase(pgk)} from '@ImgEditTests/${pgk}'`).join('\n')}

    const ImgEditTests = new ImgEditTests()
      ${packages.map((pkg) => `.use(${camelCase(pkg)})`).join('\n\t')}

    window.ImgEditTests = ImgEditTests
  `

await fs.writeFile(testUrl, test)
await fs.mkdir(new URL(`clients/${name}`, import.meta.url))
await fs.writeFile(htmlUrl, html)
await fs.writeFile(appUrl, app)

const homeUrl = new URL('clients/index.html', import.meta.url)
const home = await fs.readFile(homeUrl, 'utf8')
const newHome = home.replace(
  '</ul>',
  `  <li><a href="${name}/index.html">${name}</a></li>\n      </ul>`,
)
await fs.writeFile(homeUrl, newHome)



