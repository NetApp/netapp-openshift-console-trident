# netapp-openshift-console-trident

This project is currently in a pre-release phase and requires an early access legal agreement to deploy and use netapp-openshift-console-trident. 

## netapp-openshift-console-trident container image access
The container image is available via our GitHub organization's container registry as a private package with the access token as an image pull secret. 

### Create a Kubernetes Secret for ```docker-registry```

The required details to create the secret are:
- a GitHub username
- a generated GitHub Token

Then:
* First, create the ```namespace``` or ```project``` for netapp-openshift-console-trident:
  ```
  oc new-project netapp-openshift-console-trident
  ```

* Then, run the following command with the provided details:
  ```
  oc -n netapp-openshift-console-trident create secret docker-registry ghcr-netapp-openshift-console-trident-secret --docker-server=https://ghcr.io --docker-username=$YOUR_GITHUB_USERNAME --docker-password=$YOUR_GITHUB_TOKEN
  ```

> [!NOTE]  
> The secret name is ```ghcr-netapp-openshift-console-trident-secret``` and will be used by the Helm Charts. Changing the name might fail the deployment.

The secret could also be created using a YAML manfiest. Here is the process: 

* Encode your GitHub username with the access token:
  ```
  echo -n "myusername:mysecretoken" | base64
  ```
  Expected output:
  ```
  bXl1c2VybmFtZTpteXNlY3JldG9rZW4=
  ```

* Create a ```netapp-openshift-console-trident.json``` file for future reference with the following details:
  ```
  {"auths":{"ghcr.io":{"auth": "bXl1c2VybmFtZTpteXNlY3JldG9rZW4"}}}
  ```
* Encode the content:
  ```
  echo -n "{"auths":{"ghcr.io":{"auth": "bXl1c2VybmFtZTpteXNlY3JldG9rZW4"}}}" | base64
  ```
  expected output:
  ```
  e2F1dGhzOntnaGNyLmlvOnthdXRoOiBiWGwxYzJWeWJtRnRaVHB0ZVhObFkzSmxkRzlyWlc0fX19
  ```
* Then create a secret YAML manifest ```ghcr-netapp-openshift-console-trident-secret.yaml```:
  ```YAML
  apiVersion: v1
  kind: Secret
  metadata:
    name: ghcr-netapp-openshift-console-trident-secret
    namespace: netapp-openshift-console-trident
  data:
    .dockerconfigjson: e2F1dGhzOntnaGNyLmlvOnthdXRoOiBiWGwxYzJWeWJtRnRaVHB0ZVhObFkzSmxkRzlyWlc0fX19
  type: kubernetes.io/dockerconfigjson
  ```
* Finally, push the manifest to Kubernetes:
  ```
  oc create -f ghcr-netapp-openshift-console-trident-secret.yaml
  ```

> [!NOTE]
> While the access Token is **read only**, it is a good practice to ***not be saved*** these files in a Git repository as it contains credentials.


## Deployment with Helm

The provided Helm Charts allows you to deploy easily netapp-openshift-console-trident to any Red Hat OpenShift Cluster that your terminal console is connected to. 

* Clone this repository
  ```
  git clone https://github.com/NetApp/netapp-openshift-console-trident
  ```

* Then, when in the ```netapp-openshift-console-trident``` folder, run:
  ```
  helm install netapp-openshift-console-trident charts/netapp-openshift-console-trident -n netapp-openshift-console-trident --create-namespace --set plugin.image=ghcr.io/netapp/netapp-openshift-console-trident:25.6.25
  ```
  Expected output:
  ```
  Release "netapp-openshift-console-trident" does not exist. Installing it now.
  NAME: netapp-openshift-console-trident
  LAST DEPLOYED: Tue Mar 18 20:07:27 2025
  NAMESPACE: netapp-openshift-console-trident
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  ```

  The only variable is ```plugin.image=ghcr.io/netapp/netapp-openshift-console-trident:25.6.25``` corresponding to the desired version to deploy. At the current stage, the following version(s) are available:  
  - 25.6.25

* Verify the status of the netapp-openshift-console-trident's Pods:
  ```
  oc get pods -n netapp-openshift-console-trident
  ```
  Expected output:
  ```
  NAME                      READY   STATUS    RESTARTS   AGE
  netapp-openshift-console-trident-f7ff95b57-c4cx4   1/1     Running   0          24h
  netapp-openshift-console-trident-f7ff95b57-wxs5d   1/1     Running   0          24h  
  ```

  This can also be verified via the console by selecting ```Workloads```, ```Pods```, and the Project ```netapp-openshift-console-trident```:
  ![netapp-openshift-console-trident pods](./assets/susanoo-pods.png)

## Enable netapp-openshift-console-trident in Red Hat OpenShift

This can also be done via the console by:
* selecting ```Administration```, ```Cluster Settings```, then the tab ```Configuration```:
![netapp-openshift-console-trident cluster settings](./assets/susanoo-clustersettings.png)
* clicking on ```Console``` with the mention ```operator.openshift.io```, then the tab ```Console plugins```:
![netapp-openshift-console-trident console plugins](./assets/susanoo-consoleplugins.png)
* clicking on ```Disable```, select ```Enable```, then click ```Save```:
![netapp-openshift-console-trident console enable](./assets/susanoo-consolepluginenable.png)
* waiting for about a minute, a message will appear welcoming you to refresh the console, click ```Refresh console```:
![netapp-openshift-console-trident console plugins](./assets/susanoo-refreshconsole.png)
* At this stage, the version and description should appear as well as the menu ```netapp-openshift-console-trident by NetApp``` between ```Storage``` and ```Builds```.
![netapp-openshift-console-trident console plugins](./assets/susanoo-enabled.png)

## Uninstall netapp-openshift-console-trident 

If deployed with Helm, then runn the following command:
```
helm uninstall netapp-openshift-console-trident -n netapp-openshift-console-trident
```
Expected output:
```
release "netapp-openshift-console-trident" uninstalled
```