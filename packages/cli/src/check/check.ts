import { getParams, getFilesFromFolder, flattenObject } from '../utils';

interface LanguageData {
  __filename: string;
  [key: string]: string | { [nestedKey: string]: string };
}

interface CheckResults {
  __filename: string;
  translationKeys: number;
  missingTranslationKeys: number;
  coverage: number;
  missingParams: string[];
}

function isDevOnlyKey(key: string): boolean {
  return key === 'devOnly';
}

function processNestedKeys(
  nestedObj: Record<string, string>,
  data: Record<string, any>,
  parentKey: string,
  acc: CheckResults
): void {
  Object.entries(nestedObj).forEach(([nestedKey, nestedValue]) => {
    if (isDevOnlyKey(nestedKey)) return;

    acc.translationKeys += 1;

    if (!data[parentKey] || !data[parentKey][nestedKey]) {
      acc.missingTranslationKeys += 1;
    } else {
      const referenceParams = getParams(nestedValue);
      const params = getParams(data[parentKey][nestedKey] as string);

      if (referenceParams && referenceParams.length !== params?.length) {
        acc.missingParams.push(`${parentKey}.${nestedKey}`);
      }
    }
  });
}

function calculateCoverage(results: CheckResults): number {
  return Number(
    (
      (results.translationKeys - results.missingTranslationKeys) /
      results.translationKeys
    ).toFixed(2)
  );
}

function validateLanguageJson({
  reference,
  data,
}: {
  reference: Record<string, string | { [nestedKey: string]: string }>;
  data: LanguageData;
}): CheckResults {
  const initialResults: CheckResults = {
    __filename: data.__filename,
    translationKeys: 0,
    missingTranslationKeys: 0,
    coverage: 0,
    missingParams: [],
  };

  const results = Object.entries(reference).reduce<CheckResults>(
    (acc, [key, value]) => {
      if (isDevOnlyKey(key)) {
        // Skip devOnly key and its contents
        return acc;
      }

      if (typeof value === 'object' && value !== null) {
        processNestedKeys(value, data, key, acc);
      } else {
        acc.translationKeys += 1;

        if (!data[key]) {
          acc.missingTranslationKeys += 1;
        } else {
          const referenceParams = typeof value === 'string' ? getParams(value) : [];
          const params = getParams(data[key] as string);

          if (referenceParams && referenceParams.length !== params?.length) {
            acc.missingParams.push(key);
          }
        }
      }

      return acc;
    },
    initialResults
  );

  results.coverage = calculateCoverage(results);
  return results;
}

function check(inputPath: string): CheckResults[] {
  const allLanguages = getFilesFromFolder(inputPath).map((obj) =>
    flattenObject(obj),
  ) as unknown as { __filename: string; [key: string]: string }[];

  // Split the data array in an array with meta.json and another one with the <language>.jsons
  const reference = allLanguages.splice(
    allLanguages.findIndex((el) => el.__filename === 'meta'),
    1,
  )[0];

  delete reference.__filename;

  const checkResults = allLanguages.map((data) =>
    validateLanguageJson({ reference, data }),
  );

  return checkResults;
}

export { check, validateLanguageJson };
