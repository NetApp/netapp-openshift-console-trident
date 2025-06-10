import * as React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  Button,
  Modal,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

type SusanooTridentStorageClassProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SusanooTridentStorageClassForm: React.FC<SusanooTridentStorageClassProps> = ({ isOpen, onClose }) => {
  const [name, setName] = React.useState('trident-nas');
  const [backendType, setBackendType] = React.useState('ontap-nas');
  const [clones, setClones] = React.useState('true');
  const [snapshots, setSnapshots] = React.useState('true');
  const [fstype, setFstype] = React.useState('ext4');
  const [reclaimPolicy, setReclaimPolicy] = React.useState('Delete');
  const [allowVolumeExpansion, setAllowVolumeExpansion] = React.useState('true');
  const [volumeBindingMode, setVolumeBindingMode] = React.useState('Immediate');
  const [provisioner, setProvisioner] = React.useState('csi.trident.netapp.io');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      console.error('Required fields are missing');
      return;
    }

    const storageClass = {
      apiVersion: 'storage.k8s.io/v1',
      kind: 'StorageClass',
      metadata: {
        name
      },
      parameters: {
        backendType: backendType,
        clones: clones,
        snapshots: snapshots,
        fstype: fstype,
      },
      reclaimPolicy: reclaimPolicy,
      allowVolumeExpansion: allowVolumeExpansion === 'true',
      volumeBindingMode: volumeBindingMode,
      provisioner: provisioner,
    };

    try {
      await k8sCreate({
        model: {
          apiGroup: 'storage.k8s.io',
          apiVersion: 'v1',
          kind: 'StorageClass',
          abbr: 'SC',
          label: 'StorageClass',
          labelPlural: 'StorageClasses',
          plural: 'storageclasses',
          namespaced: false,
        },
        data: storageClass,
      });
      console.log('StorageClass with Trident created successfully');
      onClose();
    } catch (err) {
      console.error('Failed to create StorageClass with Trident:', err);
    }
  };

  const handleCancel = () => {
    setName('trident-nas');
    setBackendType('ontap-nas');
    setClones('true');
    setSnapshots('true');
    setFstype('ext4');
    setReclaimPolicy('Delete');
    setAllowVolumeExpansion('true');
    setVolumeBindingMode('Immediate');
    setProvisioner('csi.trident.netapp.io');
    onClose();
  };

  return (
    <Modal
      variant="medium"
      title="Create StorageClass"
      aria-label="Create StorageClass"
      isOpen={isOpen}
      onClose={handleCancel}
      actions={[
        <Button 
          key="create" 
          variant="primary" 
          onClick={handleSubmit}
          isDisabled={!name}
        >
          Create
        </Button>,
        <Button key="cancel" variant="link" onClick={handleCancel}>
          Cancel
        </Button>
      ]}
    >
      <Form>
        <FormGroup label="Name" isRequired fieldId="app-name">
          <TextInput
            id="app-name"
            value={name}
            onChange={(_event, val) => setName(val)}
            isRequired
          />
        </FormGroup>
        <FormGroup label="provisioner" fieldId="provisioner">
        <TextInput
            id="provisioner"
            value={provisioner}
            readOnlyVariant='default'
          />
        </FormGroup>
        <FormGroup label="Backend Type" isRequired fieldId="backendtype">
          <FormSelect
            id="backendType"
            value={backendType}
            onChange={(_event, val) => setBackendType(val)}
            isRequired
          >
            <FormSelectOption key="ontap-nas" value="ontap-nas" label="ontap-nas" />  
            <FormSelectOption key="ontap-nas-economy" value="ontap-nas-economy" label="ontap-nas-economy" />            
            <FormSelectOption key="ontap-nas-flexgroup" value="ontap-nas-flexgroup" label="ontap-nas-flexgroup" />            
            <FormSelectOption key="ontap-san" value="ontap-san" label="ontap-san" />            
            <FormSelectOption key="ontap-san-economy" value="ontap-san-economy" label="ontap-san-economy" />            
            <FormSelectOption key="azure-netapp-files" value="azure-netapp-files" label="azure-netapp-files" isDisabled />
            <FormSelectOption key="google-cloud-netapp-volumes" value="google-cloud-netapp-volumes" label="google-cloud-netapp-volumes" isDisabled />
            <FormSelectOption key="gcp-cvs" value="gcp-cvs" label="gcp-cvs" isDisabled />
            <FormSelectOption key="solidfire-san" value="solidfire-san" label="solidfire-san" isDisabled />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Clone" isRequired fieldId="clone">
          <FormSelect
            id="clone"
            value={clones}
            onChange={(_event, val) => setClones(val)}
            isRequired
          >
            <FormSelectOption key="false" value="false" label="False" />
            <FormSelectOption key="true" value="true" label="True" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Snapshots" isRequired fieldId="snapshots">
          <FormSelect
            id="snapshots"
            value={snapshots}
            onChange={(_event, val) => setSnapshots(val)}
            isRequired
          >
            <FormSelectOption key="false" value="false" label="False" />
            <FormSelectOption key="true" value="true" label="True" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Filesystem Type" isRequired fieldId="fstype">
          <TextInput
            id="fstype"
            value={fstype}
            onChange={(_event, val) => setFstype(val)}
            isRequired
          />
        </FormGroup>
        <FormGroup label="Reclaim Policy" isRequired fieldId="reclaimpolicy">
          <FormSelect
            id="reclaimpolicy"
            value={reclaimPolicy}
            onChange={(_event, val) => setReclaimPolicy(val)}
            isRequired
          >
            <FormSelectOption key="Delete" value="Delete" label="Delete" />
            <FormSelectOption key="Retain" value="Retain" label="Retain" />
          </FormSelect>
        </FormGroup>        
        <FormGroup label="Allow Volume Expansion" isRequired fieldId="allowVolumeExpansion">
          <FormSelect
            id="allowVolumeExpansion"
            value={allowVolumeExpansion}
            onChange={(_event, val) => setAllowVolumeExpansion(val)}
            isRequired
          >
            <FormSelectOption key="false" value="false" label="False" />
            <FormSelectOption key="true" value="true" label="True" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Volume Binding Mode" isRequired fieldId="volumeBindingMode">
          <FormSelect
            id="volumeBindingMode"
            value={volumeBindingMode}
            onChange={(_event, val) => setVolumeBindingMode(val)}
            isRequired
          >
            <FormSelectOption key="Immediate" value="Immediate" label="Immediate" />
            <FormSelectOption key="WaitForFirstConsumer" value="WaitForFirstConsumer" label="WaitForFirstConsumer" />
          </FormSelect>
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default SusanooTridentStorageClassForm;