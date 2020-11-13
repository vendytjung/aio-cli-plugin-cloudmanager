/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command } = require('@oclif/command')
const { accessToken: getAccessToken } = require('@adobe/aio-cli-plugin-jwt-auth')
const { getApiKey, getBaseUrl, getOrgId, getProgramId, getOutputFormat } = require('../../../cloudmanager-helpers')
const { cli } = require('cli-ux')
const { init } = require('@adobe/aio-lib-cloudmanager')
const _ = require('lodash')
const commonFlags = require('../../../common-flags')
const ListEnvironmentsCommand = require('./../program/list-environments')

async function _listIpAllowlists (programId, passphrase) {
  const apiKey = await getApiKey()
  const accessToken = await getAccessToken(passphrase)
  const orgId = await getOrgId()
  const baseUrl = await getBaseUrl()
  const sdk = await init(orgId, apiKey, accessToken, baseUrl)
  return sdk.listIpAllowlists(programId)
}

class ListIPAllowlistBindingDetails extends Command {
  async run () {
    const { args, flags } = this.parse(ListIPAllowlistBindingDetails)

    const programId = await getProgramId(flags)

    let result

    try {
      result = await this.listIpAllowlists(programId, flags.passphrase)
    } catch (error) {
      this.error(error.message)
    }

    const allowList = result.find(allowList => allowList.id === args.ipAllowlistId)

    if (!allowList) {
      this.error(`Could not find IP Allowlist with id ${args.ipAllowlistId} in program id ${programId}.`)
    }

    const bindings = allowList.bindings

    let environments
    try {
      environments = await new ListEnvironmentsCommand().listEnvironments(programId, flags.passphrase)
    } catch (error) {
    }

    bindings.forEach(binding => {
      const environment = environments && environments.find(e => e.id === binding.environmentId)
      if (environment) {
        binding.environmentName = environment.name
      } else {
        binding.environmentName = `Environment ${binding.environmentId}`
      }
    })

    cli.table(bindings, {
      environmentId: {
        header: 'Environment Id',
      },
      environmentName: {
        header: 'Environment Name',
      },
      tier: {
        header: 'Service',
        get: item => _.startCase(item.tier),
      },
      status: {
        get: item => _.startCase(item.status),
      },
    }, {
      printLine: this.log,
      output: getOutputFormat(flags),
    })

    return allowList
  }

  async listIpAllowlists (programId, passphrase = null) {
    return _listIpAllowlists(programId, passphrase)
  }
}

ListIPAllowlistBindingDetails.description = 'list detailed information on IP Allowlist Bindings'

ListIPAllowlistBindingDetails.args = [
  { name: 'ipAllowlistId', required: true, description: 'the id of the allowlist' },
]

ListIPAllowlistBindingDetails.flags = {
  ...commonFlags.global,
  ...commonFlags.outputFormat,
  ...commonFlags.programId,
}

module.exports = ListIPAllowlistBindingDetails
