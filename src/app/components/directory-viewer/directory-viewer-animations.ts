import {animate, style, transition, trigger, sequence, query} from '@angular/animations';

export const DirectoryViewerAnimations = [
  trigger('directoryViewer', [
    transition(':enter', [
      sequence([
        style({ 'minHeight': '0px', height: '0px' }),
        animate('0.25s ease-out', style({ 'minHeight': '*', height: '*'})),
      ])
    ]),
    transition(':leave', [
      sequence([
        style({ 'minHeight': '*', height: '*' }),
        animate('0.25s ease-in', style({ 'minHeight': '0', height: '0'})),
      ])
    ])
  ])
];
