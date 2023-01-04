import fs from 'node:fs';
import path from 'node:path';

/**
 * Flatten the provided object
 *
 * @param obj An object
 * @param keySeparator The separator that should be applied
 * @returns A object without any nested objects
 */
export function flattenObject(
  obj: Record<string, unknown>,
  keySeparator = '.',
) {
  const flattenRecursive = (
    obj: Record<string, unknown>,
    parentProperty?: string,
    propertyMap: Record<string, unknown> = {},
  ) => {
    for (const [key, value] of Object.entries(obj)) {
      const property = parentProperty
        ? `${parentProperty}${keySeparator}${key}`
        : key;
      if (value && typeof value === 'object') {
        flattenRecursive(
          value as Record<string, unknown>,
          property,
          propertyMap,
        );
      } else {
        propertyMap[property] = value;
      }
    }
    return propertyMap;
  };
  return flattenRecursive(obj);
}

/**
 * Deflattens the provided object
 *
 * @param ob The object to deflatten
 */
export function deflattenObject(ob: Record<string, string>) {
  const result = {};
  for (const i in ob) {
    if (Object.prototype.hasOwnProperty.call(ob, i)) {
      const keys = i.match(/^\.+[^.]*|[^.]*\.+$|(?:\.{2,}|[^.])+(?:\.+$)?/g);
      keys.reduce((r, e, j) => {
        return (
          r[e] ||
          (r[e] = isNaN(Number(keys[j + 1]))
            ? keys.length - 1 === j
              ? ob[i]
              : {}
            : [])
        );
      }, result);
    }
  }
  return result;
}

export function getParams(text: string) {
  const matches = text.match(/{{(.*?)}}/g);
  return matches?.map((match) => match.substring(2, match.length - 2).trim());
}

/**
 *
 * @param inputPath Path to the input folder
 * @returns {__filename: "meta.json", keyOne: 'foo'}
 */
export function getFilesFromFolder(
  inputPath: string,
): Record<string, string>[] {
  const jsonList = fs
    .readdirSync(inputPath)
    .filter((file) => path.extname(file) === '.json')
    .map((file) => ({
      __filename: path.basename(file, '.json'),
      ...JSON.parse(fs.readFileSync(path.join(inputPath, file)).toString()),
    }));

  if (!!jsonList.find((file) => file.__filename === 'meta')) return jsonList;
  else
    throw Error(
      `Could not find a meta.json file in the provided folder: ${inputPath}`,
    );
}
