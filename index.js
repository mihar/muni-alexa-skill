require('localenv');
const muni = require('./lib/muni');

const APPLICATION_ID = process.env.APPLICATION_ID;

if (!APPLICATION_ID) {
  throw 'No application ID configured';
}

exports.handler = async function (event, context) {
  console.log('at=handler status=starting application_id=' + APPLICATION_ID);

  try {
    if (event.session.application.applicationId !== APPLICATION_ID) {
      console.warn('at=handler event.session.application.applicationId=' + event.session.application.applicationId);
      context.fail('Invalid Application ID');
    }

    console.log('at=handler event.request.type=' + event.request.type);

    if (event.request.type === 'LaunchRequest' || event.request.type === 'IntentRequest') {
      let direction, vehicle_type;

      if (event.request.type === 'IntentRequest') {
        direction = parse_slot(event.request.intent.slots['direction']);
        vehicle_type = parse_slot(event.request.intent.slots['vehicle_type']);
      }

      const speech = await muni.get(direction, vehicle_type);

      context.succeed(
        buildResponse(
          buildSpeechletResponse(speech)
        )
      );
    } else {
      context.succeed();
    }
  } catch (e) {
    context.fail('Exception: ' + e);
  }
};

function parse_slot(slot) {
  if (!slot.value) return;

  // If no special resolutions, return the raw value
  if (!slot.resolutions) return slot.value;

  // Extract the best resolution
  if (!slot.resolutions.resolutionsPerAuthority) return;
  if (!slot.resolutions.resolutionsPerAuthority.length) return;
  if (!slot.resolutions.resolutionsPerAuthority[0].values) return;
  if (!slot.resolutions.resolutionsPerAuthority[0].values.length) return;

  return slot.resolutions.resolutionsPerAuthority[0].values[0].value.id;;
}

function buildSpeechletResponse(output) {
  return {
    outputSpeech: {
      type: 'PlainText',
      text: output
    },
    shouldEndSession: true
  };
}

function buildResponse(speechletResponse) {
  return {
    version: '1.0',
    sessionAttributes: {},
    response: speechletResponse
  };
}
