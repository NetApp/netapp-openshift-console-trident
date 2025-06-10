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

type SusanooTridentOrchestratorProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SusanooTridentOrchestratorForm: React.FC<SusanooTridentOrchestratorProps> = ({ isOpen, onClose }) => {
  const [name, setName] = React.useState('trident');
  const [ipv6, setIpv6] = React.useState('false');
  const [debug, setDebug] = React.useState('true');
  const [enableNodePrep, setEnableNodePrep] = React.useState('false');
  // const [imagePullSecret, setImagePullSecret] = React.useState('');
  // const [imageRegistry, setImageRegistry] = React.useState('');
  const [k8sTimeout, setK8sTimeout] = React.useState('30');
  const [kubeletDir, setKubeletDir] = React.useState('/var/lib/kubelet');
  const [namespace, setNamespace] = React.useState('trident');
  const [silenceAutosupport, setSilenceAutosupport] = React.useState('false');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !namespace) {
      console.error('Required fields are missing');
      return;
    }

    const orchestrator = {
      apiVersion: 'trident.netapp.io/v1',
      kind: 'TridentOrchestrator',
      metadata: {
        name
      },
      spec: {
        ipv6: ipv6 === 'true',
        debug: debug === 'true',
        enableNodePrep: enableNodePrep === 'true',
        k8sTimeout: Number(k8sTimeout),
        kubeletDir,
        namespace,
        silenceAutosupport: silenceAutosupport === 'true'
      }
    };

    try {
      await k8sCreate({
        model: {
          apiGroup: 'trident.netapp.io',
          apiVersion: 'v1',
          kind: 'TridentOrchestrator',
          abbr: 'TO',
          label: 'TridentOrchestrator',
          labelPlural: 'TridentOrchestrators',
          plural: 'tridentorchestrators',
          namespaced: false,
          crd: true,
        },
        data: orchestrator,
      });
      console.log('Trident Orchestrator created successfully');
      onClose();
    } catch (err) {
      console.error('Failed to create Trident Orchestrator:', err);
    }
  };

  const handleCancel = () => {
    setName('trident');
    setIpv6('false');
    setDebug('true');
    setEnableNodePrep('false');
    // setImagePullSecret('');
    // setImageRegistry('');
    setK8sTimeout('30');
    setKubeletDir('/var/lib/kubelet');
    setNamespace('trident');
    setSilenceAutosupport('false');
    onClose();
  };

  return (
    <Modal
      variant="medium"
      title="Trident Orchestrator"
      isOpen={isOpen}
      onClose={handleCancel}
      actions={[
        <Button 
          key="create" 
          variant="primary" 
          onClick={handleSubmit}
          isDisabled={!name || !namespace}
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
        <FormGroup label="IPv6" isRequired fieldId="ipv6">
          <FormSelect
            id="ipv6"
            value={ipv6}
            onChange={(_event, val) => setIpv6(val)}
            isRequired
          >
            <FormSelectOption key="false" value="false" label="False" />
            <FormSelectOption key="true" value="true" label="True" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Debug" isRequired fieldId="debug">
          <FormSelect
            id="debug"
            value={debug}
            onChange={(_event, val) => setDebug(val)}
            isRequired
          >
            <FormSelectOption key="false" value="false" label="False" />
            <FormSelectOption key="true" value="true" label="True" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Enable Node Prep" isRequired fieldId="enable-node-prep">
          <FormSelect
            id="enable-node-prep"
            value={enableNodePrep}
            onChange={(_event, val) => setEnableNodePrep(val)}
            isRequired
          >
            <FormSelectOption key="false" value="false" label="False" />
            <FormSelectOption key="true" value="true" label="True" />
          </FormSelect>
        </FormGroup>
        {/* <FormGroup label="Image Pull Secret" fieldId="image-pull-secret">
          <TextInput
            id="image-pull-secret"
            value={imagePullSecret}
            onChange={(_event, val) => setImagePullSecret(val)}
          />
        </FormGroup>
        <FormGroup label="Image Registry" fieldId="image-registry">
          <TextInput
            id="image-registry"
            value={imageRegistry}
            onChange={(_event, val) => setImageRegistry(val)}
          />
        </FormGroup> */}
        <FormGroup label="K8s Timeout" isRequired fieldId="k8s-timeout">
          <TextInput
            id="k8s-timeout"
            value={k8sTimeout}
            onChange={(_event, val) => setK8sTimeout(val)}
            isRequired
          />
        </FormGroup>
        <FormGroup label="Kubelet Directory" isRequired fieldId="kubeletdir">
          <TextInput
            id="kubeletdir"
            value={kubeletDir}
            readOnlyVariant='default'
            isRequired
          />
        </FormGroup>
        <FormGroup label="Namespace" isRequired fieldId="namespace">
          <TextInput
            id="namespace"
            value={namespace}
            onChange={(_event, val) => setNamespace(val)}
            isRequired
          />
        </FormGroup>
        <FormGroup label="Silence Autosupport" isRequired fieldId="silence-autosupport">
          <FormSelect
            id="silence-autosupport"
            value={silenceAutosupport}
            onChange={(_event, val) => setSilenceAutosupport(val)}
            isRequired
          >
            <FormSelectOption key="false" value="false" label="False" />
            <FormSelectOption key="true" value="true" label="True" />
          </FormSelect>
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default SusanooTridentOrchestratorForm;