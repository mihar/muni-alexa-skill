# MUNI Alexa Skill

Add incoming MUNI predictions to Amazon Echo's Alexa using this small skill. It's not published in the skills directory but you can deploy it with your own settings using AWS Lambda function and let it run for free.

Currently the skill only supports one stop and you need to hardcode the SFMTA stop number in `index.js`. Look up the nearest stop around your place using [511](http://transit.511.org/schedules/realtimedepartures.aspx).

## Adding a new developer skill

To get started, add a new Alexa Skill Set in [Amazon Developer Console](https://developer.amazon.com/edw/home.html#/). Once you created a new app, give it the following settings:

_**Skill Information**_

- Application Id - _Copy this to `index.js`_
- Skill type: Custom Interaction Model
- Name: _Name of your choosing, e.g. "Arriving Muni"_
- Invocation Name: _Command that your Alexa listens, e.g. "arriving muni"_

_**Interaction model**_

Here's an example of a complete interaction model for my use case (stops on 28th/Judah):

```json
 {
   "interactionModel": {
     "languageModel": {
       "invocationName": "mint peaks",
       "intents": [{
         "name": "AMAZON.FallbackIntent",
         "samples": []
       }, {
         "name": "AMAZON.CancelIntent",
         "samples": []
       }, {
         "name": "AMAZON.HelpIntent",
         "samples": []
       }, {
         "name": "AMAZON.StopIntent",
         "samples": []
       }, {
         "name": "GetTrainTimesIntent",
         "slots": [{
           "name": "direction",
           "type": "MuniDirections"
         }, {
           "name": "vehicle_type",
           "type": "MuniVehicleType"
         }],
         "samples": ["for next {vehicle_type} going towards {direction}", "for next {vehicle_type} going {direction}", "for next {vehicle_type} towards {direction}", "for next {vehicle_type} toward {direction}", "for next {direction} {vehicle_type}", "for next {vehicle_type}", "about {vehicle_type} going towards {direction}", "about {vehicle_type} going {direction}", "about {vehicle_type} towards {direction}", "about {vehicle_type} toward {direction}", "about {direction} {vehicle_type}", "about {direction}", "about {vehicle_type}", "for the next {vehicle_type} headed {direction}", "for the next {vehicle_type} toward {direction}", "for the next {direction} {vehicle_type}", "for the next {vehicle_type} going {direction}", "for the next {vehicle_type}", "give me the next {vehicle_type} going {direction}", "give me the next {vehicle_type} toward {direction}", "give me the next {vehicle_type}", "when is the next {vehicle_type} toward {direction}", "when's the next {vehicle_type} toward {direction}", "for {vehicle_type} toward {direction}", "about the next {vehicle_type} going {direction}", "about the next {vehicle_type}", "about next {direction} {vehicle_type}", "about next {vehicle_type}", "for the {vehicle_type} going {direction}", "for the {vehicle_type}", "when is the next {direction} {vehicle_type}", "when's the next {direction} {vehicle_type}", "when's the next {vehicle_type}", "when is the next {vehicle_type}", "for {vehicle_type} going {direction}", "for {direction} {vehicle_type}", "for {vehicle_type}"]
       }, {
         "name": "AMAZON.NavigateHomeIntent",
         "samples": []
       }],
       "types": [{
         "values": [{
           "id": "outbound",
           "name": {
             "value": "outbound",
             "synonyms": ["beach", "ocean beach", "to ocean beach", "out", "to the beach"]
           }
         }, {
           "id": "inbound",
           "name": {
             "value": "inbound",
             "synonyms": ["in", "to embarcadero", "downtown", "to downtown", "to the city"]
           }
         }],
         "name": "MuniDirections"
       }, {
         "values": [{
           "id": "train",
           "name": {
             "value": "train",
             "synonyms": ["light rail", "tram", "trams", "trains"]
           }
         }, {
           "id": "bus",
           "name": {
             "value": "bus",
             "synonyms": ["buses", "busses"]
           }
         }],
         "name": "MuniVehicleType"
       }]
     }
   }
 }
```

_**Configuration**_

It's dead simple to deploy Alexa skills using AWS Lambda, so for _Endpoint_ select _Lambda ARN (Amazon Resource Name)_. Now, construct your Lambda function with `node_modules` directory.  This is required as Lambda is unable to pull NPM modules and they need to be bundled with the code. Please note that at this point you should have set `applicationId` and `muniStop` variables in the `index.js`:

```bash
git clone https://github.com/mihar/muni-alexa-skill.git
cd muni-alexa-skill

npm install
zip -r lambda_function.zip *
```

After this you'll need to deploy `lambda_function.zip` as a Lambda function:

1. [Login to AWS Console and visit Lambda settings](https://console.aws.amazon.com/lambda/home?region=us-east-1#)
1. Select _Create Lambda Function_
1. Skip blueprint selection
2. Set function name, e.g. `nextMuni` and select Node.js runtime
3. Upload as a Zip file (`lambda_function.zip`) to Lambda function
4. Use `index.handler` handler and select _Basic Execution Role_ for Role
5. Create Lambda function. After creation, you need to copy ARN from top right corner to Alexa skill settings

Once you have completed these steps, and pointed Alexa skill to the Lambda function, you should be able to test your skill with your _"Alexa, ask arriving muni"_. While this isn't really natural, the list of [invocation words](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/supported-phrases-to-begin-a-conversation) is still somewhat limited.
