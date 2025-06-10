import * as React from 'react';
import { 
    Dropdown,
    DropdownItem,
    DropdownList,
    Label,
    MenuToggle,
    MenuToggleElement,
} from '@patternfly/react-core';
import { 
    RowProps, 
    TableData, 
    VirtualizedTable, 
    TableColumn, 
    useK8sWatchResource, 
    ResourceLink,
    ListPageFilter,
    useListPageFilter,
    RowFilter
} from '@openshift-console/dynamic-plugin-sdk';
import { 
    CustomizationResource 
} from 'src/k8s/types';
import { 
    useHistory 
} from 'react-router';
import { EllipsisVIcon } from '@patternfly/react-icons';

type SusanooVSTableProps = {
  data: CustomizationResource[];
  unfilteredData: CustomizationResource[];
  loaded: boolean;
  error?: Error;
};

const SusanooTable: React.FC<SusanooVSTableProps> = ({ data, unfilteredData, loaded, error }) => {  

  const columns: TableColumn<CustomizationResource>[] = [
    { title: 'VolumeSnapshot', id: 'snapshot', },
    { title: 'Status', id: 'status', },
    { title: 'Namespace', id: 'namespace', },
    { title: 'PersistentVolumeClaim', id: 'pvc', },
    { title: 'Creation at', id: 'creation', },
    { title: '', id: 'actions', },
  ];

  const SusanooTableRow: React.FC<RowProps<CustomizationResource>> = ({ obj, activeColumnIDs}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const history = useHistory();
            // dropdown to provide options to clone as a openshift volume and add the label opendatahub.io/dashboard: 'true' to present the PVC in odh 
    interface ResourceMetadata {
        name: string;
        namespace: string;
        labels?: { [key: string]: string };
    };

    interface BaseResource {
        apiVersion: string;
        kind: string;
        metadata: ResourceMetadata;
        spec: {
            accessModes: string[];
            storageClassName: string;
            resources: {
                requests: {
                    storage: string;
                };
            };
            dataSource: {
                name: string;
                kind: string;
                apiGroup: string;
            };
        };
    }

    return (
      <>
        <TableData id={columns[0].id} activeColumnIDs={activeColumnIDs} >
            <ResourceLink
                groupVersionKind={{
                    group: 'snapshot.storage.k8s.io',
                    version: 'v1',
                    kind: 'VolumeSnapshot',
                }}
                name={obj.metadata.name}
                namespace={obj.metadata.namespace}
            />
        </TableData>
        <TableData id={columns[1].id} activeColumnIDs={activeColumnIDs} >
            <Label color={obj.status?.readyToUse ? 'green' : 'red'} isCompact>
                {obj.status?.readyToUse ? 'Ready' : 'Not Ready'}
            </Label>
        </TableData>
        <TableData id={columns[2].id} activeColumnIDs={activeColumnIDs} >
          <ResourceLink
            groupVersionKind={{
              group: '',
              version: 'v1',
              kind: 'Project'
            }}
            name={obj.metadata.namespace}
            namespace={obj.metadata.namespace}
            />
        </TableData>           
        <TableData id={columns[3].id} activeColumnIDs={activeColumnIDs} >
            <ResourceLink
                groupVersionKind={{
                    group: '',
                    version: 'v1',
                    kind: 'PersistentVolumeClaim',
                }}
                name={obj.spec.source.persistentVolumeClaimName}
                namespace={obj.metadata.namespace}
            />
        </TableData>           
        <TableData id={columns[4].id} activeColumnIDs={activeColumnIDs}>
            {obj.metadata.creationTimestamp}
        </TableData> 
        <TableData id={columns[5].id} activeColumnIDs={activeColumnIDs} className="pf-u-text-align-center">
                <Dropdown
                    isOpen={isOpen}
                    onSelect={(_event, value) => {
                        const baseResource: BaseResource = {
                            apiVersion: 'v1',
                            kind: 'PersistentVolumeClaim',
                            metadata: {
                                name: `${obj.metadata.name}-clone`,
                                namespace: `${obj.metadata.namespace}`,
                                labels: {
                                    'susanoo.trident.netapp.io': 'true',
                                },
                            },
                            spec: {
                                accessModes: ['ReadWriteOnce'],
                                storageClassName: 'trident-fsx-nas',
                                resources: {
                                    requests: {
                                        storage: '1Gi',
                                    },
                                },
                                dataSource: {
                                    name: `${obj.metadata.name}`,
                                    kind: 'VolumeSnapshot',
                                    apiGroup: 'snapshot.storage.k8s.io',
                                },
                            },
                        };

                        if (value === 'openshiftai') {
                            baseResource.metadata.labels = {
                                'opendatahub.io/dashboard': 'true',
                                'susanoo.trident.netapp.io': 'true',
                            };
                        }

                        history.push({
                            pathname: '/susanoo-create-object',
                            state: { 
                                initialResource: baseResource
                            }
                        });
                        setIsOpen(false);
                    }}
                    onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                            ref={toggleRef}
                            aria-label="Clone options"
                            variant="plain"
                            onClick={() => setIsOpen(!isOpen)}
                            isExpanded={isOpen}
                        >
                            <EllipsisVIcon />
                        </MenuToggle>
                    )}
                >
                    <DropdownList>
                        <DropdownItem 
                            value="openshift"
                            key="openshift"
                        >
                            OpenShift Resource
                        </DropdownItem>
                        <DropdownItem 
                            value="openshiftai"
                            key="openshiftai"
                        >
                            OpenShift AI Resource
                        </DropdownItem>
                    </DropdownList>
                </Dropdown>
            </TableData>
      </>
    );
  };

  return (
        <VirtualizedTable<CustomizationResource>
            data={data}
            unfilteredData={unfilteredData}
            loaded={loaded}
            loadError={error}
            columns={columns}
            Row={SusanooTableRow}
        />
  )
};

export const filters: RowFilter[] = [
    {
      filterGroupName: 'Status',
      type: 'pvc-status',
      reducer: (pvc) => pvc.status?.phase || 'Unknown',
      filter: (input, pvc) => {
        if (input.selected?.length) {
          return input.selected.includes(pvc.status?.phase || 'Unknown');
        }
        return true;
      },
      items: [
        { id: 'Bound', title: 'Bound' },
        { id: 'Released', title: 'Released' },
        { id: 'Unknown', title: 'Unknown' }
      ],
    }
  ];

export const SusanooInternalDatasets: React.FC = () => {
    const resources = {
        group: 'snapshot.storage.k8s.io',
        version: 'v1',
        kind: 'VolumeSnapshot'
    };

    const [pvc, loaded, error] = useK8sWatchResource<CustomizationResource[]>({
        groupVersionKind: resources,
        isList: true,
        namespaced: true,
    });

    // const [isModalOpen, setIsModalOpen] = React.useState(false);
    // const handleModalToggle = () => {
    //     setIsModalOpen(!isModalOpen);
    // };       

    // const [helpContent, setHelpContent] = React.useState<string>('');
    // React.useEffect(() => {
    //     fetch(datasethelp)
    //     .then(res => {
    //         if (!res.ok) {
    //             throw new Error('Can not access file');
    //         }
    //         return res.text();
    //     })
    //     .then((data) => setHelpContent(data));
    // }, []);    

    const [data, filteredData, onFilterChange] = useListPageFilter(pvc, filters);    

    return (
        <>
            {/* <ListPageHeader title="Internal Datasets">
                <Button
                    variant="primary"
                    onClick={handleModalToggle}
                >
                    Help 
                </Button>
                <Modal
                    variant="large"
                    title="Importing a Dataset"
                    isOpen={isModalOpen}
                    onClose={handleModalToggle}
                    actions={[
                        <Button key="close" variant="primary" onClick={handleModalToggle}>
                            Close
                        </Button>
                    ]}
                >
                    <ReactMarkdown children={helpContent} />
                </Modal>
            </ListPageHeader> */}
                <ListPageFilter
                    data={data}
                    loaded={loaded}
                    rowFilters={filters}
                    onFilterChange={onFilterChange}
                    hideLabelFilter={true}
                />
                <SusanooTable
                    data={filteredData}
                    unfilteredData={data}
                    loaded={loaded}
                    error={error}
                />
        </>
    );
};

export default SusanooInternalDatasets;