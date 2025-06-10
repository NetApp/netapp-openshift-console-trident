import * as React from "react";
import { 
    ListPageHeader,
    ResourceYAMLEditor,
} from '@openshift-console/dynamic-plugin-sdk'
import { 
    Page 
} from "@patternfly/react-core";
import { useLocation } from "react-router";

interface LocationState {
    initialResource: any;
};

const SusanooObjectCreate = () => {

    const location = useLocation<LocationState>();
    const rawResource = location.state?.initialResource || {};
    const initialResource = rawResource.yaml ? rawResource.yaml : rawResource;
    
    return (
        <>
            <ListPageHeader 
                title="Create NetApp Trident Object"
            />
            <Page>
                <ResourceYAMLEditor 
                    initialResource={initialResource} 
                    create 
                    hideHeader
                />
            </Page>
            </>
    );
};

export default SusanooObjectCreate;