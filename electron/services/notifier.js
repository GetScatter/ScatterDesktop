const notifier = require("node-notifier");
const {icon} = require('../utils');

class NotificationService {
	static pushNotification(title, body){
		notifier.notify({
			message:body,
			title,
			appID:'com.get-scatter.server',
			sound: false,
			icon,
			wait:false
		});
	}
}

module.exports = NotificationService;