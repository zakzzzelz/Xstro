import { bot } from '#lib';

bot(
	{
		pattern: 'call',
		isGroup: true,
		public: true,
		desc: 'Setup Group Call',
		type: 'group'
	},
	async (message, match, { prefix }) => {
		if (!match)
			return message.send(`_Give me the name;time, eg_\n\n_${prefix}call Friends Calls;2:00pm_`);
		match = match.split(';');
        console.log(timeToTimestamp(match[1]))
		await message.client.relayMessage(
			message.jid,
			{
				viewOnceMessage: {
					message: {
						messageContextInfo: {
							deviceListMetadataVersion: 2,
							deviceListMetadata: {}
						},
						scheduledCallCreationMessage: {
							scheduledTimestampMs: timeToTimestamp(match[1]),
							callType: 1,
							title: match[0]
						}
					}
				}
			},
			{ deviceId: '44' }
		);
	}
);

function timeToTimestamp(timeStr) {
	const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
	if (!match) throw new Error("Invalid time format. Use 'hh:mmam' or 'hh:mmpm'.");

	let [_, hours, minutes, period] = match;
	hours = parseInt(hours, 10);
	minutes = parseInt(minutes, 10);
	if (period.toLowerCase() === 'pm' && hours !== 12) {
		hours += 12;
	} else if (period.toLowerCase() === 'am' && hours === 12) {
		hours = 0;
	}
	const now = new Date();
	now.setHours(hours, minutes, 0, 0);
	return now.getTime();
}
