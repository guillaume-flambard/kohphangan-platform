declare global {
  interface Window {
    TabCheckout?: {
      open: (options: {
        amount: number;
        currency: string;
        description: string;
        customer?: {
          name: string;
          phone: string;
        };
        onSuccess: (result: any) => void;
        onError: (error: any) => void;
        onCancel: () => void;
      }) => void;
    };
    widgetSettings?: {
      businessCode: string;
      baseURL?: string;
    };
  }
}

export {};