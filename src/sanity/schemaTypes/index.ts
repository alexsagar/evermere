import * as objects from "./objects";
import * as documents from "./documents";
import { siteSettings, navigation, homePage, inquirySettings } from "./singletons";

export { singletonTypes } from "./singletons";

export const schemaTypes = [
  ...Object.values(objects),
  siteSettings,
  navigation,
  homePage,
  inquirySettings,
  ...Object.values(documents),
];
