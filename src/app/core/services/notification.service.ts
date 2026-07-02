import { computed, Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationsQueue = signal<AppNotification[]>([]);
  private notificationId = 0;
  private timerId?: ReturnType<typeof setTimeout>;

  readonly notification = computed(
    () => this.notificationsQueue()[0] ?? null,
  );

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message, 6000);
  }

  info(message: string): void {
    this.show('info', message);
  }

  close(): void {
    const currentNotification = this.notification();

    if (!currentNotification) {
      return;
    }

    this.remove(currentNotification.id);
  }

  private show(
    type: NotificationType,
    message: string,
    duration = 4500,
  ): void {
    const normalizedMessage = String(message ?? '').trim();

    if (!normalizedMessage) {
      return;
    }

    const wasEmpty = this.notificationsQueue().length === 0;

    this.notificationsQueue.update((notifications) => [
      ...notifications,
      {
        id: ++this.notificationId,
        type,
        message: normalizedMessage,
        duration,
      },
    ]);

    if (wasEmpty) {
      this.startTimerForCurrentNotification();
    }
  }

  private remove(notificationId: number): void {
    const currentNotification = this.notification();

    if (currentNotification?.id === notificationId && this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }

    this.notificationsQueue.update((notifications) =>
      notifications.filter(
        (notification) => notification.id !== notificationId,
      ),
    );

    this.startTimerForCurrentNotification();
  }

  private startTimerForCurrentNotification(): void {
    if (this.timerId || !this.notification()) {
      return;
    }

    const currentNotification = this.notification();

    if (!currentNotification) {
      return;
    }

    this.timerId = setTimeout(() => {
      this.timerId = undefined;
      this.remove(currentNotification.id);
    }, currentNotification.duration);
  }
}