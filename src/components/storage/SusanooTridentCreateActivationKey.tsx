import * as React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  Button,
  Modal,
} from '@patternfly/react-core';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

type ActivationKeyFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SusanooTridentActivationKey: React.FC<ActivationKeyFormProps> = ({ isOpen, onClose }) => {
  const [activationKey, setActivationKey] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationKey) {
      console.error('Activation key is required');
      return;
    }

    const secret: any = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: 'eap-activation-key',
        namespace: 'trident',
      },
      data: {
        activationKey: btoa(activationKey),
      },
    };

    try {
      await k8sCreate({
        model: {
          apiVersion: 'v1',
          kind: 'Secret',
          abbr: 'S',
          label: 'Secret',
          labelPlural: 'Secrets',
          plural: 'secrets',
          namespaced: true,
          crd: true
        },
        data: secret,
        ns: 'trident'
      });
      console.log('Activation key created successfully');
      onClose();
    } catch (err) {
      console.error('Failed to create activation key:', err);
    }
  };

  const handleCancel = () => {
    setActivationKey('');
    onClose();
  };

  return (
    <Modal
      variant="medium"
      title="Create Activation Key"
      isOpen={isOpen}
      onClose={handleCancel}
      actions={[
        <Button 
          key="activate" 
          variant="primary" 
          onClick={handleSubmit}
          isDisabled={!activationKey}
        >
          Activate
        </Button>,
        <Button key="cancel" variant="link" onClick={handleCancel}>
          Cancel
        </Button>
      ]}
    >
      <Form>
        <FormGroup label="Activation Key" isRequired fieldId="activation-key">
          <TextInput
            id="activation-key"
            value={activationKey}
            onChange={(_event, val) => setActivationKey(val)}
            isRequired
            type="password"
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default SusanooTridentActivationKey;