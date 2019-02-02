import {animate, style, transition, trigger, sequence} from '@angular/animations';

export const RepoListAnimations = [
  trigger('repoList', [
    transition(':enter', [
      sequence([
        style({ transform: 'translateX(-100%)', height: '0px' }),
        animate('0.2s ease', style({ height: '*'})),
        animate('0.2s ease-out', style({ transform: 'translateX(0)'}))
      ])
    ]),
    transition(':leave', [
      sequence([
        animate('0.2s ease-in', style({ transform: 'translateX(-100%)'})),
        animate('0.2s ease', style({ height: '0px'}))
      ])
    ])
  ])
];
