import Swal, { type SweetAlertOptions } from 'sweetalert2'

// Define common custom classes for dark theme
const commonSwalClasses = {
  popup: 'bg-primary-900 border border-primary-700 text-primary-50',
  title: 'text-primary-50',
  htmlContainer: 'text-primary-300',
}

// Define default button classes for dark theme
export const defaultConfirmButtonClass =
  'inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium transition-colors cursor-pointer bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 mr-3'
export const defaultCancelButtonClass =
  'inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium transition-colors cursor-pointer bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'

/**
 * Displays a SweetAlert2 dialog with predefined dark theme styling.
 *
 * @param options SweetAlertOptions to customize the dialog.
 * @returns A Promise that resolves with the result of the dialog.
 */
export function fireSwal(options: SweetAlertOptions) {
  return Swal.fire({
    ...options,
    customClass: {
      popup: commonSwalClasses.popup,
      title: commonSwalClasses.title,
      htmlContainer: commonSwalClasses.htmlContainer,
      confirmButton: defaultConfirmButtonClass,
      cancelButton: defaultCancelButtonClass,
      ...options.customClass, // Allow overriding custom classes including buttons
    },
    buttonsStyling: false, // Ensure custom button styling is applied
  })
}
