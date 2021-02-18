#!/usr/bin/env node

'use strict'

const cmd = require('commist')()
const log = require('../lib/log')
const MFXPCmd = require('@mobilelive-inc/mfxp-generator')

const result = cmd.register('create', MFXPCmd.create.cli(log))
  .parse(process.argv.splice(2))

if (result) {
  log('error', 'No command called')
  log('error', 'mfe command requires argument create')
  process.exit(1)
}
