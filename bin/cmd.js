#!/usr/bin/env node

'use strict'

const cmd = require('commist')()
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
  .parse(process.argv.splice(2))

if (result) {
  log('error', 'No command called')
  log('error', 'mfe command requires argument create')
  process.exit(1)
}
