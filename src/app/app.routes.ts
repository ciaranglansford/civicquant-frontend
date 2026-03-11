import { Routes } from '@angular/router';

import { FeedPageComponent } from './feed/pages/feed-page.component';

export const routes: Routes = [
  {
    path: '',
    component: FeedPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
