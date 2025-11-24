import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import { AtelierPassusAppStage } from './atelier-passus-app-stage';

export class AtelierPassusPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'AtelierPassusPipeline', {
      pipelineName: 'AtelierPassusPipeline',
      synth: new CodeBuildStep('Build', {
        input: CodePipelineSource.gitHub('amaurs/atelier-passus-pipeline', 'main', {
                    authentication: cdk.SecretValue.secretsManager(process.env.GITHUB_PERSONAL_ACCESS_TOKEN_SECRET_NAME!),
                }),
        additionalInputs: {
            'atelier-passus': CodePipelineSource.gitHub('amaurs/atelier-passus', 'main', {
                        authentication: cdk.SecretValue.secretsManager(process.env.GITHUB_PERSONAL_ACCESS_TOKEN_SECRET_NAME!),
                    }),
        },
        env: {
            'ACCOUNT': process.env.ACCOUNT!,
            'REGION': process.env.REGION!,
            'GITHUB_PERSONAL_ACCESS_TOKEN_SECRET_NAME': process.env.GITHUB_PERSONAL_ACCESS_TOKEN_SECRET_NAME!,
        },
        commands: [
            'node -v',
            'npm -v',
            'npx tsc -v',
            'which node',
            'which npm',
            'which npx',
            'cd atelier-passus',
            'npm ci',
            'npm run build',
            'cd ..',
            'npm ci',
            'npm run build',
            'npx cdk synth'
        ]
      })
    });

    pipeline.addStage(new AtelierPassusAppStage(this, "Deploy", {
      env: { account: process.env.ACCOUNT!, region: process.env.REGION! }
    }));
  }
}
