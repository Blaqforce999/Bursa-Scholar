import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: ['node_modules/**', '.next/**', 'prisma/migrations/**'],
  },
];

export default eslintConfig;
