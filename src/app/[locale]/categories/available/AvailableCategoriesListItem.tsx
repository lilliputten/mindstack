import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { Link, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import * as Icons from '@/components/shared/Icons';
import {
  availableCategoriesRoute,
  manageCategoriesRoute,
  rootCategoriesRoute,
  TRoutePath,
} from '@/config';
import { isDev } from '@/constants';
import { CategoryHeader } from '@/features/categories/components/CategoryHeader';
import { CategoryProperties } from '@/features/categories/components/CategoryProperties';
import { TAvailableCategory } from '@/features/categories/types';
import { useGoToTheRoute, useSessionUser } from '@/hooks';

// TODO: Use 'next/navigation'

interface TAvailableCategoriesListItemProps {
  index: number;
  style?: React.CSSProperties;
  category: TAvailableCategory;
}

export function AvailableCategoriesListItem(props: TAvailableCategoriesListItemProps) {
  // const manageScope = CategoriesManageScopeIds.AVAILABLE_TOPICS;
  const { category, style } = props;
  const t = useT();
  const {
    id: categoryId,
    // userId,
    // name,
    // description,
    // isPublic,
    // langCode,
    // langName,
    // keywords,
    // createdAt,
    // updatedAt,
    // userCategoryWorkout: workouts,
    // workoutStats,
    _count,
  } = category;

  // const topicsCount = _count?.topics;

  // const router = useRouter();
  const pathname = usePathname();
  const categoriesRoutePath = `${pathname}/${categoryId}`;

  const user = useSessionUser();
  const isOwner = category?.createdBy && category?.createdBy === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;

  // const manageCategoriesRoute = isOwner ? manageCategoriesRoute : rootCategoriesRoute;

  const goToTheRoute = useGoToTheRoute();
  // const goBack = useGoBack(`${routePath}/${category.id}`);

  const isCurrentCategoryRoutePath = comparePathsWithoutLocalePrefix(categoriesRoutePath, pathname);

  let cardContent = (
    <>
      <CardHeader
        className={cn(
          isDev && '__AvailableCategoriesList_CategoryItem_CardHeader', // DEBUG
          'flex flex-1 flex-row gap-2 pb-4',
          'max-sm:flex-col-reverse',
        )}
      >
        <CategoryHeader
          category={category}
          className="flex-1 max-sm:flex-col-reverse"
          showProperties={false}
        />
      </CardHeader>
      {/*!!description && ( // NOTE: The description is displaying in the `CategoryHeader` (above)
        <CardContent
          className={cn(
            isDev && '__AvailableCategoriesList_CategoryItem_CardContent_Description', // DEBUG
            'flex flex-1 flex-col',
          )}
        >
          <div id="description">
            <MarkdownText omitLinks>{description}</MarkdownText>
          </div>
        </CardContent>
      )*/}
      <CardContent
        className={cn(
          isDev && '__AvailableCategoriesList_CategoryItem_CardContent_Properties', // DEBUG
          'flex flex-1 flex-wrap gap-4 text-xs max-sm:flex-col md:items-center',
        )}
      >
        <div
          className={cn(
            isDev && '__AvailableCategoriesList_CategoryItem__CategoryProperties', // DEBUG
            'flex flex-1 flex-wrap items-center gap-4 gap-y-2 py-3',
          )}
        >
          <CategoryProperties category={category} showDates />
        </div>
        <div
          className={cn(
            isDev && '__AvailableCategoriesList_CategoryItem__RightActions', // DEBUG
            'flex flex-wrap items-center gap-2 md:items-end',
          )}
        >
          {allowedEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToTheRoute(`${manageCategoriesRoute}/${categoryId}`)}
              className="flex gap-2"
              title={t('AvailableCategories.ManageCategory')}
            >
              <Icons.Edit className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </>
  );
  if (!isCurrentCategoryRoutePath) {
    cardContent = (
      <Link className="flex-1 text-xl font-medium" href={categoriesRoutePath as TRoutePath}>
        {cardContent}
      </Link>
    );
  }
  return (
    <Card
      className={cn(
        isDev && '__AvailableCategoriesList_CategoryItem_Card', // DEBUG
        'relative flex flex-1 flex-col',
        'overflow-visible',
        'cursor-pointer border border-theme-800/10 transition',
        'bg-theme/10',
        'hover:bg-theme/15',
      )}
      style={{
        ...style,
      }}
    >
      {cardContent}
    </Card>
  );
}
