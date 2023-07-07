export function formatFileDates(model: any) {
  return {
    ...model,
    // @ts-ignore
    createdAt: model.createdAt.toISOString(),
    // @ts-ignore
    updatedAt: model.updatedAt.toISOString(),
  };
}
