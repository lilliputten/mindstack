import { UserGradeSchema, UserGradeType } from '@/generated/prisma';

export interface TGradeComparisonResult {
  type: 'same' | 'upgrade' | 'downgrade' | 'guest';
  currentGrade: UserGradeType;
  requestedGrade: UserGradeType;
  currentGradeIndex: number;
  requestedGradeIndex: number;
}

export function gradeComparison(
  currentGrade: UserGradeType,
  requestedGrade: UserGradeType,
): TGradeComparisonResult {
  const gradeHierarchy = UserGradeSchema.options;
  const currentGradeIndex = gradeHierarchy.indexOf(currentGrade);
  const requestedGradeIndex = gradeHierarchy.indexOf(requestedGrade);

  let type: TGradeComparisonResult['type'] = 'same';

  if (currentGrade === 'GUEST') {
    type = 'guest'; // Not allowed
  } else if (currentGradeIndex > requestedGradeIndex) {
    type = 'downgrade';
  } else if (currentGradeIndex < requestedGradeIndex) {
    type = 'upgrade';
  }

  return {
    type,
    currentGrade,
    requestedGrade,
    currentGradeIndex,
    requestedGradeIndex,
  };
}
