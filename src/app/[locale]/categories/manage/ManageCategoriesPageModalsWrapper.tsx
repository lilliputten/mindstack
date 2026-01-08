'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Modal } from '@/components/ui/Modal';
import { AddCategoryModal } from '@/components/pages/ManageCategoriesPage/AddCategoryModal';
import { DeleteCategoriesModal } from '@/components/pages/ManageCategoriesPage/DeleteCategoriesModal';
import { EditCategoryModal } from '@/components/pages/ManageCategoriesPage/EditCategoryModal';
import { useT } from '@/i18n';

export function ManageCategoriesPageModalsWrapper() {
  const router = useRouter();
  const params = useParams();
  const t = useT();

  // Determine modal state from route parameters
  const isAddOpen = Boolean(params.add);
  const isDeleteOpen = Boolean(params.delete);
  const isEditOpen = Boolean(params.edit);
  const editId = params.edit as string;

  const closeModal = React.useCallback(() => {
    router.push('/categories/manage');
  }, [router]);

  return (
    <>
      {/* Add Category Modal */}
      <Modal
        title={t('CategoriesPage.Modals.Add.Title')}
        description={t('CategoriesPage.Modals.Add.Description')}
        isVisible={isAddOpen}
        hideModal={closeModal}
        className="max-w-2xl"
      >
        <AddCategoryModal onClose={closeModal} />
      </Modal>

      {/* Delete Categories Modal */}
      <Modal
        title={t('CategoriesPage.Modals.Delete.Title')}
        description={t('CategoriesPage.Modals.Delete.Description')}
        isVisible={isDeleteOpen}
        hideModal={closeModal}
        className="max-w-md"
      >
        <DeleteCategoriesModal onClose={closeModal} />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title={t('CategoriesPage.Modals.Edit.Title')}
        description={t('CategoriesPage.Modals.Edit.Description')}
        isVisible={isEditOpen}
        hideModal={closeModal}
        className="max-w-2xl"
      >
        <EditCategoryModal categoryId={editId} onClose={closeModal} />
      </Modal>
    </>
  );
}
