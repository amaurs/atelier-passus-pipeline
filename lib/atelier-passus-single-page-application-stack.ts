import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_s3_deployment as s3_deployment } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_certificatemanager as certificate_manager } from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';
import { aws_route53 as route53 } from 'aws-cdk-lib';
import { aws_route53_targets as route53_targets } from 'aws-cdk-lib';
import { aws_codebuild as codebuild } from 'aws-cdk-lib';
import * as path from 'path';


export class AtelierPassusSinglePageApplicationStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const primaryDomain = 'passus-atelier'

        const bucket = new s3.Bucket(this, "AtelierPassusSPABucket", {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            bucketName: primaryDomain,
        });

        const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, 'OAI', {
            comment: `Origin Access Identity for Atelier Passus website.`,
        });

        const cloudfrontS3Access = new iam.PolicyStatement();
        cloudfrontS3Access.addActions('s3:GetBucket*');
        cloudfrontS3Access.addActions('s3:GetObject*');
        cloudfrontS3Access.addActions('s3:List*');
        cloudfrontS3Access.addResources(bucket.bucketArn);
        cloudfrontS3Access.addResources(`${bucket.bucketArn}/*`);
        cloudfrontS3Access.addCanonicalUserPrincipal(
          cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
        );

        bucket.addToResourcePolicy(cloudfrontS3Access);

        const cloudFrontDistProps: cloudfront.CloudFrontWebDistributionProps = {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: bucket,
                        originAccessIdentity: cloudFrontOAI,
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
        };

        const cloudfrontDist = new cloudfront.CloudFrontWebDistribution(
            this,
            `AtelierPassusConfiguration`,
            cloudFrontDistProps
        );

        new s3_deployment.BucketDeployment(this, 'AtelierPassusDeployment', {
            sources: [s3_deployment.Source.asset(path.join(__dirname, '../atelier-passus/build'))],
            destinationBucket: bucket,
            memoryLimit: 512,
            distribution: cloudfrontDist,
            distributionPaths: ['/index.html'],
        });
    }
}