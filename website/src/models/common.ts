export type SocialLinks = {
  title: string;
  icon: string;
  link: string;
};

export type TimeLineItem = {
  id: number;
  title: string;
  place: {
    name: string;
    logoUrl: string;
    faIcon: string;
  };
  period: string[];
  description: string | string[];
  paragraph: boolean;
};
