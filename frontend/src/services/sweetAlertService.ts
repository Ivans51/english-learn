import Swal, { type SweetAlertResult, type SweetAlertIcon } from 'sweetalert2';

interface SweetAlertOptions {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  reverseButtons?: boolean;
  customClass?: {
    popup?: string;
    title?: string;
    htmlContainer?: string;
    confirmButton?: string;
    cancelButton?: string;
  };
  // Add any other SweetAlertOptions you commonly use
}

const defaultOptions = {
  customClass: {
    popup: 'dark:bg-primary-500 dark:text-primary-50',
    title: 'dark:text-primary-50',
    htmlContainer: 'dark:text-primary-200',
    confirmButton: 'focus:ring-green-500',
    cancelButton: 'focus:ring-red-500',
  },
};

const SweetAlertService = {
  async fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
    return Swal.fire({ ...defaultOptions, ...options });
  },

  async confirm(
    title: string,
    text: string,
    icon: SweetAlertIcon = 'warning',
    confirmButtonText: string = 'Yes',
    cancelButtonText: string = 'Cancel'
  ): Promise<SweetAlertResult> {
    return this.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
    });
  },

  async success(title: string, text: string): Promise<SweetAlertResult> {
    return this.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  },

  async error(title: string, text: string): Promise<SweetAlertResult> {
    return this.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',

      customClass: {
        ...defaultOptions.customClass,
        confirmButton: 'focus:ring-red-500',
      }
    });
  },

  async info(title: string, text: string): Promise<SweetAlertResult> {
    return this.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
    });
  },

  async warning(title: string, text: string): Promise<SweetAlertResult> {
    return this.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  },
};

export default SweetAlertService;
