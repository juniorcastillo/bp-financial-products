import { Component, inject } from '@angular/core';

import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  templateUrl: './app-toast.component.html',
  styleUrl: './app-toast.component.scss',
})
export class AppToastComponent {
  readonly notifications = inject(NotificationService);

  close(): void {
    this.notifications.close();
  }
}