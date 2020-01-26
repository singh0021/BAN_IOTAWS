// Require AWS IoT Device SDK
const awsIoT = require('aws-iot-device-sdk');

// Require crypto for random numbers generation
const crypto = require('crypto');

// Load the endpoint from file
const endpointFile = require('/home/ec2-user/environment/endpoint.json');

// Require request to make a request to the Greengrass endpoint
const request = require('request');

// Require fs to open the certificate, private key and root CA files
const fs = require('fs');

// Fetch the deviceName from the folder name
const deviceName = __dirname.split('/').pop();

// Build the Greengrass Discover URL
const greengrassDiscoverURL = 'https://' + endpointFile.endpointAddress + ':8443/greengrass/discover/thing/' + deviceName;

//
// Global variables
//
// Device client for the AWS IoT SDK
var device;
// Core Connectivity array
var ggCoreConnectivity = [];
// Used to loop through all Connectivity options from GG Core
var ggCoreConnectivityCount = 0;
// Buffer storing the Greengrass Core Certificate Authority used to connect
var ggCoreCAs;
// Flag to know when the connectivity to GG Core is established
var ggCoreConnectionEstablished = false;

var t = process.argv[2];
if (process.argv.length <= 2) {
    console.log("Time to go idle is missing. Hence exiting");
    process.exit(-1);
}

// Options for Request to GG Discovery API
const ggDiscoveryRequestOptions = {
    url: greengrassDiscoverURL, // the URL
    cert: fs.readFileSync('certificate.pem.crt'), // the cert of the client
    key: fs.readFileSync('private.pem.key'), // the key of the client
    ca: fs.readFileSync('/home/ec2-user/environment/root-CA.crt') // the certificate authority of the client's cert
};

// Make a request to the Greengrass Discovery API
request.get(ggDiscoveryRequestOptions, function (error, response, body) {
    
    // If there was no error
    if (error === null) {
        
        // Parse the response body as an object
        const ggDiscoverResponse = JSON.parse(body);
        
        // Output the response returned by the Greengrass Discovery API
        //console.log("Data received from Greengrass Discovery API:\r\n" + JSON.stringify(ggDiscoverResponse, null, 4));
        console.log("Data received from Greengrass :\r\n");
        
        // Store the Greengrass Core CA
        ggCoreCAs = Buffer.from(ggDiscoverResponse.GGGroups[0].CAs.join());
        
        // Store the Greengrass Core Connectivity options
        ggCoreConnectivity = ggDiscoverResponse.GGGroups[0].Cores[0].Connectivity;
        
        // Connect to Greengrass Core using the first option
        connectToGGCore(ggCoreConnectivity[ggCoreConnectivityCount].HostAddress, ggCoreConnectivity[ggCoreConnectivityCount].PortNumber);
        
    } else {
        
        // An error occurred while communicating with Greengrass Discovery API, log and exit
        console.log("Issue communicating with the Greengrass API");
        console.log("Error:", JSON.stringify(error));
        console.log("Response:", JSON.stringify(response));
        console.log("Body:", JSON.stringify(body));
        process.exit(1);
    }
});

// Function to connect to Greengrass Core at the specified address and port
function connectToGGCore (ggCoreHostAddress, ggCorePortNumber) {
   // console.log('Trying to connect to Greengrass Core with the address', ggCoreHostAddress, 'and port', ggCorePortNumber);
    
    // Create the device object with argument data
    // This automatically establishes the connection
    device = awsIoT.device({
               keyPath: 'private.pem.key',
              certPath: 'certificate.pem.crt',
              clientId: deviceName,
        connectTimeout: 5000,
                  host: ggCoreHostAddress,
                  port: ggCorePortNumber,
                  caCert: ggCoreCAs
    });
    
    // Function that gets executed when the connection to Greengrass Core is established
    device.on('connect', function() {
        console.log('Connected to Greengrass Core');
        ggCoreConnectionEstablished = true;
        
        // Start the publish loop
        infiniteLoopPublish();
    });
    
    // Function that gets executed when the connection to Greengrass Core failed
    // If the connection wasn't established prior to this event firing, it will
    // try the next connectivity option to connect to Greengrass Core.
    // If that was the last option, it will exit the process in error.
    device.on('error', function(error) {
        
        // If the connection isn't established
        if (ggCoreConnectionEstablished === false) {
            
            // The timeout to connect has been reached, stop the device from retrying
            device.end(true);
            
            // Increase the count for the list of Connectivity options to Greengrass Core
            ggCoreConnectivityCount++;
            
            // If the count is equal to the length of the Connectivity list, log and exit
            if (ggCoreConnectivityCount == ggCoreConnectivity.length) {
                console.log("Couldn't establish a connection with Greengrass Core");
                process.exit(1);
            } else { // There are remaining options to try in the Connectivity list
                
                // Connect to Greengrass Core using the next option
                connectToGGCore(ggCoreConnectivity[ggCoreConnectivityCount].HostAddress, ggCoreConnectivity[ggCoreConnectivityCount].PortNumber);
            }
        }
    });
}

// Function sending ban telemetry data every 5 seconds
function infiniteLoopPublish() {
    console.log('Sending Blood Glucose data to AWS IoT for ' + deviceName);
    // Publish ban data to ban/messaging topic with getBanData
    device.publish("ban/messaging", JSON.stringify(getBanData(deviceName)));
    
    // Start Infinite Loop of Publish every 5 seconds
    setInterval(infiniteLoopPublish, 5000*t);
    console.log(deviceName + ' has transferred data and will go to sleep mode for '+ (5000*t)/60000+ ' Minutes ');
}

var n=1;
var chargeLevel=100;
// Function to give battery percentage
function BatteryPercentage(){
        if (n==1){
        n++;
        return chargeLevel;
        }
        else {
        chargeLevel = 0.99999*chargeLevel;
        return parseFloat(chargeLevel);
}
}

// Function to create a random float between minValue and maxValue
function randomFloatBetween(minValue,maxValue){
    return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue));
}

// Generate random ban data based on the deviceName
function getBanData(deviceName) {
    let message = {
        'id': crypto.randomBytes(15).toString('hex'),
        'Glucose_level': randomFloatBetween(3.00, 10.55),
        'Unit': 'mmol/dL'
    };
    
    const device_data = { 
        'ban5': {
            'vin': 'W5QW0IO89RZFU4YRM',
            'locations':'LeftArm',
            'Type':'BloodPressure'
        },
        'ban6': {
            'vin': 'THJK867IURZOPQRTR',
            'locations':'Abdomen',
            'Type':'BloodGlucose'
        }
    };
  
    message['vin'] = device_data[deviceName].vin;
    message['locations'] = device_data[deviceName].locations;
    message['Type'] = device_data[deviceName].Type;
    message['device'] = deviceName;
    message['datetime'] = new Date().toISOString().replace(/\..+/, '');
    
    return message;
}
