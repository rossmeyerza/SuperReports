const config = require('./config.json');
const helper = require('./helper.js');
const querystring = require('querystring');

const FBData = querystring.stringify({
  'access_token': config.FBtoken,  //get this token from Facebook Developers
});

const FBoptions = {
  hostname: 'graph.facebook.com',
  path: `/v2.9/6064416189597/leads`
};



helper.getData(FBoptions, function(res){
  console.log(res.data);
});

//helper.postData(IGoptions, data);  326353234107564