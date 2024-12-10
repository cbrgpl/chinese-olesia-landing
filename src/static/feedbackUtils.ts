export enum EFeedbackOrigins {
  VK = 'vk',
  AVITO = 'avito',
}

interface IVkExtras {
  likes: number;
}

interface IAvitoExtras {
  score: number;
}

export interface IFeedback {
  avatar: null | string;
  date: string;
  name: string;
  text: string;
  origin: EFeedbackOrigins;
  extras: {
    vkExtras: IVkExtras | null;
    avitoExtras: IAvitoExtras | null;
  };
}
