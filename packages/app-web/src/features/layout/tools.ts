import { LinkProps } from '@tanstack/react-router';

export type Tool = {
  to: LinkProps['to'];
  labelKey: string;
};

export const TOOLS: Tool[] = [
  { to: '/stat-planner', labelKey: 'nav.stat_planner' },
];
