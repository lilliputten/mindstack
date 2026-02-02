import z from 'zod';

export const GigachatModelSchema = z.enum(['GigaChat', 'GigaChat-Pro', 'GigaChat-Max']);
export type TGigachatModel = z.infer<typeof GigachatModelSchema>;
