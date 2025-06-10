import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

// Union type for all console.openshift.io customization resources.
export type CustomizationResource = {
  provisioner?: string;
  parameters?: {
    backendType?: string;
    clones?: string;
    snapshots?: string;
    fstype?: string;
  };
  metadata: {
    name: string;
    namespace: string;
  };
  driver?: string;
  deletionPolicy?: string;
  state?: string;
  spec?: {
    accessModes?: string[];
    group?: string;
    displayName?: string;
    description?: string;
    href?: string;
    text?: string;
    version?: {
      name?: string;
    };
    link?: {
      href?: string;
      text?: string;
    };
    location?: string;
    volumeName?: string;
    name?: string;
    dataSource?: {
      apiGroup: string;
      kind?: string;
      name?: string;
    };
    dataSourceRef?: {
      apiGroup: string;
      kind?: string;
      name?: string;
    };
    attributes?: {
      backendType?: string;
      clones?: string;
      snapshots?: string;
    };
  };
  config?: {
    requestName?: string;
  };
  phase?: string;
  status?: {
    containerStatuses?: {
      ready?: boolean;
      started?: boolean;
    }[];
    channels?: {
      name?: string;
      entries?: {
        name?: string;
        version?: string;
      }[];
    }[];
  }
} & K8sResourceKind;

export type ConsoleLink = {
  spec: {
    href: string;
    location:
      | 'ApplicationMenu'
      | 'HelpMenu'
      | 'UserMenu'
      | 'NamespaceDashboard';
    text: string;
    applicationMenu?: {
      section: string;
    };
  };
} & K8sResourceKind;

export type ConsoleNotification = {
  spec: {
    backgroundColor?: string;
    color?: string;
    link?: {
      href: string;
      text: string;
    };
    location?: 'BannerTop' | 'BannerBottom' | 'BannerTopBottom';
    text: string;
  };
} & K8sResourceKind;
