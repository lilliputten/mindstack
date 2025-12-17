import { TAiClientType } from '@/lib/ai/types/TAiClientType';

export type TAIQuerDebugDataId = 'answers-query-data-01' | 'questions-query-data-01' | boolean;

export interface TAIQueryOptions {
  clientType?: TAiClientType;
  debugData?: TAIQuerDebugDataId;
}
