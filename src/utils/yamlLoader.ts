import yaml from 'js-yaml';

export const loadYAMLContent = (yamlContent: any): string => {
  if (typeof yamlContent === 'string') {
    return yamlContent;
  }
  return yaml.dump(yamlContent);
};

export const loadYAMLWorkflow = <T>(yamlContent: string): T => {
  try {
    console.log('Raw YAML content:', yamlContent); // Debug raw content
    const parsed = yaml.load(yamlContent);
    console.log('Parsed YAML:', parsed); // Debug parsed content
    return parsed as T;
  } catch (error) {
    console.error('Failed to parse YAML:', error);
    throw error;
  }
};