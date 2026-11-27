import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, singletonTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
// These legacy empty collection schemas are retained, but their content is edited on the existing pages.
const hiddenCreationTypes = new Set([...singletonTypes, "amenity", "activity", "dining"]);

// Development is the only editable workspace authorized for this project.
export default defineConfig({
  name: "evermere",
  title: "Evermere Senior Living — Development",
  projectId: "8nawnqp2",
  dataset: "development",
  plugins: [
    structureTool({
      structure,
    }),
  ],
  document: {
    actions: (actions, context) => singletonTypes.has(context.schemaType)
      ? actions.filter(({ action }) => action !== "duplicate" && action !== "delete") : actions,
    newDocumentOptions: (options) => options.filter(({ templateId }) => !hiddenCreationTypes.has(templateId)),
  },
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !hiddenCreationTypes.has(schemaType)),
  },
});
