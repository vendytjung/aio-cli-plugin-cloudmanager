/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const BaseCommerceCliCommand = require('../../../../../base-commerce-cli-command')
const { getProgramId } = require('../../../../../cloudmanager-helpers')
const { cli } = require('cli-ux')
const commonFlags = require('../../../../../common-flags')

class MaintenanceStatusCommand extends BaseCommerceCliCommand {
  async run () {
    const { args, flags } = this.parse(MaintenanceStatusCommand)

    const programId = getProgramId(flags)

    let result

    try {
      result = await this.runSync(programId, args.environmentId,
        {
          type: 'bin/magento',
          command: 'maintenance:status',
        },
        1000, 'maintenance:status')
    } catch (error) {
      cli.action.stop(error.message)
      return
    }

    return result
  }
}

MaintenanceStatusCommand.description = 'commerce maintenance status'

MaintenanceStatusCommand.flags = {
  ...commonFlags.global,
  ...commonFlags.programId,
}

MaintenanceStatusCommand.args = [
  { name: 'environmentId', required: true, description: 'the environment id' },
]

MaintenanceStatusCommand.aliases = [
  'cloudmanager:commerce:maintenance-status',
]

module.exports = MaintenanceStatusCommand