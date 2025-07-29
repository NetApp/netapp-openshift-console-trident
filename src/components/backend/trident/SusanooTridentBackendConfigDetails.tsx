import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  ResourceLink,
  TableData,
  getGroupVersionKindForResource,
  RowProps,
  TableColumn,
  VirtualizedTable,
  ListPageHeader,
  ListPageBody,
  useK8sModel,
  k8sDelete,
} from '@openshift-console/dynamic-plugin-sdk';
import { CustomizationResource } from 'src/k8s/types';
import { 
  Button, 
  Modal 
} from '@patternfly/react-core';
import SusanooTridentBackendConfigForm from './SusanooTridentCreateBackendConfig';
import { TrashIcon } from '@patternfly/react-icons';

type SusanooTridentBackendConfigProps = {
  application: string;
};

const SusanooTridentBackendConfig: React.FC<SusanooTridentBackendConfigProps> = ({ application }) => {
  
    const columns: TableColumn<CustomizationResource>[] = [
      { title: 'Name', id: 'name' },
      { title: 'SVM', id: 'svm' },
      { title: 'Driver', id: 'driver' },
      { title: 'Status', id: 'status' },
      { title: 'Created at', id: 'creationTimestamp'},
      { title: '', id: 'actions' },
    ];
  
    const SusanooTableRow: React.FC<RowProps<CustomizationResource>> = ({ obj, activeColumnIDs}) => {

        const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
        const [resourceToDelete, setResourceToDelete] = React.useState<CustomizationResource | null>(null);

        const [k8sModel] = useK8sModel(getGroupVersionKindForResource(obj));
        
        const handleDelete = async () => {
          if (resourceToDelete) {
            try {
              await k8sDelete({ model: k8sModel, resource: resourceToDelete });
              console.log('Trident BackendConfig deleted successfully');
            } catch (err) {
              console.error('Failed to delete Trident BackendConfig:', err);
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
              {obj.spec?.svm}
            </TableData>
            <TableData id={columns[2].id} activeColumnIDs={activeColumnIDs}>
              {obj.spec?.storageDriverName}
            </TableData>
            <TableData id={columns[3].id} activeColumnIDs={activeColumnIDs}>
                {obj.status?.lastOperationStatus}
            </TableData>
            <TableData id={columns[4].id} activeColumnIDs={activeColumnIDs}>
              {obj.metadata?.creationTimestamp}
            </TableData>
            <TableData id={columns[5].id} activeColumnIDs={activeColumnIDs} className="pf-u-text-align-center">
              <Button
                variant="plain"
                aria-label="Delete"
                onClick={() => confirmDelete(obj)}
                icon={<TrashIcon />}
              />
            </TableData>

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
              Are you sure you want to delete this Trident BackendConfig?
            </Modal>
          </>
        );
      };
    
    type SusanooTableProps = {
        data: CustomizationResource[];
        unfilteredData: CustomizationResource[];
        loaded: boolean;
        error?: Error;
    };

    const CustomizationTable = ({
        data,
        unfilteredData,
        loaded,
        error,
    }: SusanooTableProps) => {
        return (
            <VirtualizedTable<K8sResourceCommon>
              aria-label='Trident backendconfig'
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
      group: 'trident.netapp.io',
      version: 'v1',
      kind: 'TridentBackendConfig',
    };
  
    const [data, loaded, error] = useK8sWatchResource<CustomizationResource[]>({
      groupVersionKind: resources,
      isList: true,
      namespaced: true,
    });
    
    const [isOpen, setIsOpen] = React.useState(false);
  
    return (
      <>
        <ListPageHeader title="Trident BackendConfig">
          <Button 
            variant="primary"
            onClick={() => {setIsOpen(true);}}
          >
            Create
          </Button>
        </ListPageHeader>
        <ListPageBody>
          <CustomizationTable 
            data={data}
            unfilteredData={data}
            loaded={loaded}
            error={error}
          />
        </ListPageBody>
        <SusanooTridentBackendConfigForm 
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
};

const SusanooTridentBackendConfigDetails: React.FC<SusanooTridentBackendConfigProps> = ({ application }) => {
    return (
        <SusanooTridentBackendConfig application={application} />
    );
}

export default SusanooTridentBackendConfigDetails;