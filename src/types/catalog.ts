export interface CatalogIcon {
    url: string;
  }
  
  export interface CatalogCallToAction {
    label: string;
    href: string;
  }
  
  export interface CatalogProperty {
    label: string;
    value: string;
  }
  
  export interface DocumentationLink {
    label: string;
    href: string;
  }
  
  export interface CatalogDetails {
    properties: CatalogProperty[];
    documentationLinks: DocumentationLink[];
  }
  
  export interface CatalogAttributes {
    featuredLevel: 'Basic' | 'Advanced' | 'Expert';
  }
  
  export interface CatalogItem {
    uid: string;
    type: string;
    name: string;
    provider: string;
    description: string;
    tags: string[];
    categories: string[];
    icon: CatalogIcon;
    attributes: CatalogAttributes;
    cta: CatalogCallToAction;
    details: CatalogDetails;
  }
  
  export interface CatalogExtension {
    type: 'netapp';
    title: string;
    catalogDescription: string;
    provider: string;
    items: CatalogItem[];
  }