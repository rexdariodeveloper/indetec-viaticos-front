// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  hmr: false,
  backend: false,
  cryptoSecret : 'bPIlujhMO8Vvhs5nsx7mIWeS9Vf1KmDN',
  moneyLimit: 999999.99,
  extensionImagen: '.jpeg .jpg .png .gif',
  extensionXML: '.xml',
  extensionOther: '.pdf .jpeg .jpg .png .gif .docx .docm .dotx .dotm .xlsx .xlsm .xltx .xltm .xlsb .xlam .pptx .pptm'
};
