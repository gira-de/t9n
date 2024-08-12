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

function setValueByPath(
  object: Record<string, unknown>,
  fullPath: string,
  path: string[],
  value: unknown,
): void {
  switch (path.length) {
    case 0:
      return;
    case 1:
      object[path[0]] = value;
      break;
    default:
      const currentPath = path[0];
      if (currentPath in object) {
        const objectAtCurrentPath = object[currentPath];
        if (typeof objectAtCurrentPath === 'object') {
          setValueByPath(
            objectAtCurrentPath as Record<string, unknown>,
            fullPath,
            path.slice(1),
            value,
          );
        } else {
          throw TypeError(
            `Path ${fullPath} already exists, but is not an object, but ${objectAtCurrentPath} instead`,
          );
        }
      } else {
        const childObject = {};
        object[currentPath] = childObject;
        setValueByPath(childObject, fullPath, path.slice(1), value);
      }
      break;
  }
}

/**
 * Deflattens the provided object
 *
 * @param ob The object to deflatten
 */
export function deflattenObject(object: Record<string, string>) {
  const result = {};
  for (const [key, value] of Object.entries(object)) {
    const path = key
      .split('.')
      .map((pathComponent: string) => pathComponent.trim())
      .filter((pathComponent: string) => pathComponent.length > 0);
    setValueByPath(result, key, path, value);
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
