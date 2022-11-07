import { Component } from "preact";

type NotificationProps = {
    success?: boolean,
    error?: boolean
}

export default class Notification extends Component<NotificationProps> {

    render () {
        return <div className={this.class()}>
            {this.props.children}
        </div>
    }

    class = () => "notification-body" + (this.props.success ? " success" : "") + (this.props.error ? " error" : "");

}