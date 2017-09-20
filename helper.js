const https = require('https');
const fs = require('fs');
const parse = require('csv-parse');
const csv = require('csvtojson');
const chalk = require('chalk');

const header = chalk.bgGreen;
const errormsg = chalk.bgRed;

module.exports = {

	getData(options, cb) {

		https.get(options, (res) => {
			const { statusCode } = res;
			const contentType = res.headers['content-type'];
			console.log(header(`STATUS: ${res.statusCode}`));
			console.log(header(`HEADERS: ${JSON.stringify(res.headers)}`));

			let error;
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' +
								  `Status Code: ${statusCode}`);
			}   else if (!/^text\/javascript/.test(contentType)) {
			     error = new Error('Invalid content-type.\n' +
			                       `Expected application/json but received ${contentType}`);
			   }


			res.setEncoding('utf8');

			let rawData = '';

			res.on('data', (chunk) => { rawData += chunk; });
			
			res.on('end', () => {
				try {
					const parsedData = JSON.parse(rawData);
					if (error) {
						console.error(error);
						console.log(errormsg(rawData));
						// consume response data to free up memory
					}
					cb(parsedData);
					
				} catch (e) {
					console.error(e.message);
				}
			});

		}).on('error', (e) => {
			console.error(`Got error: ${e.message}`);
		});
	},

	getRawData(options, cb) {

		https.get(options, (res) => {
			const { statusCode } = res;
			const contentType = res.headers['content-type'];
			console.log(`STATUS: ${http.STATUS_CODES[res.statusCode]}`);
			console.log(`all: ${res.header}`);

			// let error;
			// if (statusCode !== 200) {
			// 	error = new Error('Request Failed.\n' +
			// 					  `Status Code: ${statusCode}`);
			// }   else if (!/^text\/javascript/.test(contentType)) {
			//      error = new Error('Invalid content-type.\n' +
			//                        `Expected application/json but received ${contentType}`);
			//    }
			// if (error) {
			// 	console.error(error);
			// 	// consume response data to free up memory
			// }

			res.setEncoding('utf8');

			let rawData = '';

			res.on('data', (chunk) => { rawData += chunk; });
			
			res.on('end', () => {
				try {
					cb(rawData);
				} catch (e) {
					console.error(e.message);
				}
			});

		}).on('error', (e) => {
			console.error(`Got error: ${e.message}`);
		});
	},

	postData(options, data, cb) {

		const req = https.request(options, (res) => {
			//console.log(`STATUS: ${res.statusCode}`);
			//console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
			res.setEncoding('utf8');
			let rawData = '';

			res.on('data', (chunk) => { rawData += chunk; });
			
			res.on('end', () => {
				try {
					const parsedData = JSON.parse(rawData);
					cb(parsedData);
				} catch (e) {
					console.error(e.message);
				}
			});
		});

		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});


		req.write(data);
		req.end();
	},

	downloadFile(url, dest, cb) {
		let file = fs.createWriteStream(dest);
		let request = https.get(url, function(response) {

	    	if (response.statusCode !== 200) {
	            return cb('Response status was ' + response.statusCode);
	        }

	    	response.pipe(file);

	    	file.on('finish', function() {
	      		file.close(cb);  // close() is async, call cb after close completes.
	    	});

  		}).on('error', function(err) { // Handle errors
    		fs.unlink(dest); // Delete the file async. (But we don't check the result)
    		if (cb) cb(err.message);
  		});
	},

	saveFileToDB(dest){
		// let input = fs.createReadStream(dest);
		// input.setEncoding('utf8');

		// input
		// .pipe(parse({delimiter: ','}))
		// .on('data', function(record) {
  //       	console.log(JSON.stringify(record[0]));
  //   	});

  //   	csv()
		// .fromStream(input)
		// .on('csv',(csvRow)=>{
  //   		// csvRow is an array 
  //   		console.log(csvRow);
		// })
		// .on('json',(json)=>{
		// 	console.log(json);
		// })
		// .on('done',(error)=>{
 		
 	// 	});


 		fs.readFile(dest, 'utf8',(err,data)=>{
 			if (err) return console.log(err);
 			parse(data,(err, output)=>{
 				if (err) return console.log(err);
 				console.log(output[0]);
 			});
 		});
	
	},

	initialiseDB(con){

				let query = `CREATE TABLE IF NOT EXISTS fb_campaign_daily (
			account_id varchar(256),
			account_name varchar(1024),
			comment int,
			landing_page_view int,
			\`like\` int,
			link_click int,
			add_to_cart int,
			initiate_checkout int,
			search int,
			view_content int,
			photo_view int,
			post int,
			post_reaction int,
			video_view int,
			page_engagement int,
			post_engagement int,
			conversion int,
			campaign_id bigint,
			campaign_name varchar(1024),
			clicks int,
			cpc float,
			cpm float,
			cpp float,
			ctr float,
			date_start varchar(256),
			date_stop varchar(256),
			frequency float,
			impressions int,
			inline_link_clicks int,
			inline_post_engagement int,
			objective varchar(1024),
			outbound_click int,
			reach int,
			social_clicks int,
			social_reach int,
			social_spend float,
			spend float,
			unique_clicks int,
			unique_inline_link_clicks int,
			unique_outbound_click int,
			unique_social_clicks int,
			hourly_stats varchar(1024),
			table_id bigint NOT NULL AUTO_INCREMENT,
			PRIMARY KEY (table_id)
		);`;

		con.connect(function(err) {

			if (err) throw err;
			console.log("Connected!");


			con.query(query, 
				function (err, result) {
					if (err) console.log(err);
					con.end(function(){
						console.log('connection closed');
					});
			});
		});

	}

};