'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Modal } from '@/components/ui/Modal';
import { AddCategoryModal } from '@/components/pages/ManageCategoriesPage/AddCategoryModal';
import { DeleteCategoriesModal } from '@/components/pages/ManageCategoriesPage/DeleteCategoriesModal';
import { EditCategoryModal } from '@/components/pages/ManageCategoriesPage/EditCategoryModal';

export function ManageCategoriesPageModalsWrapper() {
  const router = useRouter();
  const params = useParams();

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
        title="Add Category"
        description="Add a new category"
        isVisible={isAddOpen}
        hideModal={closeModal}
        className="max-w-2xl"
      >
        <AddCategoryModal onClose={closeModal} />
      </Modal>

      {/* Delete Categories Modal */}
      <Modal
        title="Delete Categories"
        description="Delete selected categories"
        isVisible={isDeleteOpen}
        hideModal={closeModal}
        className="max-w-md"
      >
        <DeleteCategoriesModal onClose={closeModal} />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Edit Category"
        description="Edit an existing category"
        isVisible={isEditOpen}
        hideModal={closeModal}
        className="max-w-2xl"
      >
        <EditCategoryModal categoryId={editId} onClose={closeModal} />
      </Modal>
    </>
  );
}
