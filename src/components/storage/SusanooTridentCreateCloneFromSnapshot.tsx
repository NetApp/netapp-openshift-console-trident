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

type SusanooTridentCloneFromSnapshotProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SusanooTridentVolumeSnapshotClassForm: React.FC<SusanooTridentCloneFromSnapshotProps> = ({ isOpen, onClose }) => {
  const [name, setName] = React.useState('trident-csi-snapshot');
  const [driver, setDriver] = React.useState('csi.trident.netapp.io');
  const [deletePolicy, setDeletePolicy] = React.useState('Delete');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      console.error('Required fields are missing');
      return;
    }

    const volumeSnapshotClass = {
      apiVersion: 'snapshot.storage.k8s.io/v1',
      kind: 'VolumeSnapshotClass',
      metadata: {
        name
      },
      driver: driver,
      deletionPolicy: deletePolicy,
    };

    try {
      await k8sCreate({
        model: {
          apiGroup: 'snapshot.storage.k8s.io',
          apiVersion: 'v1',
          kind: 'VolumeSnapshotClass',
          abbr: 'VSC',
          label: 'VolumeSnapshotClass',
          labelPlural: 'VolumeSnapshotClasses',
          plural: 'volumesnapshotclasses',
          namespaced: false,
        },
        data: volumeSnapshotClass,
      });
      console.log('Trident VolumeSnapshotClass created successfully');
      onClose();
    } catch (err) {
      console.error('Failed to create Trident VolumeSnapshotClass:', err);
    }
  };

  const handleCancel = () => {
    setName('trident');
    setDriver('csi.trident.netapp.io');
    setDeletePolicy('Delete');
    onClose();
  };

  return (
    <Modal
      variant="medium"
      title="Trident VolumeSnapshotClass"
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
        <FormGroup label="driver" fieldId="driver">
        <TextInput
            id="driver"
            value={driver}
            readOnlyVariant='default'
          />
        </FormGroup>
        <FormGroup label="Delete Policy" isRequired fieldId="deletepolicy">
          <FormSelect
            id="deletepolicy"
            value={deletePolicy}
            onChange={(_event, val) => setDeletePolicy(val)}
            isRequired
          >
            <FormSelectOption key="Delete" value="Delete" label="Delete" />
            <FormSelectOption key="Retain" value="Retain" label="Retain" />
          </FormSelect>
        </FormGroup>    
      </Form>
    </Modal>
  );
};

export default SusanooTridentVolumeSnapshotClassForm;