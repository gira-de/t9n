export const findPropByString = (
  obj: Record<string, unknown>,
  path: string,
): string | undefined => {
  const match = path.split('.').reduce((acc, part) => acc && acc[part], obj);
  return typeof match === 'string' ? match : undefined;
};

export const renderString = (
  template: string,
  data: Record<string, unknown>,
) => {
  return template.replace(/{{(.*?)}}/g, (match) => {
    return data[match.split(/{{|}}/).filter(Boolean)[0].trim()] as string;
  });
};
