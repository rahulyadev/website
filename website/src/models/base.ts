export type TopMenu = {
  title: string;
  pathName: string;
  icon: string;
};

export type FooterMenu = {
  title: string;
  icon: string;
  pathName: string;
  topMenu: TopMenu[];
  lastActive: string;
  lastActivePath: string;
};
