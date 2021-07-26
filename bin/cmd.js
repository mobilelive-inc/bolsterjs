#!/usr/bin/env node

'use strict'

const cmd = require('commist')()
const path = require('path')
const help = require('help-me')({
  dir: path.join(path.dirname(require.main.filename), '../','help')
})
const MFXPCmd = require('@mobilelive-inc/mfxp-generator')
const { red, green, yellow, blueBright } = require('ansi-colors')

const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

const colors = [blueBright, green, yellow, red]

function log (severity, line) {
  const level = levels[severity] || 0
  if (level === 1) {
    line = '--> ' + line
  }
  console[severity](colors[level](line))
}

const result = cmd.register('create', MFXPCmd.create.cli(log))
  .register('version', function () {
    console.log(require('../package.json').version)
  })
  .register('help', help.toStdout)
  .parse(process.argv.splice(2))

if (result) {
  log('error', 'Refer to the help documentation to use this command\n')
  help.toStdout([])
  process.exitCode = 1
}
