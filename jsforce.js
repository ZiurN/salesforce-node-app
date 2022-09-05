import jsforce from 'jsforce';
import { UnicomerDev1, UnicomerHVSDEV, UnicomerHVSTST } from './oauth.js';

const currentSfEnv = UnicomerDev1;

const insertAccounts = (accountsToinsert) => {
	var conn = new jsforce.Connection(currentSfEnv.oauth2);
	conn.login(currentSfEnv.username, currentSfEnv.password, function(err, userInfo) {
		if (err) { return console.error(err); }
		// Now you can get the access token and instance URL information.
		// Save them to establish connection next time.
		console.log(conn.accessToken);
		console.log(conn.instanceUrl);
		// logged in user property
		console.log("User ID: " + userInfo.id);
		console.log("Org ID: " + userInfo.organizationId);
		conn.bulk.pollTimeout = 250000; // Bulk timeout can be specified globally on the connection object
		conn.bulk.load("Account", "insert", [accountsToinsert[0]], function(err, rets) {
			if (err) { return console.error(err); }
			for (var i=0; i < rets.length; i++) {
				if (rets[i].success) {
					console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
					ids.push(rets[i].id);
				} else {
					console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
				}
			}
		});
	});
}

export { insertAccounts }