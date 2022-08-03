import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { AtelierPassusSinglePageApplicationStack } from './atelier-passus-single-page-application-stack';

export class AtelierPassusAppStage extends cdk.Stage {
    
    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
      super(scope, id, props);
      const thenStack = new AtelierPassusSinglePageApplicationStack(this, 'AtelierPassusStack');
    }
}