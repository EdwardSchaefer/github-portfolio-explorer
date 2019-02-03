import {animate, style, transition, trigger, sequence, query} from '@angular/animations';

export const DirectoryViewerAnimations = [
  trigger('directoryViewer', [
    transition(':enter', [
      query(':enter, .gpe-folder-button',
        sequence([
          style({ 'minHeight': '0px', height: '0px' }),
          animate('1.25s ease-out', style({ height: '*'})),
        ]),
        {optional: true}
      )
    ]),
    transition(':leave', [
      query(':leave, gpe-folder-button',
        sequence([
          style({ 'minHeight': '*', height: '*' }),
          animate('1.25s ease-in', style({ 'minHeight': '0', height: '0px'})),
        ]),
        {optional: true}
      )
    ])
  ])
];
