console.time('Start');

const config = require('./config.json');
const querystring = require('querystring');
const mysql = require('mysql');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');

/*------------------------------------------------*/
/*                                                */
/*               Chalk Colors                     */
/*                                                */
/*------------------------------------------------*/


const info = chalk.bgYellow.black;
const error = chalk.bgRedBright;
const priority = chalk.red;
const json = chalk.cyan;

var con = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
  });

const helper = require('./helper.js');


/*------------------------------------------------*/
/*------------------------------------------------*/
/* ------------- Facebook query options --------- */
/*------------------------------------------------*/
/*------------------------------------------------*/

const FBData = querystring.stringify({
  'fields': 
    `account_id,`+
    `account_name,`+
    //`action_values,`+
    `actions,`+
    `ad_id,`+
    `ad_name,`+
    `adset_id,`+
    `adset_name,`+
    //`buying_type,`+
    //`call_to_action_clicks,`+
    `campaign_id,`+
    `campaign_name,`+
    //`canvas_avg_view_percent,`+
    //`canvas_avg_view_time,`+
    //`canvas_component_avg_pct_view,`+
    `clicks,`+
    //`cost_per_10_sec_video_view,`+
    //`cost_per_action_type,`+
    //`cost_per_estimated_ad_recallers,`+
    //`cost_per_inline_link_click,`+
    //`cost_per_inline_post_engagement,`+
    //`cost_per_outbound_click,`+
    //`cost_per_total_action,`+
    //`cost_per_unique_action_type,`+
    //`cost_per_unique_click,`+
    //`cost_per_unique_inline_link_click,`+
    //`cost_per_unique_outbound_click,`+
    `cpc,`+
    `cpm,`+
    `cpp,`+
    `ctr,`+
    `date_start,`+
    `date_stop,`+
    //`estimated_ad_recall_rate,`+
    //`estimated_ad_recallers,`+
    `frequency,`+
    `impressions,`+
   // `inline_link_click_ctr,`+
    `inline_link_clicks,`+
    `inline_post_engagement,`+
    //`mobile_app_purchase_roas,`+
    `objective,`+
    `outbound_clicks,`+
    //`outbound_clicks_ctr,`+
    //`place_page_name,`+
    `reach,`+
    `relevance_score,`+
    `social_clicks,`+
    `social_impressions,`+
    `social_reach,`+
    `social_spend,`+
    `spend,`+
   // `total_action_value,`+
   // `total_actions,`+
   // `total_unique_actions,`+
   // `unique_actions,`+
    `unique_clicks,`+
   // `unique_ctr,`+
   // `unique_inline_link_click_ctr,`+
    `unique_inline_link_clicks,`+
   // `unique_link_clicks_ctr,`+
    `unique_outbound_clicks,`+
   // `unique_outbound_clicks_ctr,`+
    `unique_social_clicks`,
    //`video_10_sec_watched_actions,`+
    //`video_15_sec_watched_actions,`+
    //`video_30_sec_watched_actions,`+
    //`video_avg_percent_watched_actions,`+
    //`video_avg_time_watched_actions,`+
    //`video_p100_watched_actions,`+
    //`video_p25_watched_actions,`+
    //`video_p50_watched_actions,`+
    //`video_p75_watched_actions,`+
    //`video_p95_watched_actions,`+
    //`website_ctr,`+//
    //`website_purchase_roas`,
  'access_token': config.FBtoken,  //get this token from Facebook Developers
  'time_increment': '1',
  'breakdowns': 'hourly_stats_aggregated_by_advertiser_time_zone',
  'date_preset': 'yesterday',
  'default_summary': 'false',
  //'export_format': 'csv', // leave blank for Json
  //'export_name': 'alldata.csv',
  'level': 'campaign',
  //'after': 'NDkZD'
});

/*------------------------------------------------*/
/*------------------------------------------------*/
/*------------------ Functions -------------------*/
/*------------------------------------------------*/
/*------------------------------------------------*/

function startRecording(options, cb){
  helper.getData(options, function(res){
    if (cb) cb(res);
  });
}

function startInsertion(res) {
  //console.log(JSON.stringify(res));  //can print out results here
  for (i = res.data.length - 1; i >= 0; i--) {

    let data = res.data[i];

    // Flattening actions

    console.log(info(data.campaign_id));
    console.log(json(JSON.stringify(data)));

    let actions = {};
    if (data.actions) {
      for (n = data.actions.length - 1; n>= 0; n--){
        actions[data.actions[n].action_type] = data.actions[n].value;
      }
    }


    //console.log(json(JSON.stringify(actions)));

    let outbound_clicks = {};
    if (data.outbound_clicks) {
      for (o = data.outbound_clicks.length - 1; o>= 0; o--){
        outbound_clicks[data.outbound_clicks[o].action_type] = data.outbound_clicks[o].value;
      }
    }

    //console.log(json(JSON.stringify(outbound_clicks)));

    let unique_outbound_clicks = {};
    if (data.unique_outbound_clicks) {
      for (p = data.unique_outbound_clicks.length - 1; p>= 0; p--){
        unique_outbound_clicks[data.unique_outbound_clicks[p].action_type] = data.unique_outbound_clicks[p].value;
      }
    }
    //console.log(json(JSON.stringify(unique_outbound_clicks)));

    con.query(`INSERT INTO fb_campaign_daily VALUES 
            ( 
            ${data.account_id || null},
            "${data.account_name || null}",
            ${data.comment || null},
            ${actions.landing_page_view || null},
            ${actions.like || null},
            ${actions.link_click || null},
            ${actions['offsite_conversion.fb_pixel_add_to_cart'] || null},
            ${actions['offsite_conversion.fb_pixel_initiate_checkout'] || null},
            ${actions['offsite_conversion.fb_pixel_search'] || null},
            ${actions['offsite_conversion.fb_pixel_view_content'] || null},
            ${actions.photo_view || null},
            ${actions.post || null},
            ${actions.post_reaction || null},
            ${actions.video_view || null},
            ${actions.page_engagement || null},
            ${actions.post_engagement || null},
            ${actions.offsite_conversion || null},
            ${data.campaign_id || null},
            "${data.campaign_name || null}",
            ${data.clicks || null},
            ${data.cpc || null},
            ${data.cpm || null},
            ${data.cpp || null},
            ${data.ctr || null},
            "${data.date_start || null}",
            "${data.date_stop || null}",
            ${data.frequency || null},
            ${data.impressions || null},
            ${data.inline_link_clicks || null},
            ${data.inline_post_engagement || null},
            "${data.objective || null}",
            ${outbound_clicks.outbound_click || null},
            ${data.reach || null},
            ${data.social_clicks || null},
            ${data.social_reach || null},
            ${data.social_spend || null},
            ${data.spend || null},
            ${data.unique_clicks || null},
            ${data.unique_inline_link_clicks || null},
            ${unique_outbound_clicks.outbound_click || null},
            ${data.unique_social_clicks || null},
            "${data.hourly_stats_aggregated_by_advertiser_time_zone || null}",
            0`+ // leave blank for unique id
            `);`, function (err, result) {
            if (err) throw err;
            console.log(priority("1 record inserted"));
          });
        }

    if (res.paging.next) {
      setTimeout(function(){
        startRecording(res.paging.next, function(moreData){
          startInsertion(moreData);
        }); // Recursive function calls simple stirng with url parameters
      }, 1500);
      
    } else {
      con.end(function(err) {
      console.log('connection closed');
      console.timeEnd('Start');
    });
  }
}

/*------------------------------------------------*/
/*------------------------------------------------*/
/* ------------- simple request ------------------*/
/*------------------------------------------------*/
/*------------------------------------------------*/

if (argv.o == 'simpleFB') {
  // const FBoptions = {
  //   hostname: 'graph.facebook.com',
  //   path: `/v2.10/act_560792606898/insights?${FBData}`
  // };

  // const FBoptions = {
  //       hostname: 'www.facebook.com',
  //       path: `/ads/ads_insights/export_report?report_run_id=118521925438783&format=csv&name=alldata&access_token=${config.FBtoken}`,
  //       headers: {
  //       'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
  //       }
  //     };

  // helper.downloadFile(FBoptions, 'file.csv', function(err){
  //   if (err) console.log(err);
  //   console.log('finished');
  // });

  //helper.saveFileToDB('./downloads/FB_1389890294380191.csv');


  helper.initialiseDB(con);
}

/*------------------------------------------------*/
/*------------------------------------------------*/
/* ------------- Facebook GET data ---------------*/
/*------------------------------------------------*/
/*------------------------------------------------*/

if (argv.o == 'getFB') {
  const FBoptions = {
    hostname: 'graph.facebook.com',
    path: `/v2.10/act_560792606898/insights?${FBData}`
  };

  con.connect(function(err) {

    if (err) throw err;
    console.log("Connected!");

    startRecording(FBoptions, function(data){
      startInsertion(data);
    });
  });
}

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/* ------------- Facebook Post Data -------------- */
/*-------------------------------------------------*/
/*-------------------------------------------------*/

if (argv.o == 'postFB') {

  const FBoptions = {
    hostname: 'graph.facebook.com',
    path: `/v2.10/act_560792606898/insights`,
    method: 'POST',
    port: 443
  };

  helper.postData(FBoptions, FBData, function(res){
    console.log(res);

    let FBGetOptions = {
      hostname: 'graph.facebook.com',
      path: `/v2.10/${res.report_run_id}?access_token=${config.FBtoken}`
    };

    var timer = setInterval(function(){

      helper.getData(FBGetOptions, function(data){
        if (data.async_percent_completion !== 100) {
          console.log(data);
        } else {
          console.log('completed!');
          clearInterval(timer);

          let FBDownloadOptions = {
            hostname: 'www.facebook.com',
            path: `/ads/ads_insights/export_report?report_run_id=${res.report_run_id}&format=csv&access_token=${config.FBtoken}`,
            headers: {
              'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
            }
          };

          helper.downloadFile(FBDownloadOptions, `downloads/FB_${res.report_run_id}.csv`, function(err){
            if (err) console.log(err);
            console.log(`finished: ./downloads/FB_${res.report_run_id}.csv`);
          });
        }
      });
    },5000);
  });
}

/*------------------------------------------------*/
/*------------------------------------------------*/
/* ------------- Instagram data ----------------- */
/*------------------------------------------------*/
/*------------------------------------------------*/

// https://api.instagram.com/oauth/authorize/?client_id=5630fa9b8fc64cca83c47fcffe446ef5&redirect_uri=https://agency.condriac.com&response_type=token

// const IGData = querystring.stringify({
//   'msg': 'Hello World!'
// });

// const IGoptions = {
//   hostname: 'api.instagram.com',
//   port: 80,
//   path: '/oauth/access_token',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//     'Content-Length': Buffer.byteLength(postData)
//   }
// };

//helper.postData(IGoptions, data);