/**
 * Type definitions for the example app
 */

export type Hero = {
  id: string;
  name: string;
  photo: any;
  quote?: string;
  description?: string;
};

export type SharedElementConfig = {
  id: string;
  animation?: 'move' | 'fade' | 'fade-in' | 'fade-out';
  resize?: 'auto' | 'stretch' | 'clip' | 'none';
  align?:
    | 'auto'
    | 'left-top'
    | 'left-center'
    | 'left-bottom'
    | 'right-top'
    | 'right-center'
    | 'right-bottom'
    | 'center-top'
    | 'center-center'
    | 'center-bottom';
};
