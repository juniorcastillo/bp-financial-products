import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppHeaderComponent } from './shared/components/app-header/app-header.component';
import { AppToastComponent } from './shared/components/app-toast/app-toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeaderComponent, AppToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}