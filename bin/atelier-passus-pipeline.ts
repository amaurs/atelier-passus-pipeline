#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AtelierPassusPipelineStack } from '../lib/atelier-passus-pipeline-stack';

const app = new cdk.App();

console.log('ACCOUNT 👉🏽', process.env.ACCOUNT);
console.log('REGION 🌎', process.env.REGION);
console.log('GITHUB_PERSONAL_ACCESS_TOKEN_SECRET_NAME 👉🏽', process.env.GITHUB_PERSONAL_ACCESS_TOKEN_SECRET_NAME);

new AtelierPassusPipelineStack(app, 'AtelierPassusPipelineStack', {
  env: {
      account: process.env.ACCOUNT,
      region: process.env.REGION
      },
});