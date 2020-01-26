// Require readline for input from the console
const readline = require('readline');

// Require AWS IoT Device SDK
const awsIoT = require('aws-iot-device-sdk');

// Load the endpoint from file
const endpointFile = require('/home/ec2-user/environment/endpoint.json');

// Fetch the deviceName from the current folder name
const deviceName = __dirname.split('/').pop();

// Set the destinationDeviceName depending on this deviceName
var destinationDeviceName = 'ban1';
var connection = process.argv[2];

if (process.argv.length <= 2) {
    console.log("Please mention which node to connect(13,15)");
    process.exit(-1);
}

if ((deviceName === 'ban1') && (connection == 13)) {
    destinationDeviceName = 'ban3';
}
else {
   if (connection == 15){
    destinationDeviceName = 'ban5';
}
  else {
      console.log("Sensors are not in range. Hence exiting");
      process.exit(-1);
}
}

// Build constants
const subTopic = 'ban/sensor/' + deviceName;
const pubTopic = 'ban/sensor/' + destinationDeviceName;
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

// Recursive function reading console input
function readConsoleInput() {
    rl.question('Enter a message on the next line to send to ' + pubTopic + ':\r\n', function (message) {
        
        // Calling function to publish to IoT Topic
        publishToIoTTopic(pubTopic, message);
        
        readConsoleInput();
    });
}


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
    readConsoleInput();
});


// 3: When a new message is received on the subscribed topic, output its 
//         content in the console.
device.on('message', function(topic, message) {
    console.log("Message received on topic " + topic + ": " + message);
});


// Function to publish payload to IoT topic
function publishToIoTTopic(topic, payload) {
    // 4: Publish to specified IoT topic using device object
    //         that you created
    device.publish(topic, payload);
}
