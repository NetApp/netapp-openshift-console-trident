import * as React from 'react';
import { useK8sWatchResource, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { jwtDecode } from 'jwt-decode';

interface SecretResource extends K8sResourceCommon {
  data?: {
    [key: string]: string;
  };
}

const useActivationKeyCheck = () => {
  const [isValidKey, setIsValidKey] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const secretResource = {
    group: '',
    version: 'v1',
    kind: 'Secret',
    name: 'eap-activation-key',
    namespace: 'trident',
  };

  const [secret, secretLoaded, secretError] = useK8sWatchResource<SecretResource>(secretResource);

  React.useEffect(() => {
    if (secretLoaded && !secretError) {
      const activationKey = secret?.data?.activationKey 
        ? atob(secret.data.activationKey) 
        : '';
      try {
        if (!activationKey) throw new Error('No key');
        const decoded: any = jwtDecode(activationKey);
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp > now) {
          setIsValidKey(true);
        } else {
          setIsValidKey(false);
        }
      } catch {
        setIsValidKey(false);
      }
    }
    setIsLoading(false);
  }, [secret, secretLoaded, secretError]);

  return { isValidKey, isLoading };
};

export default useActivationKeyCheck;