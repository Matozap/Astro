import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:5000/graphql',
  documents: ['src/**/*.graphql', '../specs/001-angular-frontend/contracts/*.graphql'],
  generates: {
    'src/app/shared/graphql/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-apollo-angular',
      ],
      config: {
        addExplicitOverride: true,
        strictScalars: true,
        scalars: {
          UUID: 'string',
          DateTime: 'string',
          Decimal: 'number',
        },
      },
    },
  },
};

export default config;
