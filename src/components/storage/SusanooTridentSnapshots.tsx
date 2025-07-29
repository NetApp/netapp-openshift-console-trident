import * as React from 'react';
import {
  ListPageBody,
  ListPageHeader,
  ResourceLink,
  RowProps,
  TableColumn,
  TableData,
  VirtualizedTable,
  getGroupVersionKindForResource,
  k8sDelete,
  useK8sModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { useHistory } from 'react-router-dom';
import { CustomizationResource } from '../../k8s/types';
import { Button, Label, Modal } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';

interface SusanooTridentSnapshotsProps {
  persistentVolumeClaim: CustomizationResource;
};

export const TridentSnapshotStatus: React.FC<SusanooTridentSnapshotsProps> = ({ persistentVolumeClaim }) => {

  const resources = [
    {
      group: 'snapshot.storage.k8s.io',
      version: 'v1',
      kind: 'VolumeSnapshot',
    },
  ];
  
  const columns: TableColumn<CustomizationResource>[] = [ 
    { title: 'Name', id: 'name', },
    { title: 'PVC', id: 'pvc', },
    { title: 'Status', id: 'status',},
    { title: 'Size', id: 'size', },
    { title: 'Snapshot Class', id: 'snapshotClass', },
    { title: 'Created at', id: 'metadata', },
    { title: '', id: 'actions', }
  ];
  
  const Row = ({ obj, activeColumnIDs }: RowProps<CustomizationResource>) => {
    const groupVersionKind = getGroupVersionKindForResource(obj);  

    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [resourceToDelete, setResourceToDelete] = React.useState<CustomizationResource | null>(null);
    
    const [k8sModel] = useK8sModel(getGroupVersionKindForResource(obj));
    const handleDelete = async () => {
      if (resourceToDelete) {
        try {
          await k8sDelete({ model: k8sModel, resource: resourceToDelete });
          console.log('VolumeSnapshot deleted successfully');
        } catch (err) {
          console.error('Failed to delete VolumeSnapshot:', err);
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

    const getStatusLabelColor = (phase?: string): 'green' | 'red' => {
      switch (phase) {
          case 'Ready':
              return 'green';
          default:
              return 'red';
      }
    };

    return (
      <>
        <TableData id={columns[0].id} activeColumnIDs={activeColumnIDs}>
          <ResourceLink
            groupVersionKind={groupVersionKind}
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
          />
        </TableData>
        <TableData id={columns[1].id} activeColumnIDs={activeColumnIDs}>
          {obj.spec?.source?.persistentVolumeClaimName}
        </TableData>
        <TableData id={columns[2].id} activeColumnIDs={activeColumnIDs}>
          <Label color={getStatusLabelColor(obj.status?.readyToUse ? 'Ready' : 'Not Ready')} isCompact>
            {obj.status?.readyToUse ? 'Ready' : 'Not Ready'}
          </Label>
        </TableData>
        <TableData id={columns[3].id} activeColumnIDs={activeColumnIDs}>
          {obj.status?.restoreSize}
        </TableData>
        <TableData id={columns[4].id} activeColumnIDs={activeColumnIDs}>
          {obj.spec?.volumeSnapshotClassName}
        </TableData>
        <TableData id={columns[5].id} activeColumnIDs={activeColumnIDs}>
          {obj.metadata.creationTimestamp}
        </TableData>
        <TableData id={columns[6].id} activeColumnIDs={activeColumnIDs}>
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
            Are you sure you want to delete this VolumeSnapshot?
          </Modal>          
        </TableData>
      </>
    );
  };
  
  type CustomizationTableProps = {
    data: CustomizationResource[];
    unfilteredData: CustomizationResource[];
    loaded: boolean;
    loadError?: {
      message?: string;
    };
  };
  
  const CustomizationTable = ({
    data,
    unfilteredData,
    loaded,
    loadError,
  }: CustomizationTableProps) => {
    return (
      <VirtualizedTable<CustomizationResource>
        data={data}
        unfilteredData={unfilteredData}
        loaded={loaded}
        loadError={loadError}
        columns={columns}
        Row={Row}
      />
    );
  };

  const history = useHistory();
  const watches = resources.map(({ group, version, kind }) => {
    const [data, loaded, error] = useK8sWatchResource<CustomizationResource[]>({
      groupVersionKind: { group, version, kind },
      isList: true,
      namespaced: false,
    });
    if (error) {
      console.error('Could not load', kind, error);
    }
    return [data, loaded, error];
  });

  const flatData = watches.map(([list]) => list).flat();
  const loaded = watches.every(([, loaded, error]) => !!(loaded || error));

  return (
    <>
      <ListPageHeader title={`Snapshots for: ${persistentVolumeClaim.metadata?.name}`}>
      <Button
          variant="primary"
          onClick={() => {
            history.push({
              pathname: '/console-trident-create-object',
              state: { 
                initialResource: {
                  apiVersion: 'snapshot.storage.k8s.io/v1',
                  kind: 'VolumeSnapshot',
                  metadata: {
                    name: `${persistentVolumeClaim.metadata?.name}-snapshot`,
                    namespace: `${persistentVolumeClaim.metadata?.namespace}`,
                    labels: {
                      'susanoo.trident.netapp.io': 'true',
                    },
                  },
                  spec: {
                    volumeSnapshotClassName: 'trident-fsx-nas-snapshot',
                    source: {
                      persistentVolumeClaimName: `${persistentVolumeClaim.metadata?.name}`
                    }
                  }
                }
              }
            });
          }}
        >
          Create Snapshot
        </Button>
      </ListPageHeader>
      <ListPageBody>
        <CustomizationTable
          data={flatData.filter(snapshot => snapshot.spec.source.persistentVolumeClaimName === persistentVolumeClaim.metadata.name)}
          unfilteredData={flatData}
          loaded={loaded}
        />
      </ListPageBody>
    </>
  );
};

const SusanooTridentSnapshots: React.FC<SusanooTridentSnapshotsProps> = ({ persistentVolumeClaim }) => {

  return (
    <>
      <TridentSnapshotStatus persistentVolumeClaim={persistentVolumeClaim} />
    </>
  );
};

export default SusanooTridentSnapshots;