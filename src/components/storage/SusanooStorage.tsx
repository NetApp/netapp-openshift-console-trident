import * as React from 'react';
import {
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  ResourceLink,
  RowFilter,
  RowProps,
  TableColumn,
  TableData,
  VirtualizedTable,
  getGroupVersionKindForResource,
  k8sDelete,
  useK8sWatchResource,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { CustomizationResource } from '../../k8s/types';
import { 
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Button, 
  Card, 
  CardBody, 
  CardExpandableContent, 
  CardHeader, 
  CardTitle, 
  Divider, 
  Dropdown, 
  DropdownItem, 
  DropdownList, 
  Flex, 
  Gallery, 
  GalleryItem, 
  Grid, 
  Label, 
  LabelGroup, 
  Level, 
  MenuToggle, 
  MenuToggleElement, 
  Modal, 
  Stack
} from '@patternfly/react-core';
import SusanooTridentSnapshots from './SusanooTridentSnapshots';
import { EllipsisVIcon } from '@patternfly/react-icons';
import CreatePersistentVolumeClaim from './SusanooTridentCreatePersistentVolumeClaim';
import InternalDatasets from './SusanooInternalDatasets';
import ImportPVCForm from './SusanooImportPersistentVolumeClaim';
import useActivationKeyCheck from '../../utils/SusanooActivationKeyCheck';

type SusanooDatasetsProps = {
  data: CustomizationResource[];
  unfilteredData: CustomizationResource[];
  loaded: boolean;
  error?: Error;
};

type Toast = {
  id: string;
  title: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
};

// Logic to build a generic table template used by all below Status logics
const SusanooTable: React.FC<SusanooDatasetsProps & { value: string }> = ({ data, unfilteredData, loaded, error, value}) => {

  const columns: TableColumn<CustomizationResource>[] = [
    { title: 'Name', id: 'name' },
    { title: 'Status', id: 'status' },
    { title: 'Namespace', id: 'namespace' },
    { title: 'Access Mode', id: 'accessmode' },
    { title: 'Exported to', id: 'exportedto' },
    { title: '', id: 'actions' },
  ];
  
  const getPhaseLabelColor = (phase?: string): 'green' | 'blue' | 'grey' => {
    switch (phase) {
        case 'Bound':
            return 'green';
        case 'Released':
            return 'blue';
        default:
            return 'grey';
    }
  };
  
  const SusanooTableRow: React.FC<RowProps<CustomizationResource>> = ({ obj, activeColumnIDs}) => {

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const handleModalToggle = () => {
      setIsModalOpen(!isModalOpen);
    };
    const addToast = (title: string, variant: Toast['variant'] = 'danger') => {
      setToasts(prev => [...prev, {
        id: new Date().getTime().toString(),
        title,
        variant,
      }]);
    };
  
    const removeToast = (id: string) => {
      setToasts(toasts => toasts.filter(toast => toast.id !== id));
    };
    const [isOpen, setIsOpen] = React.useState(false); 
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const handleDelete = async () => {
      try {
        await k8sDelete({
          model: {
            apiVersion: 'v1',
            kind: 'PersistentVolumeClaim',
            plural: 'persistentvolumeclaims',
            abbr: 'PVC',
            label: 'PersistentVolumeClaim',
            labelPlural: 'PersistentVolumeClaims',
          },
          resource: {
            metadata: {
              name: obj.spec.claimRef.name,
              namespace: obj.spec.claimRef.namespace,
            },
          },
        });
        await k8sDelete({
          model: {
            apiVersion: 'v1',
            kind: 'PersistentVolume',
            plural: 'persistentvolumes',
            abbr: 'PV',
            label: 'PersistentVolume',
            labelPlural: 'PersistentVolumes',
          },
          resource: obj,
        });
        addToast('Successfully deleted PersistentVolume', 'success');
      } catch (err) {
        console.error('Failed to delete PersistentVolumeClaim:', err);
        addToast('Failed to delete PersistentVolume');
      }
    };

    const getOCPAILabelColor = (phase?: string): 'green' | 'grey' => {
      switch (phase) {
          case 'true':
              return 'green';
          default:
              return 'grey';
      }
    };

    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
    const [selectedPVC, setSelectedPVC] = React.useState<CustomizationResource | null>(null);
    const handleImportModalToggle = () => {
      setIsImportModalOpen(!isImportModalOpen);
    }

    return (
      <>
      <AlertGroup isToast>
        {toasts.map(({ id, variant, title }) => (
          <Alert
            key={id}
            variant={variant}
            title={title}
            actionClose={
              <AlertActionCloseButton
                title={title}
                onClose={() => removeToast(id)}
              />
            }
          />
        ))}
      </AlertGroup>      
        <TableData id={columns[0].id} activeColumnIDs={activeColumnIDs} >
          <ResourceLink
            groupVersionKind={getGroupVersionKindForResource(obj)}
            name={obj.metadata?.name}
            namespace={obj.metadata?.namespace}
          />
        </TableData> 
        <TableData id={columns[1].id} activeColumnIDs={activeColumnIDs} >
          <Label color={getPhaseLabelColor(obj.status?.phase)}>
            {obj.status?.phase}
          </Label>
        </TableData>           
        <TableData id={columns[2].id} activeColumnIDs={activeColumnIDs} >
          <ResourceLink
            groupVersionKind={{
              group: '',
              version: 'v1',
              kind: 'Project'
            }}
            name={obj.metadata?.namespace}
            namespace={obj.metadata?.namespace}
            />
        </TableData>             
        <TableData id={columns[3].id} activeColumnIDs={activeColumnIDs}>
          {obj.spec?.accessModes}
        </TableData>
        <TableData id={columns[4].id} activeColumnIDs={activeColumnIDs}>
          <Label color={getOCPAILabelColor(obj.metadata?.labels?.['opendatahub.io/dashboard'])} >
            {obj.metadata?.labels?.['opendatahub.io/dashboard'] ? 'OpenShift AI' : 'None'}
          </Label>
        </TableData>    
        <TableData id={columns[5].id} activeColumnIDs={activeColumnIDs} className="pf-u-text-align-center">
          <Dropdown
            isOpen={isOpen}
            onSelect={(_event, value) => {
              if (value === 'snapshots') {
                handleModalToggle();
              } else if (value === 'import') {
                setSelectedPVC(obj);
                handleImportModalToggle();
              } else if (value === 'delete') {
                handleDelete();
              }
              setIsOpen(false);
            }}
            onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                aria-label="actions"
                variant="plain"
                onClick={() => setIsOpen(!isOpen)}
                isExpanded={isOpen}
              >
                <EllipsisVIcon />
              </MenuToggle>
            )}
          >
            <DropdownList>
              <DropdownItem value="snapshots" key="snapshots">Snapshots</DropdownItem>
              <DropdownItem value="import" key="import">Import to</DropdownItem>
              <DropdownItem value="delete" key="delete" className="pf-m-danger">Delete</DropdownItem>
            </DropdownList>
          </Dropdown>
        </TableData>
        <Modal
          aria-label="SusanooTridentSnapshots"
          variant="large"
          isOpen={isModalOpen}
          onClose={handleModalToggle}
          actions={[
            <Button 
              aria-label="details"
              key="link" 
              variant="primary" 
              onClick={() => window.open(`/k8s/ns/${obj.spec.claimRef.namespace}/persistentvolumeclaims/${obj.spec.claimRef.name}/volumesnapshots`, '_blank')}
            >
              Details
          </Button>,
            <Button 
              aria-label="close"
              key="close" 
              variant="primary" 
              onClick={handleModalToggle}
            >
              Close
            </Button>
          ]}
        >
          <SusanooTridentSnapshots persistentVolumeClaim={obj} />
        </Modal>
          <ImportPVCForm
            isOpen={isImportModalOpen}
            onClose={handleImportModalToggle}
            pvc={selectedPVC}
          />
      </>
    );
  };

  const sortByStatus = (pvList: CustomizationResource[]) => {
    const statusPriority = {
      'Bound': 0,
      'Released': 1
    };

    return pvList.sort((a, b) => {
      const statusA = a.status?.phase || 'Unknown';
      const statusB = b.status?.phase || 'Unknown';
      
      return (statusPriority[statusA] ?? 2) - (statusPriority[statusB] ?? 2);
    });
  };

  return (
      <VirtualizedTable<CustomizationResource>
        data={sortByStatus(data.filter(pvc => pvc.metadata?.annotations?.['volume.kubernetes.io/storage-provisioner'] === 'csi.trident.netapp.io'))}
        unfilteredData={unfilteredData}
        loaded={loaded}
        loadError={error}
        columns={columns}
        Row={SusanooTableRow}
      />
  );

};

export const filters: RowFilter[] = [
    {
      filterGroupName: 'Status',
      type: 'pvc-status',
      reducer: (pvc: CustomizationResource) => pvc.status?.phase || 'Unknown',
      filter: (input, pvc) => {
        if (input.selected?.length) {
          return input.selected.includes(pvc.status?.phase || 'Unknown');
        }
        return true;
      },
      items: [
        { id: 'Bound', title: 'Bound' },
        { id: 'Pending', title: 'Pending' },
        { id: 'Released', title: 'Released' },
        { id: 'Terminating', title: 'Terminating' },
        { id: 'Unknown', title: 'Unknown' }
      ],
    }
  ];

const SusanooTridentVolumes = () => {
  const { isValidKey, isLoading } = useActivationKeyCheck();

  // Define the resources to be used in the table
  const resources = {
      group: '',
      version: 'v1',
      kind: 'PersistentVolumeClaim',
  };

  const [pvc, loaded, error] = useK8sWatchResource<CustomizationResource[]>({
    groupVersionKind: resources,
    isList: true,
    namespaced: true,
  });

  const volume = '';

  const [data, filteredData, onFilterChange] = useListPageFilter(pvc, filters); 
  const [isOpen, setIsOpen] = React.useState(false);   

  // PVC Card Expansion
  const [isPVCCardExpanded, setIsPVCCardExpanded] = React.useState(false);
  const onPVCCardExpand = () => {
    setIsPVCCardExpanded(!isPVCCardExpanded);
  };
  const pvcCardAction = (
    <Button variant='primary' onClick={() => setIsOpen(true)}>Create</Button>
  )

  // VS Card Expansion
  const [isVSCardExpanded, setIsVSCardExpanded] = React.useState(false);
  const onVSCardExpand = () => {
    setIsVSCardExpanded(!isVSCardExpanded);
  };
  const vsCardAction = (
    <Button variant='primary' onClick={() => setIsOpen(true)} isDisabled>Create</Button>
  )

  // using isOpen and setIsOpen to control the modal state for all cards might need to get refactored
  // to use a different state for each card
  // or use a single state to control the modal for all cards
  const [isHelpModalOpen, setIsHelpModalOpen] = React.useState(false);
  const handleHelpModalToggle = () => {
    setIsHelpModalOpen(!isHelpModalOpen);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isValidKey) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Alert variant="danger" title="EAP Key expired">
          The Early Access Program activation key is missing or expired. Please contact your administrator.
        </Alert>
      </div>
    );
  }

  return (
    <>
      <ListPageHeader title="Storage">
        <Button 
          variant="primary"
          onClick={handleHelpModalToggle}
        >
          Help
        </Button>
        <Modal
          isOpen={isHelpModalOpen}
          onClose={handleHelpModalToggle}
          title="Storage"
          variant="small"
        >
          This Storage page overviews the storage-related objects available in the cluster and managed by Trident.
          <br /> <br />
          The In-cluster assets section displays the PersistentVolumeClaims and VolumeSnapshots:
          <ul>
            <li>
            The PersistentVolumeClaims section allows you to create, delete, import (to OpenShift AI), and access the snapshot list.
            </li>
            <li>
            The VolumeSnapshots section allows you to import a snapshot as a new PersistentVolumeClaim.
            </li>
          </ul>
          <br />
          The External assets section displays the data sources available outside the cluster on a NetApp storage system that can be:
          <ul>
            <li>
            Imported to OpenShift as a PersistentVolumeClaim for any workload usage.
            </li>
            <li>
            Imported to OpenShift AI as a data connection (usually an S3 endpoint).
            </li>
          </ul>
          <br /> <br />
        </Modal>
      </ListPageHeader>
      <ListPageBody>

      <Grid>
                <Gallery hasGutter minWidths={{ default: '430px' }}>
                  <GalleryItem>
                  <Card ouiaId='susanoo-trident-volumes-status'>
                  <CardTitle style={{ textAlign: 'center' } as React.CSSProperties}>Usage</CardTitle>
                    <CardBody style={{ textAlign: 'center' } as React.CSSProperties}>
                      <Flex display={{ default: 'inlineFlex' }}>
                        <Stack> 
                          {pvc.filter(pvc => !pvc.metadata?.labels?.hasOwnProperty('opendatahub.io/dashboard')).length || 0}
                          <span>OpenShift</span>
                        </Stack>
                        <Divider orientation={{ default: 'vertical' }} />
                        <Stack> 
                          {pvc.filter(pvc => pvc.metadata?.labels?.hasOwnProperty('opendatahub.io/dashboard')).length || 0}                        
                          <span>OpenShift AI</span>
                          </Stack>
                          <Divider orientation={{ default: 'vertical' }} />
                        <Stack> 
                        {pvc.filter(pvc => pvc.metadata?.labels?.hasOwnProperty('backstage.io/dashboard')).length || 0}   
                          <span>Developer Hub</span>
                        </Stack>
                      </Flex>
                    </CardBody>
                  </Card>  
                  </GalleryItem>
                  {/* <GalleryItem>                
                  <Card ouiaId='susanoo-trident-statistics'>
                  <CardTitle style={{ textAlign: 'center' } as React.CSSProperties} >Capacity</CardTitle>
                    <CardBody style={{ textAlign: 'center' } as React.CSSProperties}>
                      <Stack>
                      placeholder
                      <span>placeholder</span>
                      </Stack>
                    </CardBody>
                  </Card>
                  </GalleryItem> */}
                </Gallery>
      </Grid>
      </ListPageBody>
      <ListPageHeader title="In-cluster assets">
      </ListPageHeader>
      <ListPageBody>
        <Grid hasGutter>
        <Card ouiaId='susanoo-trident-volumes' isExpanded={isPVCCardExpanded}>
          <CardHeader
            actions={{ actions: pvcCardAction}}
            onExpand={onPVCCardExpand}
            toggleButtonProps={{ 
              'aria-label': 'Toggle Card',
              'aria-expanded': isPVCCardExpanded,
              'aria-labelledby': 'titleID toggle-button',
              id: 'toggle-button' 
            }}
          >
            {isPVCCardExpanded && <CardTitle id="titleID">PersistentVolumeClaims</CardTitle>}
            {!isPVCCardExpanded && (
              <Level hasGutter> 
                <CardTitle id="titleID">PersistentVolumeClaims</CardTitle>
                <LabelGroup>
                  <Label color="blue">
                    <span>Total: </span>
                    {pvc.filter(pvc => pvc.metadata?.annotations?.['volume.kubernetes.io/storage-provisioner'] === 'csi.trident.netapp.io').length || 0}
                  </Label>
                  <Label color="purple">
                    <span>ReadWriteOnce: </span>
                    {pvc.filter(pvc => pvc.spec.accessModes?.includes('ReadWriteOnce') && pvc.metadata?.annotations?.['volume.kubernetes.io/storage-provisioner'] === 'csi.trident.netapp.io').length || 0}
                  </Label>
                  <Label color="purple">
                    <span>ReadWriteMany: </span>
                    {pvc.filter(pvc => pvc.spec.accessModes?.includes('ReadWriteMany') && pvc.metadata?.annotations?.['volume.kubernetes.io/storage-provisioner'] === 'csi.trident.netapp.io').length || 0}
                  </Label>
                </LabelGroup>
              </Level>
            )}
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <ListPageFilter
                data={data}
                loaded={loaded}
                rowFilters={filters}
                onFilterChange={onFilterChange}
              />         
              <SusanooTable 
                data={filteredData}
                unfilteredData={data}
                loaded={loaded}
                error={error}
                value={volume}
              />
            </CardBody>
          </CardExpandableContent>
        </Card>
      {/* </ListPageBody>
      <ListPageBody> */}
        <Card ouiaId='susanoo-trident-snapshots' isExpanded={isVSCardExpanded}>
          <CardHeader
            actions={{ actions: vsCardAction}}
            onExpand={onVSCardExpand}
            toggleButtonProps={{ 
              'aria-label': 'Toggle Card',
              'aria-expanded': isVSCardExpanded,
              'aria-labelledby': 'titleID toggle-button',
              id: 'toggle-button' 
            }}
          >
            {isVSCardExpanded && <CardTitle id="titleID">VolumeSnapshots</CardTitle>}
            {!isVSCardExpanded && (
              <Level hasGutter> 
                <CardTitle id="titleID">VolumeSnapshots</CardTitle>
                <LabelGroup >
                  <Label color="blue">
                    <span>Total: </span>
                    {pvc.filter(pvc => pvc.metadata?.annotations?.['volume.kubernetes.io/storage-provisioner'] === 'csi.trident.netapp.io').length || 0}
                  </Label>
                  <Label color="purple">
                    <span>ReadWriteOnce: </span>
                    {pvc.filter(pvc => pvc.spec.accessModes?.includes('ReadWriteOnce') && pvc.metadata?.annotations?.['volume.kubernetes.io/storage-provisioner'] === 'csi.trident.netapp.io').length || 0}
                  </Label>
                  <Label color="purple">
                    <span>ReadWriteMany: </span>
                    {pvc.filter(pvc => pvc.spec.accessModes?.includes('ReadWriteMany') && pvc.metadata?.annotations?.['volume.kubernetes.io/storage-provisioner'] === 'csi.trident.netapp.io').length || 0}
                  </Label>
                </LabelGroup>
              </Level>
            )}
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <InternalDatasets />
            </CardBody>
          </CardExpandableContent>
        </Card>
        </Grid>
      </ListPageBody>
      <CreatePersistentVolumeClaim isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );

};

export default SusanooTridentVolumes;