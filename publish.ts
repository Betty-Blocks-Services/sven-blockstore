import path from 'node:path';
import Jaws from '@betty-blocks/jaws';
import {
  functionDefinitions,
  stringifyDefinitions,
  zipFunctionDefinitions,
} from '@betty-blocks/cli/build/functions/functionDefinitions';

const args = process.argv.slice(2);

const [API_URL, JAWS_SECRETS, CURRENT_BRANCH] = args;

if (!API_URL) {
  throw new Error('API_URL is required');
}

if (!JAWS_SECRETS) {
  throw new Error('JAWS_SECRETS is required');
}

if (!CURRENT_BRANCH) {
  throw new Error('CURRENT_BRANCH is required');
}

const URL = API_URL;
const CONFIG = JSON.parse(JAWS_SECRETS);
const currentBranch = CURRENT_BRANCH;

const jaws = Jaws.getInstance(CONFIG);
const zones = CONFIG.services;

const workingDir = process.cwd();
const functionsDir = path.join(workingDir, 'functions');
const functions = await functionDefinitions(functionsDir);
const functionsJson = stringifyDefinitions(functions);

const appFile = await zipFunctionDefinitions(functionsDir);
const nativeFile = appFile.replace('app', 'native');

await Bun.write(nativeFile, Bun.file(appFile));

for (const zone of Object.keys(zones)) {
  const url = URL.replace('{ZONE}', zone);
  const jwt = jaws.sign(zone, { application_id: 'native' }).jwt;
  const zoneBranch = /(edge|acceptance)/.test(zone) ? zone : 'master';

  if (currentBranch === zoneBranch) {
    const formData = new FormData();
    formData.append('functions', functionsJson);
    formData.append('options', JSON.stringify({ compile: false }));
    formData.append('file', Bun.file(nativeFile));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    console.log(
      `[${zone.slice(0, 3)}] ${response.status} - ${response.statusText}`,
    );
  }
}
