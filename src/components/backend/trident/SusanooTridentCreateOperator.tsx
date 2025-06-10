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
import { 
    k8sCreate, 
    useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { CustomizationResource } from 'src/k8s/types';

type SusanooTridentOperatorFormProps = {
    isOpen: boolean;
    onClose: () => void;
};

const SusanooTridentOperatorForm: React.FC<SusanooTridentOperatorFormProps> = ({ isOpen, onClose }) => {
    const [name, setName] = React.useState('trident-operator');
    const [namespace, setNamespace] = React.useState('openshift-operators');
    const [channel, setChannel] = React.useState('stable');
    const [installPlanApproval, setInstallPlanApproval] = React.useState('Automatic');
    const [source, setSource] = React.useState('community-operators');
    const [sourceNamespace, setSourceNamespace] = React.useState('openshift-marketplace');
    const [startingCSV, setStartingCSV] = React.useState('trident-operator.v25.2.1');
    const [csvOptions, setCsvOptions] = React.useState<string[]>([]);

    const packageManifestResource = {
        groupVersionKind: {
            group: 'packages.operators.coreos.com',
            version: 'v1',
            kind: 'PackageManifest',
        },
        name: 'trident-operator',
        namespace: 'openshift-marketplace',
    };

    const [packageManifest, packageManifestLoaded, packageManifestError] = useK8sWatchResource<CustomizationResource>(packageManifestResource);

    React.useEffect(() => {
        if (packageManifestLoaded && !packageManifestError && packageManifest?.status?.channels) {
            const stableChannel = packageManifest.status.channels.find((channel: any) => channel.name === 'stable');
            if (stableChannel) {
                const entries = stableChannel.entries.map((entry: any) => entry.name);
                setCsvOptions(entries);
                setStartingCSV(entries[0]);
            }
        }
    }, [packageManifest, packageManifestLoaded, packageManifestError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !namespace || !channel || !installPlanApproval || !source || !sourceNamespace || !startingCSV) {
            console.error('Required fields are missing');
            return;
        }

        const subscription = {
            apiVersion: 'operators.coreos.com/v1alpha1',
            kind: 'Subscription',
            metadata: {
                name,
                namespace,
            },
            spec: {
                channel,
                installPlanApproval,
                name,
                source,
                sourceNamespace,
                startingCSV,
            }
        };

        try {
            await k8sCreate({
                model: {
                    apiGroup: 'operators.coreos.com',
                    apiVersion: 'v1alpha1',
                    kind: 'Subscription',
                    abbr: 'SUB',
                    label: 'Subscription',
                    labelPlural: 'Subscriptions',
                    plural: 'subscriptions',
                    namespaced: true,
                    crd: true
                },
                data: subscription,
                ns: namespace
            });
            console.log('Trident Subscription created successfully');
            onClose();
        } catch (err) {
            console.error('Failed to create Trident Subscription:', err);
        }
    };

    const handleCancel = () => {
        setName('trident-operator');
        setNamespace('openshift-operators');
        setChannel('stable');
        setInstallPlanApproval('Automatic');
        setSource('community-operators');
        setSourceNamespace('openshift-marketplace');
        setStartingCSV('trident-operator.v25.2.1');
        onClose();
    };

    return (
        <Modal
            variant="medium"
            title="Trident Operator"
            isOpen={isOpen}
            onClose={handleCancel}
            actions={[
                <Button 
                    key="install" 
                    variant="primary" 
                    onClick={handleSubmit}
                    isDisabled={!name || !namespace || !channel || !installPlanApproval || !source || !sourceNamespace || !startingCSV}
                >
                    Install
                </Button>,
                <Button key="cancel" variant="link" onClick={handleCancel}>
                    Cancel
                </Button>
            ]}
        >
            <Form>
                <FormGroup label="Subscription Name" isRequired fieldId="subscription-name">
                    <TextInput
                        id="subscription-name"
                        value={name}
                        onChange={(_event, val) => setName(val)}
                        isRequired
                    />
                </FormGroup>
                <FormGroup label="Namespace" fieldId="namespace">
                    <TextInput
                        id="namespace"
                        value={namespace}
                        readOnlyVariant='default'
                    />
                </FormGroup>
                <FormGroup label="Channel" isRequired fieldId="channel">
                    <TextInput
                        id="channel"
                        value={channel}
                        readOnlyVariant='default'
                    />
                </FormGroup>
                <FormGroup label="Install Plan Approval" isRequired fieldId="install-plan-approval">
                    <FormSelect
                        id="install-plan-approval"
                        value={installPlanApproval}
                        onChange={(_event, val) => setInstallPlanApproval(val)}
                        isRequired
                    >
                        <FormSelectOption key="Automatic" value="Automatic" label="Automatic" />
                        <FormSelectOption key="Manual" value="Manual" label="Manual (requires manual approval in Installed Operators!)" />
                    </FormSelect>
                </FormGroup>
                <FormGroup label="Catalog Source" isRequired fieldId="source">
                    <FormSelect
                        id="source"
                        value={source}
                        onChange={(_event, val) => setSource(val)}
                        isRequired
                    >
                        <FormSelectOption key="community-operators" value="community-operators" label="community-operators" />
                        <FormSelectOption key="certified-operators" value="certified-operators" label="certified-operators" isDisabled />
                    </FormSelect>
                </FormGroup>
                <FormGroup label="Catalog Source Namespace" isRequired fieldId="source-namespace">
                    <TextInput
                        id="source-namespace"
                        value={sourceNamespace} 
                        type="text"
                        readOnlyVariant='default'
                    />
                </FormGroup>
                <FormGroup label="Starting CSV" isRequired fieldId="starting-csv">
                    <FormSelect
                        id="starting-csv"
                        value={startingCSV}
                        onChange={(_event, val) => setStartingCSV(val)}
                        isRequired
                    >
                        {csvOptions.map((csv) => (
                            <FormSelectOption key={csv} value={csv} label={csv} />
                        ))}
                    </FormSelect>
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default SusanooTridentOperatorForm;