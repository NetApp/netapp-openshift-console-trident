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

type SusanooTridentBackendConfigProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SusanooTridentBackendConfigForm: React.FC<SusanooTridentBackendConfigProps> = ({ isOpen, onClose }) => {
  const [storageDriverName, setStorageDriverName] = React.useState('ontap-nas');
  const [name, setName] = React.useState('backend-ontap-nas');
  const [namespace, setNamespace] = React.useState('trident');
  const [version, setVersion] = React.useState(1);
  const [backendName, setBackendName] = React.useState('ontap-nas');
  const [managementLIF, setManagementLIF] = React.useState('10.0.0.123');
  const [dataLIF, setDataLIF] = React.useState('10.0.0.123');
  const [svm, setSvm] = React.useState('svm');
  const [credentials, setCredentials] = React.useState('ontap-nas-creds');

  // Azure specific fields
  const [azureSubscriptionID, setAzureSubscriptionID] = React.useState('68e4f836-edc1-fake-bff9-b2d865ee56cf');
  const [azureTenantID, setAzureTenantID] = React.useState('68e4f836-edc1-fake-bff9-b2d865ee56cf');
  const [azureClientID, setAzureClientID] = React.useState('68e4f836-edc1-fake-bff9-b2d865ee56cf');
  const [azureClientSecret, setAzureClientSecret] = React.useState('myClientSecret');
  const [azureLocation, setAzureLocation] = React.useState('eastus');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storageDriverName || !name || !namespace) {
      console.error('Required fields are missing');
      return;
    }

    const orchestrator = {
      apiVersion: 'trident.netapp.io/v1',
      kind: 'TridentBackendConfig',
      metadata: {
        name,
        namespace,
      },
      spec: {
        version,
        backendName,
        storageDriverName,
        managementLIF,
        dataLIF,
        svm,
        azureSubscriptionID,
        azureTenantID,
        azureClientID,
        azureClientSecret,
        azureLocation,
        credentials: {
          name: credentials,
        },
      }
    };

    try {
      await k8sCreate({
        model: {
          apiGroup: 'trident.netapp.io',
          apiVersion: 'v1',
          kind: 'TridentBackendConfig',
          abbr: 'TBC',
          label: 'TridentBackendConfig',
          labelPlural: 'TridentBackendConfigs',
          plural: 'tridentbackendconfigs',
          namespaced: true,
          crd: true,
        },
        data: orchestrator,
        ns: namespace,
      });
      console.log('Trident BackendConfig created successfully');
      onClose();
    } catch (err) {
      console.error('Failed to create Trident BackendConfig:', err);
    }
  };

  const handleCancel = () => {
    setName('backend-ontap-nas');
    setNamespace('trident');
    setVersion(1);
    setStorageDriverName('ontap-nas');
    setBackendName('ontap-nas');
    setManagementLIF('10.0.0.123');
    setDataLIF('10.0.0.123');
    setSvm('svm');
    setCredentials('ontap-nas-creds');

    // Azure specific fields
    setAzureSubscriptionID('68e4f836-edc1-fake-bff9-b2d865ee56cf');
    setAzureTenantID('68e4f836-edc1-fake-bff9-b2d865ee56cf');
    setAzureClientID('68e4f836-edc1-fake-bff9-b2d865ee56cf');
    setAzureClientSecret('myClientSecret');
    setAzureLocation('eastus');
    onClose();
  };

  return (
    <Modal
      variant="medium"
      title="Trident BackendConfig"
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
      <FormGroup label="storageDriverName" isRequired fieldId="storageDriverName">
          <FormSelect
            id="storageDriverName"
            value={storageDriverName}
            onChange={(_event, val) => setStorageDriverName(val)}
            isRequired
          >
            <FormSelectOption key="ontap-nas" value="ontap-nas" label="ONTAP NAS (ONTAP NAS storage for NFS and SMB)" />                   
            <FormSelectOption key="ontap-san" value="ontap-san" label="ONTAP SAN (for FC, iSCSI, NVMe/TCP)" />                       
            <FormSelectOption key="azure-netapp-files" value="azure-netapp-files" label="Azure Netapp-Files (for both NFS and SMB)" />
            <FormSelectOption key="ontap-nas-economy" value="ontap-nas-economy" label="ONTAP NAS Economy (only use for high counts of volumes for NFS and SMB - no protection or mobility possible)" isDisabled />
            <FormSelectOption key="ontap-nas-flexgroup" value="ontap-nas-flexgroup" label="ontap-nas-flexgroup" isDisabled />   
            <FormSelectOption key="ontap-san-economy" value="ontap-san-economy" label="ONTAP SAN Economy (only use for high counts of volumes for FC, iSCSI, NVMe/TCP - no protection or mobility possible)" isDisabled /> 
            <FormSelectOption key="google-cloud-netapp-volumes" value="google-cloud-netapp-volumes" label="Google Cloud NetApp Volumes (for both NFS and SMB)" isDisabled />
            <FormSelectOption key="gcp-cvs" value="gcp-cvs" label="Cloud Volumes Services for Google Cloud (for NFS only)" isDisabled />
            <FormSelectOption key="solidfire-san" value="solidfire-san" label="NetApp HCI & SolidFire (block and file)" isDisabled />
          </FormSelect>
        </FormGroup>
        <FormGroup label="name" isRequired fieldId="name">
          <TextInput
            id="name"
            value={name}
            onChange={(_event, val) => setName(val)}
            isRequired
          />
        </FormGroup>
        <FormGroup label="namespace" isRequired fieldId="namespace">
          <TextInput
            id="namespace"
            value={namespace}
            onChange={(_event, val) => setNamespace(val)}
            isRequired
          />
        </FormGroup>
        {storageDriverName !== 'azure-netapp-files' && (
          <FormGroup label="backendName" isRequired fieldId="backendName">
            <TextInput
              id="backendName"
              value={backendName}
              onChange={(_event, val) => setBackendName(val)}
              isRequired
            />
          </FormGroup>
        )}
        {storageDriverName !== 'azure-netapp-files' && (
          <FormGroup label="managementLIF" isRequired fieldId="managementLIF">
            <TextInput
              id="managementLIF"
              value={managementLIF}
              onChange={(_event, val) => setManagementLIF(val)}
              isRequired
            />
          </FormGroup>
        )}
        {storageDriverName !== 'azure-netapp-files' && storageDriverName !== 'ontap-san' && (
          <FormGroup label="dataLIF (optional)" fieldId="dataLIF">
            <TextInput
              id="dataLIF"
              value={dataLIF}
              onChange={(_event, val) => setDataLIF(val)}
              isRequired
            />
          </FormGroup>
        )}
        {storageDriverName !== 'azure-netapp-files' && (
          <>
          <FormGroup label="svm" isRequired fieldId="svm">
            <TextInput
              id="svm"
              value={svm}
              onChange={(_event, val) => setSvm(val)}
              isRequired
            />
          </FormGroup>
          <FormGroup label="credentials" isRequired fieldId="credentials">
          <TextInput
            id="credentials"
            value={credentials}
            onChange={(_event, val) => setCredentials(val)}
            isRequired
          />
        </FormGroup>
          </>          
        )}
        {storageDriverName === 'azure-netapp-files' && (  
          <>
          <FormGroup label="azureSubscriptionID" isRequired fieldId="azureSubscriptionID">
            <TextInput
              id="azureSubscriptionID"
              value={azureSubscriptionID}
              onChange={(_event, val) => setAzureSubscriptionID(val)}
              isRequired
            />
          </FormGroup> 
          <FormGroup label="azureTenantID" isRequired fieldId="azureTenantID">
            <TextInput
              id="azureTenantID"
              value={azureTenantID}
              onChange={(_event, val) => setAzureTenantID(val)}
              isRequired
            />
          </FormGroup>
          <FormGroup label="azureClientID" isRequired fieldId="azureClientID">
            <TextInput
              id="azureClientID"
              value={azureClientID}
              onChange={(_event, val) => setAzureClientID(val)}
              isRequired
            />
          </FormGroup>
          <FormGroup label="azureClientSecret" isRequired fieldId="azureClientSecret">
            <TextInput
              id="azureClientSecret"
              value={azureClientSecret}
              onChange={(_event, val) => setAzureClientSecret(val)}
              isRequired
            />
          </FormGroup>
          <FormGroup label="azureLocation" isRequired fieldId="azureLocation">
            <TextInput
              id="azureLocation"
              value={azureLocation}
              onChange={(_event, val) => setAzureLocation(val)}
              isRequired
            />
          </FormGroup>
          </>
        )}        
      </Form>
    </Modal>
  );
};

export default SusanooTridentBackendConfigForm;