export function formatDatesToIsoString(model: any): any {
  // If it's a Date object, convert to ISO string.
  if (model instanceof Date) {
    return model.toISOString();
  }

  // If it's an array, iterate over it and apply formatDatesToIsoString on each item.
  if (Array.isArray(model)) {
    return model.map((item) => formatDatesToIsoString(item));
  }

  // If it's an object, iterate over its properties and apply formatDatesToIsoString on each.
  if (typeof model === "object" && model !== null) {
    return Object.keys(model).reduce((acc: Record<string, any>, key) => {
      acc[key] = formatDatesToIsoString(model[key]);
      return acc;
    }, {});
  }

  // If it's neither, return it as is.
  return model;
}
