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
import { Button, Divider, Dropdown, DropdownItem, DropdownList, MenuToggle, MenuToggleElement, Modal } from '@patternfly/react-core';
import SusanooTridentOperatorForm from './SusanooTridentCreateOperator';
import { useHistory } from 'react-router';

type SusanooTridentOperatorProps = {
  application: string;
};

const SusanooTridentOperator: React.FC<SusanooTridentOperatorProps> = ({ application }) => {
  
    const columns: TableColumn<CustomizationResource>[] = [
      { title: 'Name', id: 'name' },
      { title: 'Channel', id: 'channel' },
      { title: 'Install plan', id: 'installPlan' },
      { title: 'Current version', id: 'currentVersion' },
      { title: '', id: 'actions' }
    ];
  
    const SusanooTableRow: React.FC<RowProps<CustomizationResource>> = ({ obj, activeColumnIDs}) => {

        const [isActionOpen, setIsActionOpen] = React.useState(false);      
        const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
        const [resourceToDelete, setResourceToDelete] = React.useState<CustomizationResource | null>(null);
        const history = useHistory();

        const [k8sModel] = useK8sModel(getGroupVersionKindForResource(obj));
        
        const handleDelete = async () => {
          if (resourceToDelete) {
            try {
              await k8sDelete({ model: k8sModel, resource: resourceToDelete });
              console.log('Trident Operator deleted successfully');
            } catch (err) {
              console.error('Failed to delete Trident Operator:', err);
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
              {obj.spec?.channel}
            </TableData>
            <TableData id={columns[2].id} activeColumnIDs={activeColumnIDs}>
              {obj.spec?.installPlanApproval}
            </TableData>
            <TableData id={columns[3].id} activeColumnIDs={activeColumnIDs}>
              {obj.status?.currentCSV}
            </TableData>  
            <TableData id={columns[4].id} activeColumnIDs={activeColumnIDs} className="pf-u-text-align-center">
              <Dropdown
                isOpen={isActionOpen}
                onSelect={(_event, value) => {
                  if (value === 'pods') {
                    history.push(`/k8s/ns/${obj.spec.namespace}/core~v1~Pod`);
                  } else if (value === 'delete') {
                    confirmDelete(obj);
                  }
                  setIsActionOpen(false);
                }}
                onOpenChange={(isActionOpen: boolean) => setIsActionOpen(isActionOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    aria-label="operator-actions"
                    onClick={() => setIsActionOpen(!isActionOpen)}
                    isExpanded={isActionOpen}
                  >
                    Actions
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem value="pods" key="pods">Operator Pods</DropdownItem>
                  <Divider component="li" key="separator" />
                  <DropdownItem value="delete" key="delete">Delete</DropdownItem>
                </DropdownList>
              </Dropdown>
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
              Are you sure you want to delete this Trident Operator?
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
              aria-label='Trident Operator'
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
      group: 'operators.coreos.com',
      version: 'v1alpha1',
      kind: 'Subscription',
    };
  
    const [data, loaded, error] = useK8sWatchResource<CustomizationResource[]>({
      groupVersionKind: resources,
      isList: true,
      namespaced: true,
    });
    
    const operator = 'trident-operator';
    const isOperatorPresent = data.some(row => (row.metadata.name === operator));
    const [isOpen, setIsOpen] = React.useState(false);
  
    return (
      <>
        <ListPageHeader title="Trident Operator">
          <Button 
            variant="primary"
            onClick={() => {setIsOpen(true);}}
            isDisabled={isOperatorPresent}
          >
            Create
          </Button>
        </ListPageHeader>
        <ListPageBody>
          <CustomizationTable 
            data={data.filter((item => item.metadata.name === operator))}
            unfilteredData={data}
            loaded={loaded}
            error={error}
          />
        </ListPageBody>
        <SusanooTridentOperatorForm 
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
};

const SusanooTridentOperatorDetails: React.FC<SusanooTridentOperatorProps> = ({ application }) => {
    return (
        <SusanooTridentOperator application={application} />
    );
}

export default SusanooTridentOperatorDetails;