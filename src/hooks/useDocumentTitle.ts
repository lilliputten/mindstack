import React from 'react';

export function useDocumentTitle(title: string, isVisible: boolean = true) {
  React.useEffect(() => {
    if (isVisible) {
      const originalTitle = document.title;
      document.title = title;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [title, isVisible]);
}
