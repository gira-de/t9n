import { getParams, getFilesFromFolder, flattenObject } from '../utils';

type CheckResults = {
  __filename: string;
  translationKeys: number;
  missingTranslationKeys: number;
  coverage: number;
  missingParams: string[];
};

function validateLanguageJson({
  reference,
  data,
}: {
  reference: Record<string, string>;
  data: { __filename: string; [key: string]: string };
}) {
  const res = Object.entries(reference).reduce<CheckResults>(
    (acc, [key, value]) => {
      const _res = acc;
      // Increment the translationKey count
      _res.translationKeys = acc.translationKeys + 1;

      // Increment the missingTranslationKey count if the translationKey could not be found
      if (!data[key])
        _res.missingTranslationKeys = acc.missingTranslationKeys + 1;
      else {
        // Check for parameters
        const referenceParams = getParams(value);

        if (typeof referenceParams !== 'undefined') {
          const params = getParams(data[key]);

          if (referenceParams.length !== params?.length)
            _res.missingParams = [key, ...acc.missingParams];
        }
      }

      // Calculate the translationKey coverage and round it
      _res.coverage = Number(
        (
          (acc.translationKeys - acc.missingTranslationKeys) /
          acc.translationKeys
        ).toFixed(2),
      );

      return _res;
    },
    {
      __filename: data.__filename,
      translationKeys: 0,
      missingTranslationKeys: 0,
      coverage: 0,
      missingParams: [],
    },
  );

  return res;
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
