import { Component } from "preact";
import "./Notifications.css";
import Notification from "./Notification";

type NotificationManagerProps = {
}

type NotificationObject = {
    text: string,
    key: number,
    success?: boolean,
    error?: boolean
}

export default class NotificationManager extends Component<NotificationManagerProps> {

    state = {
        notifications: []
    }

    globalKeys = 0;

    render () {
        return <div className="notifications">
            {this.state.notifications.map((m: NotificationObject) => 
                <Notification key={m.key} success={m.success} error={m.error}>{m.text}</Notification>
            )}
        </div>
    }

    addNotification (text: string, type?: string) {
        const notifications: NotificationObject[] = this.state.notifications;
        const notification = {
            text: text,
            key: this.globalKeys++,
            success: type == 'success',
            error: type == 'error',
        }
        notifications.unshift(notification);
        this.setState({ notifications });
        setTimeout(() => {
            const notifications: NotificationObject[] = this.state.notifications;
            notifications.splice(notifications.indexOf(notification), 1);
            this.setState({ notifications });
        }, 4000);
    }

}