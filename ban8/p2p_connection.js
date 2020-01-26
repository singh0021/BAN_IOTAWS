// Chat application between bans

// Require readline for input from the console
const readline = require('readline');
const crypto = require('crypto');
// Require AWS IoT Device SDK
const awsIoT = require('aws-iot-device-sdk');

// Load the endpoint from file
const endpointFile = require('/home/ec2-user/environment/endpoint.json');

// Fetch the deviceName from the current folder name
const deviceName = __dirname.split('/').pop();

// Set the destinationDeviceName depending on this deviceName
var destinationDeviceName = 'ban1';
if (deviceName === 'ban1') {
    destinationDeviceName = 'ban2';
}

// Build constants
const subTopic = 'ban/greengrass/messaging';
const pubTopic = 'ban/messaging/' + destinationDeviceName;
const keyPath = 'private.pem.key';
const certPath = 'certificate.pem.crt';
const caPath = '/home/ec2-user/environment/root-CA.crt';
const clientId = deviceName;
const host = endpointFile.endpointAddress;

// Interface for console input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 1: Use the awsIoT library to create device object using the  
//         constants created before
const device = awsIoT.device({
   keyPath: keyPath,
  certPath: certPath,
    caPath: caPath,
  clientId: clientId,
      host: host
});


// 2: When the connection to AWS IoT is established, subscribe to the 
//         subTopic IoT Topic and start reading from the console for a message to
//         send using the readConsoleInput() function.
device.on('connect', function() {
    
    // Subscribe to subscriptionTopic
    device.subscribe(subTopic);
    
    // Start reading from the console
    //readConsoleInput();
});


//  3: When a new message is received on the subscribed topic, output its 
//         content in the console.
device.on('message', function(subTopic, message) {
    console.log("Message received on topic " + subTopic + ": " +message);
    console.log("*******************************************************");
});


// Function to create a random float between minValue and maxValue
function randomFloatBetween(minValue,maxValue){
      return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue));
     }

