'use client';

export default function DeleteCategoriesModalLoading() {
  /* // No skeletons for modal slots!
   * const pathname = usePathname();
   * // Check if we're on the delete route (?)
   * const checkPath = '/delete';
   * if (pathname?.endsWith(checkPath)) {
   *   const prevChunk = pathname.substring(0, pathname.length - checkPath.length);
   *   // Check if the previous path ends with manageCategoriesRoute
   *   if (prevChunk.endsWith(manageCategoriesRoute)) {
   *     // Import and return the actual loading component only when needed
   *     return (
   *       <GenericSkeleton
   *         className={cn(
   *           isDev && '__ManageCategoriesListSkeleton_deleteCategoryModal', // DEBUG
   *         )}
   *       />
   *     );
   *   }
   * }
   */

  // Return null when not on the active route to prevent skeleton from showing
  return null;
}
