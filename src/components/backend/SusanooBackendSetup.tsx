import * as React from 'react';
import {
  getGroupVersionKindForResource,
  K8sResourceCommon,
  ListPageBody,
  ListPageHeader,
  ResourceLink,
  RowProps,
  TableColumn,
  TableData,
  useK8sWatchResource,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  CustomizationResource
} from '../../k8s/types';
import {
  AboutModal,
  Button,
  Card,
  CardBody,
  CardTitle,
  Modal,
  Popover,
  ProgressStep,
  ProgressStepper,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextVariants,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  TrashIcon
} from '@patternfly/react-icons';
import SusanooPluginAbout from '../SusanooPluginAbout';
import NetAppLogo from '../../assets/images/NA_logo_white_rgb.png';
import SusanooTridentOperatorDetails from './trident/SusanooTridentOperatorDetails';
import SusanooTridentOrchestratorDetails from './trident/SusanooTridentOrchestratorDetails';
import SusanooTridentBackendConfigDetails from './trident/SusanooTridentBackendConfigDetails';
import SusanooTridentStorageClassDetails from './trident/SusanooTridentStorageClassDetails';
import SusanooTridentVolumeSnapshotClassDetails from './trident/SusanooTridentVolumeSnapshotClassDetails';
import { k8sDelete, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { useHistory } from 'react-router-dom';

// Defining generic table props
type SusanooTableProps = {
  data: CustomizationResource[];
  unfilteredData: CustomizationResource[];
  loaded: boolean;
  error?: Error;
};

// Logic to display the Susanoo Console Plugin status
const SusanooConsolePlugin = () => {

  const SusanooTable: React.FC<SusanooTableProps> = ({ data, unfilteredData, loaded, error }) => {
    const columns: TableColumn<K8sResourceCommon>[] = [
      { title: 'Name', id: 'name' },
      { title: 'Version', id: 'version' },
      { title: 'Display Name', id: 'displayName' },
      { title: 'Created at', id: 'creationTimestamp' },
      { title: '', id: 'actions' }
    ];

    const SusanooTableRow: React.FC<RowProps<CustomizationResource>> = ({ obj, activeColumnIDs }) => {

      // Add confirmDelete logic and modal state
      const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
      const [resourceToDelete, setResourceToDelete] = React.useState<CustomizationResource | null>(null);

      // You may need to adjust this if ConsolePlugin is not a CustomizationResource
      const [k8sModel] = useK8sModel(getGroupVersionKindForResource(obj));

      const handleDelete = async () => {
        if (resourceToDelete) {
          try {
            await k8sDelete({ model: k8sModel, resource: resourceToDelete });
            console.log('ConsolePlugin deleted successfully');
          } catch (err) {
            console.error('Failed to delete ConsolePlugin:', err);
          } finally {
            setIsDeleteModalOpen(false);
            setResourceToDelete(null);
          }
        }
      };

      const confirmDelete = (resource: CustomizationResource) => {
        setResourceToDelete(resource);
        setIsDeleteModalOpen(true);
      };

      const history = useHistory();

      return (
        <>
          <TableData id={columns[0].id} activeColumnIDs={activeColumnIDs}>
            <ResourceLink
              groupVersionKind={getGroupVersionKindForResource(obj)}
              name={obj.metadata?.name}
              namespace={obj.metadata?.namespace}
            />
          </TableData>
          <TableData id={columns[1].id} activeColumnIDs={activeColumnIDs}>
            {obj.metadata?.labels?.['app.kubernetes.io/version']}
          </TableData>
          <TableData id={columns[2].id} activeColumnIDs={activeColumnIDs}>
            {obj.spec?.displayName}
          </TableData>
          <TableData id={columns[3].id} activeColumnIDs={activeColumnIDs}>
            {obj.metadata?.creationTimestamp}
          </TableData>
          <TableData id={columns[4].id} activeColumnIDs={activeColumnIDs} className="pf-u-text-align-center">
            <Button
              variant="plain"
              aria-label="Disable"
              icon={<ExternalLinkAltIcon />}
              onClick={() => {
                history.push(`/k8s/cluster/operator.openshift.io~v1~Console/cluster/console-plugins`);
              }}
            />
            <Button
              variant="plain"
              aria-label="Delete"
              onClick={() => confirmDelete(obj)}
              icon={<TrashIcon />}
            />
            <Modal
              variant="small"
              title="Confirm Delete"
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              actions={[
                <Button key="confirm" variant="danger" onClick={handleDelete}>
                  Delete
                </Button>,
                <Button key="cancel" variant="link" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
              ]}
            >
              Are you sure you want to delete this ConsolePlugin?
            </Modal>
          </TableData>
        </>
      );
    };

    return (
      <VirtualizedTable<K8sResourceCommon>
        data={data}
        unfilteredData={unfilteredData}
        loaded={loaded}
        loadError={error}
        columns={columns}
        Row={SusanooTableRow}
      />
    );
  };

  const resources = {
    group: 'console.openshift.io',
    version: 'v1',
    kind: 'ConsolePlugin',
  };

  const [data, loaded, error] = useK8sWatchResource<CustomizationResource[]>({
    groupVersionKind: resources,
    isList: true
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <ListPageHeader title="Susanoo">
        <Button
          variant='primary'
          onClick={handleModalToggle}
        >
          About
        </Button>
        <AboutModal
          isOpen={isModalOpen}
          onClose={handleModalToggle}
          brandImageAlt='NetApp, Inc Logo'
          brandImageSrc={NetAppLogo}
          backgroundImageSrc='/assets/netapp-logo.svg'
          trademark='NETAPP, the NETAPP logo, and the marks listed on the NetApp Trademarks page are trademarks of NetApp, Inc. Other company and product names may be trademarks of their respective owners.'
          aria-label='About Susanoo Plugin'
        >
          <SusanooPluginAbout />
        </AboutModal>
      </ListPageHeader>
      <ListPageBody>
        <Card>
          <CardTitle>Plugins</CardTitle>
          <CardBody>
            <SusanooTable
              data={data.filter(item => item.metadata.name === 'netapp-openshift-console-trident')}
              unfilteredData={data}
              loaded={loaded}
              error={error}
            />
          </CardBody>
        </Card>
      </ListPageBody>
    </>
  );
};

// Logic to display the Trident deployment progress via a ProgressStepper
export const SusanooTridentDeployProgress = () => {


  const subscriptionResources = {
    group: 'operators.coreos.com',
    version: 'v1alpha1',
    kind: 'Subscription',
  };
  const orchestratorResources = {
    group: 'trident.netapp.io',
    version: 'v1',
    kind: 'TridentOrchestrator',
  };
  const backendconfigResources = {
    group: 'trident.netapp.io',
    version: 'v1',
    kind: 'TridentBackendConfig',
  };
  const storageclassResources = {
    group: 'storage.k8s.io',
    version: 'v1',
    kind: 'StorageClass',
  };
  const snapshotclassResources = {
    group: 'snapshot.storage.k8s.io',
    version: 'v1',
    kind: 'VolumeSnapshotClass',
  };

  const [subscriptionData] = useK8sWatchResource<CustomizationResource[]>({
    groupVersionKind: subscriptionResources,
    isList: true
  });
  const subscriptionObj = subscriptionData[0] || null;
  const [orchestratorData] = useK8sWatchResource<CustomizationResource[]>({
    groupVersionKind: orchestratorResources,
    isList: true
  });
  // const orchestratorObj = orchestratorData[0] || null;
  const [backendconfigData] = useK8sWatchResource<CustomizationResource[]>({
    groupVersionKind: backendconfigResources,
    isList: true,
    namespaced: true,
  });
  // const backendconfigObj = backendconfigData[0] || null;
  const [storageclassData] = useK8sWatchResource<CustomizationResource[]>({
    groupVersionKind: storageclassResources,
    isList: true,
    namespaced: false,
  });
  // const storageclassObj = storageclassData[0] || null;
  const [snapshotclassData] = useK8sWatchResource<CustomizationResource[]>({
    groupVersionKind: snapshotclassResources,
    isList: true
  });
  // const snapshotclassObj = snapshotclassData[0] || null;

  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  // const [ isOperatorOpen, setIsOperatorOpen ] = React.useState(false);
  // const [ isOrchestratorOpen, setIsOrchestratorOpen ] = React.useState(false);
  // const [ isBackendOpen, setIsBackendOpen ] = React.useState(false);
  // const [ isStorageClassOpen, setIsStorageClassOpen ] = React.useState(false);
  // const [ isSnapshotClassOpen, setIsSnapshotClassOpen ] = React.useState(false);
  const [selectedResource, setSelectedResource] = React.useState<{ namespace: string, name: string } | null>(null);

  const operator = 'trident-operator';
  const isOperatorPresent = subscriptionData.some(row => (row.metadata.name === operator));
  const isOrchestratorPresent = orchestratorData.some(row => (row.status.status === 'Installed'));
  const isOrchestratorInstalling = orchestratorData.some(row => (row.status.status === 'Installing'));
  const isBackendConfigPresent = backendconfigData.length > 0;
  const isStorageClassPresent = storageclassData.some(row => (row.provisioner === 'csi.trident.netapp.io'));
  const isVolumeSnapshotClassPresent = snapshotclassData.some(row => (row.driver === 'csi.trident.netapp.io'));


  return (
    <>
      <ListPageHeader title="Trident">
        <Button
          variant='primary'
          onClick={() => {
            setIsWizardOpen(true);
            setSelectedResource({ namespace: subscriptionObj.metadata?.namespace, name: subscriptionObj.metadata?.name });
          }}
        >
          Configure
        </Button>
      </ListPageHeader>
      <ListPageBody>
        <Card ouiaId='trident-deploy-card'>
          <CardTitle>Deployment Status</CardTitle>
          <CardBody>
            <ProgressStepper
              aria-label="Trident Operator Installation Progress"
              isCenterAligned
            >
              <ProgressStep
                variant={isOperatorPresent ? 'success' : 'pending'}
                id="trident-1"
                titleId='trident-1'
                popoverRender={(stepRef) =>
                  <Popover
                    ariad-label="Trident Operator Installation"
                    headerContent="Trident Operator"
                    bodyContent={isOperatorPresent ? "Trident Operator installed successfully." : "Click Install to deploy the NetApp supported operator that manages Trident deployment and maintenance on Red Hat OpenShift."}
                    triggerRef={stepRef}
                  />
                }
              >
                Operator
              </ProgressStep>
              <ProgressStep
                variant={
                  isOrchestratorInstalling ? 'warning'
                    : isOrchestratorPresent ? 'success' : 'pending'}
                id="trident-2"
                titleId='trident-2'
                popoverRender={(stepRef) =>
                  <Popover
                    ariad-label="Trident Orchestrator Creation"
                    headerContent="Trident Orchestrator"
                    bodyContent={isOrchestratorPresent ? "Trident Orchestrator created successfully." : "Click Actions/Orchestrator to deploy the Trident Orchestrator required to interact with NetApp storage systems."}
                    triggerRef={stepRef}
                  />
                }
              >
                Orchestrator
              </ProgressStep>
              <ProgressStep
                variant={isBackendConfigPresent ? 'success' : 'pending'}
                id="trident-3"
                titleId='trident-3'
                popoverRender={(stepRef) =>
                  <Popover
                    ariad-label="Trident BackendConfig Creation"
                    headerContent="Trident BackendConfig"
                    bodyContent={isBackendConfigPresent ? "Trident BackendConfig created successfully." : "Click Actions/BackendConfig to create a backend configuration to access a NetApp storage system."}
                    triggerRef={stepRef}
                  />
                }
              >
                BackendConfig
              </ProgressStep>
              <ProgressStep
                variant={isStorageClassPresent ? 'success' : 'pending'}
                id="trident-4"
                titleId='trident-4'
                popoverRender={(stepRef) =>
                  <Popover
                    ariad-label="StorageClass"
                    headerContent="BackendConfig"
                    bodyContent={isStorageClassPresent ? "StorageClass created successfully." : "Click Actions/StorageClass to create a StorageClass required to manage PVCs/PVs with Trident on a NetApp storage system."}
                    triggerRef={stepRef}
                  />
                }
              >
                StorageClass
              </ProgressStep>
              <ProgressStep
                variant={isVolumeSnapshotClassPresent ? 'success' : 'pending'}
                id="trident-5"
                titleId='trident-'
                popoverRender={(stepRef) =>
                  <Popover
                    ariad-label="VolumeSnapshotClass"
                    headerContent="VolumeSnapshotClass"
                    bodyContent={isVolumeSnapshotClassPresent ? "VolumeSnapshotClass created successfully." : "Click Actions/SnapshotClass to create a VolumeSnapshotClass required to manage snapshots of PVCs/PVs with Trident on a NetApp storage system."}
                    triggerRef={stepRef}
                  />
                }
              >
                VolumeSnapshotClass
              </ProgressStep>
            </ProgressStepper>
          </CardBody>
        </Card>
      </ListPageBody>
      {selectedResource && (
        <Modal
          aria-label='Trident Deployment Wizard'
          variant="large"
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          hasNoBodyWrapper
          showClose={false}
        >
          <Wizard
            onClose={() => setIsWizardOpen(false)}
            header={
              <WizardHeader
                title="Trident Deployment"
                titleId="trident-wizard"
                onClose={() => setIsWizardOpen(false)}
                description="This wizard will guide you through the required steps to deploy and configure Trident with your NetApp storage solution on Red Hat OpenShift."
                aria-describedby='trident-wizard'
                aria-label='Trident Deployment Wizard'
              />
            }
          >
            <WizardStep name="Information" id="trident-deploy-info">
              <TextContent>
                <Text component={TextVariants.h1}>Trident</Text>
                <Text component={TextVariants.p}>Trident is a fully-supported open source project maintained by NetApp. It has been designed to help you meet your containerized application's persistence demands using industry-standard interfaces, such as the Container Storage Interface (CSI).</Text>
                <Text component={TextVariants.p}>Netapp Trident enables consumption and management of storage resources across all popular NetApp storage platforms, in the public cloud or on premises, including on-premises ONTAP clusters (AFF, FAS, and ASA), ONTAP Select, Cloud Volumes ONTAP, Element software (NetApp HCI, SolidFire), Azure NetApp Files, Amazon FSx for
                  NetApp ONTAP, and Cloud Volumes Service on Google Cloud.</Text>
                <Text component={TextVariants.p}>The following steps are required to deploy and configure Trident with your NetApp storage solution on Red Hat OpenShift:</Text>
                <TextList component={TextListVariants.ol}>
                  <TextListItem>Install the Trident Operator</TextListItem>
                  <TextListItem>Create the Trident Orchestrator</TextListItem>
                  <TextListItem>Create the Trident BackendConfig</TextListItem>
                  <TextListItem>Create the Trident StorageClass</TextListItem>
                  <TextListItem>Create the Trident VolumeSnapshotClass</TextListItem>
                </TextList>
              </TextContent>
            </WizardStep>
            <WizardStep name="Operator" id="trident-operator">
              <SusanooTridentOperatorDetails application={selectedResource.name} />
              <TextContent>
                <Text component={TextVariants.h1}>Help</Text>
                <Text component={TextVariants.p}>The installation process leverage the usage of a Red Hat OpenShift Certified Operator to enhanced the maintenance lifecycle of the Trident components.</Text>
              </TextContent>
            </WizardStep>
            <WizardStep name="Orchestrator" id="trident-orchestrator">
              <SusanooTridentOrchestratorDetails application={selectedResource.name} />
              <TextContent>
                <Text component={TextVariants.h1}>Help</Text>
                <Text component={TextVariants.p}>Trident deploys as a single Trident Controller Pod and one or more Trident Node Pods on the Kubernetes cluster and uses standard Kubernetes CSI Sidecar Containers to simplify the deployment of CSI plugins.</Text>
                <TextList>
                  <TextListItem>The controller plugin handles volume provisioning and management, such as snapshots and resizing.</TextListItem>
                  <TextListItem>The node plugin handles attaching the storage to the node.</TextListItem>
                </TextList>
              </TextContent>
            </WizardStep>
            <WizardStep name="BackendConfig" id="trident-backendconfig">
              <SusanooTridentBackendConfigDetails application={selectedResource.name} />
              <TextContent>
                <Text component={TextVariants.h1}>Help</Text>
                <Text component={TextVariants.p}>A backend defines the relationship between Trident and a storage system. It tells Trident how to communicate with that storage system and how Trident should provision volumes from it.</Text>
              </TextContent>
            </WizardStep>
            <WizardStep name="StorageClass" id="trident-storageclass">
              <SusanooTridentStorageClassDetails application={selectedResource.name} />
              <TextContent>
                <Text component={TextVariants.h1}>Help</Text>
                <Text component={TextVariants.p}>The Kubernetes StorageClass object specifies Trident as the provisioner and allows you to create a storage class to provision volumes with customizable attributes. Trident creates a matching storage class for Kubernetes objects that specify the Trident provisioner.</Text>
              </TextContent>
            </WizardStep>
            <WizardStep name="VolumeSnapshotClass" id="trident-snapshotclass">
              <SusanooTridentVolumeSnapshotClassDetails application={selectedResource.name} />
              <TextContent>
                <Text component={TextVariants.h1}>Help</Text>
                <Text component={TextVariants.p}>Kubernetes VolumeSnapshotClass objects are analogous to StorageClasses. They help define multiple classes of storage and are referenced by volume snapshots to associate the snapshot with the required snapshot class. Each volume snapshot is associated with a single volume snapshot class.</Text>
              </TextContent>
            </WizardStep>
          </Wizard>
        </Modal>
      )}
    </>
  )

};

const SusanooBackendSetup = () => {

  return (
    <>
      <SusanooConsolePlugin />
      <SusanooTridentDeployProgress />
    </>
  );
};

export default SusanooBackendSetup;
