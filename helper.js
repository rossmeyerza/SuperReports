const https = require('https');
const fs = require('fs');
const parse = require('csv-parse');
const csv = require('csvtojson');

module.exports = {

	getData(options, cb) {

		https.get(options, (res) => {
			const { statusCode } = res;
			const contentType = res.headers['content-type'];
			console.log(`STATUS: ${res.statusCode}`);
			console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

			let error;
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' +
								  `Status Code: ${statusCode}`);
			}   else if (!/^text\/javascript/.test(contentType)) {
			     error = new Error('Invalid content-type.\n' +
			                       `Expected application/json but received ${contentType}`);
			   }
			if (error) {
				console.error(error);
				// consume response data to free up memory
			}

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

	initialise(){

	}

};