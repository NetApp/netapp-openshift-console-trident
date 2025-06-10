import * as React from 'react';
import {
  Form,
  FormGroup,
  // TextInput,
  Button,
  Modal,
  // FormSelect,
  // FormSelectOption,
  Radio,
} from '@patternfly/react-core';

type SusanooImportPVCFormProps = {
  isOpen: boolean;
  onClose: () => void;
  pvc: { metadata: { name: string }} | null;
};

const SusanooImportPVCForm: React.FC<SusanooImportPVCFormProps> = ({ isOpen, onClose, pvc }) => {
  const [upperLayer, setUpperLayer] = React.useState<'OpenShift AI' | 'Developer Hub'>('OpenShift AI'); 

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
  

    // const pvc = {
    //   apiVersion: 'v1',
    //   kind: 'PersistentVolumeClaim',
    //   metadata: {
    //     labels: { 
    //       'susanoo.trident.netapp.io': 'true', 
    //     },
    //   },
    //   spec: {
    //       },
    //     },
    //   }
    // };

    // try {
    //   await k8sCreate({
    //     model: {
    //       apiVersion: 'v1',
    //       kind: 'PersistentVolumeClaim',
    //       abbr: 'PVC',
    //       label: 'PersistentVolumeClaim',
    //       labelPlural: 'PersistentVolumeClaims',
    //       plural: 'persistentvolumeclaims',
    //       namespaced: true,
    //     },
    //     data: pvc,
    //     ns: namespace
    //   });
    //   console.log('PersistentVolumeClaim created successfully');
    //   onClose();
    // } catch (err) {
    //   console.error('Failed to create PersistentVolumeClaim:', err);
    // }
  };

  const handleCancel = () => {
    setUpperLayer('OpenShift AI');
    onClose();
  };

  return (
    <Modal
      variant="medium"
      title={`Import ${pvc?.metadata?.name || "Unknown PVC"} to...`}
      isOpen={isOpen}
      onClose={handleCancel}
      actions={[
        <Button 
          key="import" 
          variant="primary" 
          onClick={handleSubmit}
          // isDisabled={!name || !namespace || !includedNamespaces.some(ns => ns.trim())}
        >
          Import
        </Button>,
        <Button key="cancel" variant="link" onClick={handleCancel}>
          Cancel
        </Button>
      ]}
    >
      <Form>
        <FormGroup label="Volume Mode" isRequired fieldId="volume-mode">
          <Radio
            id="upper-layer-openshift-ai"
            name="upper-layer"
            label="OpenShift AI"
            isChecked={upperLayer === 'OpenShift AI'}
            onChange={() => setUpperLayer('OpenShift AI')}
          />
          <Radio
            id="upper-layer-developer-hub"
            name="upper-layer"
            label="Developer Hub"
            isChecked={upperLayer === 'Developer Hub'}
            onChange={() => setUpperLayer('Developer Hub')}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default SusanooImportPVCForm;