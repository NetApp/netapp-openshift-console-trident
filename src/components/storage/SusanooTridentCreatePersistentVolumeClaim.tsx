import * as React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  Button,
  Modal,
  FormSelect,
  FormSelectOption,
  Radio,
} from '@patternfly/react-core';
import { k8sCreate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { CustomizationResource } from 'src/k8s/types';

type SusanooTridentPVCFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ApplicationForm: React.FC<SusanooTridentPVCFormProps> = ({ isOpen, onClose }) => {
  const [name, setName] = React.useState('');
  const [namespace, setNamespace] = React.useState('');
  const [includedNamespaces, setIncludedNamespaces] = React.useState(['']);
  const [storage, setStorage] = React.useState('1Gi');
  const [storageClassName, setStorageClass] = React.useState('ontap-nas');
  const [accessModes, setAccessModes] = React.useState<string>('ReadWriteOnce');
  const [volumeMode, setVolumeMode] = React.useState<'Filesystem' | 'Block'>('Filesystem'); 
  const [includeStorageClass, setIncludeStorageClass] = React.useState(['']);

  const namespaceResource = {
    kind: 'Namespace',
    isList: true,
  };

  const [namespaces, namespacesLoaded] = useK8sWatchResource<CustomizationResource[]>(namespaceResource);
  const namespaceOptions = React.useMemo(() => 
    Array.isArray(namespaces) ? namespaces.map(ns => ns.metadata?.name || '') : [], 
    [namespaces]
  );

  const getFilteredNameSpaceOptions = (filter: string) => {
    return namespaceOptions.filter(namespace => 
      namespace.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const storageClassResource = {
    kind: 'StorageClass',
    isList: true,
  };

  const [storageclasses, storageclassesLoaded] = useK8sWatchResource<CustomizationResource[]>(storageClassResource);

  const storageclassesOptions = React.useMemo(() => 
    Array.isArray(storageclasses) ? storageclasses.map(stc => stc.metadata?.name || '') : [], 
    [storageclasses]
  );

  const getFilteredStorageClassOptions = (filter: string) => {
    return storageclassesOptions.filter(storageclassesOptions => 
      storageclassesOptions.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !namespace ) {
      console.error('Required fields are missing');
      return;
    }

    const pvc = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: {
        name,
        namespace,
        labels: { 
          'susanoo.trident.netapp.io': 'true', 
        },
      },
      spec: {
        storageClassName,
        volumeMode,
        accessModes: [accessModes],
        resources: {
          requests: {
            storage,
          },
        },
      }
    };

    try {
      await k8sCreate({
        model: {
          apiVersion: 'v1',
          kind: 'PersistentVolumeClaim',
          abbr: 'PVC',
          label: 'PersistentVolumeClaim',
          labelPlural: 'PersistentVolumeClaims',
          plural: 'persistentvolumeclaims',
          namespaced: true,
        },
        data: pvc,
        ns: namespace
      });
      console.log('PersistentVolumeClaim created successfully');
      onClose();
    } catch (err) {
      console.error('Failed to create PersistentVolumeClaim:', err);
    }
  };

  const handleCancel = () => {
    setName('');
    setNamespace('');
    setIncludedNamespaces(['']);
    setStorage('1Gi');
    setStorageClass('');
    setIncludeStorageClass(['']);
    setAccessModes('ReadWriteOnce');
    setVolumeMode('Filesystem');
    onClose();
  };

  const handleNamespaceChange = (event: React.FormEvent<HTMLSelectElement>) => {
    const selectedNamespace = event.currentTarget.value;
    setNamespace(selectedNamespace);
    setIncludedNamespaces([selectedNamespace, ...includedNamespaces.slice(1)]);
  };

  const handleStorageClassChange = (event: React.FormEvent<HTMLSelectElement>) => {
    const selectedStorageClass = event.currentTarget.value;
    setStorageClass(selectedStorageClass);
    setIncludeStorageClass([selectedStorageClass, ...includeStorageClass.slice(1)]);
  };

  return (
    <Modal
      variant="medium"
      title="Create an PersistentVolumeClaim"
      isOpen={isOpen}
      onClose={handleCancel}
      actions={[
        <Button 
          key="create" 
          variant="primary" 
          onClick={handleSubmit}
          isDisabled={!name || !namespace || !includedNamespaces.some(ns => ns.trim())}
        >
          Create
        </Button>,
        <Button key="cancel" variant="link" onClick={handleCancel}>
          Cancel
        </Button>
      ]}
    >
      <Form>
        <FormGroup label="Select StorageClass" isRequired fieldId="stc-storageclass">
          <FormSelect
            id="storageclass-select"
            value={storageClassName}
            onChange={handleStorageClassChange}
            isDisabled={!storageclassesLoaded} 
          >
            <FormSelectOption key="placeholder" value="" label="Select StorageClass" isPlaceholder />
            {getFilteredStorageClassOptions('').map((storageclass) => (
              <FormSelectOption key={storageclass} value={storageclass} label={storageclass} />
            ))}
          </FormSelect>
        </FormGroup>         
        <FormGroup label="Select Namespace" isRequired fieldId="stc-namespace">
          <FormSelect
            id="namespace-select"
            value={namespace}
            onChange={handleNamespaceChange}
            isDisabled={!namespacesLoaded}
          >
            <FormSelectOption key="placeholder" value="" label="Select namespace" isPlaceholder />
            {getFilteredNameSpaceOptions('').map((namespace) => (
              <FormSelectOption key={namespace} value={namespace} label={namespace} />
            ))}
          </FormSelect>
        </FormGroup>        
        <FormGroup label="Name" isRequired fieldId="stc-name">
          <TextInput
            id="stc-name"
            value={name}
            onChange={(_event, val) => setName(val)}
            isRequired
          />
        </FormGroup>
        <FormGroup label="Size" isRequired fieldId="stc-size">
          <TextInput
            id="stc-size"
            value={storage}
            onChange={(_event, val) => setStorage(val)}
            isRequired
          />
        </FormGroup>
        <FormGroup label="Access Modes" isRequired fieldId="access-modes">
          <FormSelect
            id="access-modes-select"
            value={accessModes}
            onChange={(event) => setAccessModes(event.currentTarget.value)}
          >
            <FormSelectOption value="ReadWriteOnce" label="ReadWriteOnce" />
            <FormSelectOption value="ReadWriteMany" label="ReadWriteMany" />
            <FormSelectOption value="ReadWriteOncePod" label="ReadWriteOncePod" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Volume Mode" isRequired fieldId="volume-mode">
          <Radio
            id="volume-mode-filesystem"
            name="volume-mode"
            label="Filesystem"
            isChecked={volumeMode === 'Filesystem'}
            onChange={() => setVolumeMode('Filesystem')}
          />
          <Radio
            id="volume-mode-block"
            name="volume-mode"
            label="Block"
            isChecked={volumeMode === 'Block'}
            onChange={() => setVolumeMode('Block')}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default ApplicationForm;