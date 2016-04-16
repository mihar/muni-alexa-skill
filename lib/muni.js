'use strict';

const debug = require('debug')('muni');
const request = require('superagent');
const xml2jsParser = require('superagent-xml2jsparser');

const NEXTBUS_STOP_API_URL = 'http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&stopId=';
const TRAINS = {
  'train': {
    inbound: {
      tag: 'N',
      stop_id: 15206,
      type: 'train',
      direction: 'inbound'
    },
    outbound: {
      tag: 'N',
      stop_id: 15205,
      type: 'train',
      direction: 'outbound'
    }
  },
  'bus': {
    inbound: {
      tag: 'NX',
      stop_id: 15206,
      type: 'bus',
      direction: 'inbound'
    },
    outbound: {
      tag: 'NX',
      stop_id: 15205,
      type: 'bus',
      direction: 'outbound'
    }
  }
};

// Router
module.exports.get = async function get(direction, vehicle_type) {
  debug({ at: 'get' });

  // Set defaults to inbound N-Judah
  direction = direction || 'inbound';
  vehicle_type = vehicle_type || 'train';

  debug({ at: 'get', direction, vehicle_type });

  return get_stop_predictions_text(TRAINS[vehicle_type][direction]);
};

async function get_stop_predictions_data(stop_id, cb) {
  try {
    const response = await request
    .get(NEXTBUS_STOP_API_URL + stop_id)
    .accept('xml')
    .parse(xml2jsParser);

    return response.body['body']['predictions'];
  }
  catch (err) {
    console.error('Could not fetch stop data for stop ' + stop_id, err);
    return err;
  }
}

async function get_stop_predictions(train) {
  const data = await get_stop_predictions_data(train.stop_id);

  if (!data) {
    return;
  }

  // Filter to tag
  const route_data = data.filter((route) => route['$']['routeTag'] === train.tag)[0];

  if (!route_data['direction']) {
    return;
  }

  const parsed_data = {
    predictions: [],
    route: route_data['$']['routeTitle'],
    direction: route_data['direction'][0]['$']['title']
  };

  parsed_data.predictions = route_data['direction']
  .map(direction => direction['prediction'])
  .reduce((a,b) => a.concat(b)) // Merge array of arrrays
  .map(prediction => parseInt(prediction['$']['minutes']))
  .sort((a, b) => a - b)
  .slice(0, 3);

  return parsed_data;
}

async function get_stop_predictions_text(train) {
  const prediction = await get_stop_predictions(train);

  if (!prediction) {
    return `No ${train.direction} ${train.tag} ${train.type} available at the moment`;
  }

  const text = [];
  text.push(prediction.route);
  text.push(`${train.direction} in`);
  text.push(prediction.predictions.shift());
  text.push('minutes.');

  if (prediction.predictions.length > 0) {
    text.push(`Next ${train.type} also in`);
    text.push(prediction.predictions.join(' and '));
    text.push('minutes.');
  }

  return text.join(' ');
}
