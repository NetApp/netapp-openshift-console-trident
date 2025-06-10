## Testing 
This guide allows you to test the plugin code without deploying the plugin. A local instance of the plugin will be rendered via a console pod running on your machine while proxying all the OpenShift components from an existing cluster.

This guide can be used with an instance of [Red Hat OpenShift Local](https://developers.redhat.com/products/openshift-local/overview) as demonstrated.

To test the NetApp IOS plugin:

- setup and start OpenShift Local
```
crc start
```
expected output:
```
...
INFO Adding crc-admin and crc-developer contexts to kubeconfig... 
Started the OpenShift cluster.

The server is accessible via web console at:
  https://console-openshift-console.apps-crc.testing

Log in as administrator:
  Username: kubeadmin
  Password: kubeadmin

Log in as user:
  Username: developer
  Password: developer

Use the 'oc' command line interface:
  $ eval $(crc oc-env)
  $ oc login -u developer https://api.crc.testing:6443
romv@romv-mac-0 susanoo-openshift % 
``` 

- ensure the following dependencies are met:
  - nodejs and yarn installed
  - docker and podman installed
  - OpenShift CLI installed
  - access to a running Red Hat OpenShift Container Platform 

- clone this repository
```
git clone https://github.com/NetApp/susanoo-openshift.git
```
- install all the code dependencies:
```
yarn install
```
expected output:
```
romv@romv-mac-0 susanoo-openshift % yarn install
yarn install v1.22.22
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
warning " > @cypress/webpack-preprocessor@5.15.5" has unmet peer dependency "@babel/core@^7.0.1".
warning " > @cypress/webpack-preprocessor@5.15.5" has unmet peer dependency "@babel/preset-env@^7.0.0".
warning " > @cypress/webpack-preprocessor@5.15.5" has unmet peer dependency "babel-loader@^8.0.2".
warning " > react-i18next@11.18.6" has unmet peer dependency "i18next@>= 19.0.0".
warning " > cypress-multi-reporters@1.6.2" has unmet peer dependency "mocha@>=3.1.2".
warning " > mocha-junit-reporter@2.2.0" has unmet peer dependency "mocha@>=2.2.5".
warning " > mochawesome@7.1.3" has unmet peer dependency "mocha@>=7".
[4/4] 🔨  Building fresh packages...
✨  Done in 31.28s.
``` 

- start the plugin:
```
yarn run start
```
expected output:
```
romv@romv-mac-0 susanoo-openshift % yarn start  
yarn run v1.22.22
$ yarn webpack serve --progress
$ node -r ts-node/register ./node_modules/.bin/webpack serve --progress
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:9001/
<i> [webpack-dev-server] On Your Network (IPv4): http://192.168.1.30:9001/
<i> [webpack-dev-server] On Your Network (IPv6): http://[fe80::1]:9001/
<i> [webpack-dev-server] Content not from webpack is served from './dist' directory
assets by path *.js 1.54 MiB
  assets by chunk 1.22 MiB (id hint: vendors)
    asset vendors-node_modules_patternfly_react-core_dist_esm_components_Page_index_js-chunk.js 1.11 MiB [emitted] (id hint: vendors) 1 related asset
    asset vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_css-loader_dist_runtime_sour-ba7919-chunk.js 94.5 KiB [emitted] (id hint: vendors) 1 related asset
    asset vendors-node_modules_tslib_tslib_es6_mjs-chunk.js 18.8 KiB [emitted] (id hint: vendors) 1 related asset
  + 10 assets
asset locales/en/plugin__console-plugin-template.json 1.27 KiB [emitted] [from: ../locales/en/plugin__console-plugin-template.json] [copied]
asset plugin-manifest.json 987 bytes [emitted]
orphan modules 106 KiB [orphan] 75 modules
runtime modules 45.7 KiB 17 modules
javascript modules 1.3 MiB
  modules by path ../node_modules/ 1.29 MiB 105 modules
  modules by path ./ 6.31 KiB 10 modules
  container entry 42 bytes [built] [code generated]
consume-shared-module modules 252 bytes
  modules by path consume shared module (default) @patternfly/ 168 bytes 4 modules
  consume shared module (default) react@^17.0.1 (singleton) 42 bytes [built] [code generated]
  consume shared module (default) react-i18next@^11.7.3 (singleton) 42 bytes [built] [code generated]
provide-module modules 168 bytes
  provide shared module (default) @patternfly/react-core/dist/dynamic/components/Page@5.2.1 = ../node_modules/@patternfly/react-core/dist/esm/components/Page/index.js 42 bytes [built] [code generated]
  provide shared module (default) @patternfly/react-core/dist/dynamic/components/Text@5.2.1 = ../node_modules/@patternfly/react-core/dist/esm/components/Text/index.js 42 bytes [built] [code generated]
  provide shared module (default) @patternfly/react-core/dist/dynamic/components/Title@5.2.1 = ../node_modules/@patternfly/react-core/dist/esm/components/Title/index.js 42 bytes [built] [code generated]
  provide shared module (default) @patternfly/react-icons/dist/dynamic/icons/check-circle-icon@5.2.1 = ../node_modules/@patternfly/react-icons/dist/esm/icons/check-circle-icon.js 42 bytes [built] [code generated]
webpack 5.75.0 compiled successfully in 4232 ms
```

- login to the Red Hat OpenShift Cluster 
```
oc login <cluster_url>
```
expected output:
```
romv@romv-mac-0 susanoo-openshift % oc login -u kubeadmin
Logged into "https://api.crc.testing:6443" as "kubeadmin" using existing credentials.

You have access to 65 projects, the list has been suppressed. You can list all projects with 'oc projects'

Using project "default".
```

- start a local Red Hat OpenShift console running in Docker/Podman to render the plugin code with your local cluster components:
```
yarn run start-console
```

- open a browser tab to ```http://localhost:9000/``` to access the plugin


> [!NOTE]
> This process pull the OpenShift Origin console image, the upstream version of Red Hat OpenShift, which will have a slightly different UI, but the outcome will be the same on Red Hat OpenShift. 


## Development

### Option 1: Local

In one terminal window, run:

1. `yarn install`
2. `yarn run start`

In another terminal window, run:

1. `oc login` (requires [oc](https://console.redhat.com/openshift/downloads) and an [OpenShift cluster](https://console.redhat.com/openshift/create))
2. `yarn run start-console` (requires [Docker](https://www.docker.com) or [podman 3.2.0+](https://podman.io))

This will run the OpenShift console in a container connected to the cluster
you've logged into. The plugin HTTP server runs on port 9001 with CORS enabled.
Navigate to <http://localhost:9000/example> to see the running plugin.

#### Running start-console with Apple silicon and podman

If you are using podman on a Mac with Apple silicon, `yarn run start-console`
might fail since it runs an amd64 image. You can workaround the problem with
[qemu-user-static](https://github.com/multiarch/qemu-user-static) by running
these commands:

```bash
podman machine ssh
sudo -i
rpm-ostree install qemu-user-static
systemctl reboot
```

### Option 2: Docker + VSCode Remote Container

Make sure the
[Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension is installed. This method uses Docker Compose where one container is
the OpenShift console and the second container is the plugin. It requires that
you have access to an existing OpenShift cluster. After the initial build, the
cached containers will help you start developing in seconds.

1. Create a `dev.env` file inside the `.devcontainer` folder with the correct values for your cluster:

```bash
OC_PLUGIN_NAME=console-plugin-template
OC_URL=https://api.example.com:6443
OC_USER=kubeadmin
OC_PASS=<password>
```

2. `(Ctrl+Shift+P) => Remote Containers: Open Folder in Container...`
3. `yarn run start`
4. Navigate to <http://localhost:9000/example>

## Docker image

Before you can deploy your plugin on a cluster, you must build an image and
push it to an image registry.

1. Build the image:

   ```sh
   docker build -t quay.io/my-repository/my-plugin:latest .
   ```

2. Run the image:

   ```sh
   docker run -it --rm -d -p 9001:80 quay.io/my-repository/my-plugin:latest
   ```

3. Push the image:

   ```sh
   docker push quay.io/my-repository/my-plugin:latest
   ```

NOTE: If you have a Mac with Apple silicon, you will need to add the flag
`--platform=linux/amd64` when building the image to target the correct platform
to run in-cluster.

## Deployment on cluster

A [Helm](https://helm.sh) chart is available to deploy the plugin to an OpenShift environment.

The following Helm parameters are required:

`plugin.image`: The location of the image containing the plugin that was previously pushed

Additional parameters can be specified if desired. Consult the chart [values](charts/openshift-console-plugin/values.yaml) file for the full set of supported parameters.

### Installing the Helm Chart

Install the chart using the name of the plugin as the Helm release name into a new namespace or an existing namespace as specified by the `plugin_console-plugin-template` parameter and providing the location of the image within the `plugin.image` parameter by using the following command:

```shell
helm upgrade -i  my-plugin charts/openshift-console-plugin -n plugin__console-plugin-template --create-namespace --set plugin.image=my-plugin-image-location
```

NOTE: When deploying on OpenShift 4.10, it is recommended to add the parameter `--set plugin.securityContext.enabled=false` which will omit configurations related to Pod Security.

NOTE: When defining i18n namespace, adhere `plugin__<name-of-the-plugin>` format. The name of the plugin should be extracted from the `consolePlugin` declaration within the [package.json](package.json) file.

## i18n

The plugin template demonstrates how you can translate messages in with [react-i18next](https://react.i18next.com/). The i18n namespace must match
the name of the `ConsolePlugin` resource with the `plugin__` prefix to avoid
naming conflicts. For example, the plugin template uses the
`plugin__console-plugin-template` namespace. You can use the `useTranslation` hook
with this namespace as follows:

```tsx
conster Header: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-template');
  return <h1>{t('Hello, World!')}</h1>;
};
```

For labels in `console-extensions.json`, you can use the format
`%plugin__console-plugin-template~My Label%`. Console will replace the value with
the message for the current language from the `plugin__console-plugin-template`
namespace. For example:

```json
  {
    "type": "console.navigation/section",
    "properties": {
      "id": "admin-demo-section",
      "perspective": "admin",
      "name": "%plugin__console-plugin-template~Plugin Template%"
    }
  }
```

Running `yarn i18n` updates the JSON files in the `locales` folder of the
plugin template when adding or changing messages.

## Linting

This project adds prettier, eslint, and stylelint. Linting can be run with
`yarn run lint`.

The stylelint config disallows hex colors since these cause problems with dark
mode (starting in OpenShift console 4.11). You should use the
[PatternFly global CSS variables](https://patternfly-react-main.surge.sh/developer-resources/global-css-variables#global-css-variables)
for colors instead.

The stylelint config also disallows naked element selectors like `table` and
`.pf-` or `.co-` prefixed classes. This prevents plugins from accidentally
overwriting default console styles, breaking the layout of existing pages. The
best practice is to prefix your CSS classnames with your plugin name to avoid
conflicts. Please don't disable these rules without understanding how they can
break console styles!

## Reporting

Steps to generate reports

1. In command prompt, navigate to root folder and execute the command `yarn run cypress-merge`
2. Then execute command `yarn run cypress-generate`
The cypress-report.html file is generated and should be in (/integration-tests/screenshots) directory

## References

- [Console Plugin SDK README](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
- [Customization Plugin Example](https://github.com/spadgett/console-customization-plugin)
- [Dynamic Plugin Enhancement Proposal](https://github.com/openshift/enhancements/blob/master/enhancements/console/dynamic-plugins.md)
