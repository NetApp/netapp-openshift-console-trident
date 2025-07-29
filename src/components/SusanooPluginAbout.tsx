import * as React from 'react';
import { 
  TextContent, 
  TextList, 
  TextListItem 
} from '@patternfly/react-core';

const SusanooPluginAbout = () => {

    return (
      <>
        <TextContent>
          <p>The open-source project <strong>netapp-openshift-console-trident</strong> for Red Hat OpenShift has been designed to improve the user experience connecting with the NetApp portfolio.</p>
          <p>The project is provided <strong>AS-IS</strong> under the <a href="https://github.com/NetApp/netapp-openshift-console-trident?tab=Apache-2.0-1-ov-file#readme" target="_blank">Apache License 2.0</a> with limited community support only. If you have any questions, open a GitHub Issue using the link below.</p>
        </TextContent>
        <TextContent>
        <TextList component='dl'>
          <TextListItem component='dt'>Version</TextListItem>
          <TextListItem component='dd'>25.7.29</TextListItem>
          <TextListItem component='dt'>Docs & Help</TextListItem>
          <TextListItem component='dd'>            <a 
              href="https://github.com/NetApp/netapp-openshift-console-trident" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              NetApp/netapp-openshift-console-trident
            </a></TextListItem>
        </TextList>
        </TextContent>
      </>
    );
};

export default SusanooPluginAbout;