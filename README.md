# BAN_IOTAWS

// Step by step install and running scripts.

Defined policy in file TrainingIoTPolicy.json to attach to user shikher.singh for accessing AWS resources
Install AWS IOT SDK
npm install aws-iot-device-sdk

Starting and installing Cloud9 environment.
mkdir ~/environment/ban1; mkdir ~/environment/ban2; mkdir ~/environment/ban3 ; mkdir ~/environment/ban4 ; mkdir ~/environment/ban5 ; mkdir ~/environment/ban6 ; mkdir ~/environment/ban7 ; mkdir ~/environment/ban8

Download the AWS IoT Certificate Authority Public Certificate that will be used in the code
cd ~/environment wget -O root-CA.crt https://www.amazontrust.com/repository/AmazonRootCA1.pem

Defining policy IOTSubpolicy which authorize to Connect to your AWS IoT Core endpoint, to Publish and Subscribe to an IoT Topic, Receive messages from AWS IoT once subscribed and use the Discover API from Greengrass which will be used in code.
Save AWS IOT endpoint in json file using below command.
aws iot describe-endpoint --endpoint-type iot:Data-ATS > ~/environment/endpoint.json

We have to create 10 things/Bans in AWS IOT core and download their certificate, private key and public key and put in each Ban directory. Instuction are given in Final report with screenshots.

Making p2p connection among sensors by running below command in scripts.

cd ~/environment/ban1 node ban2ban_connection.js 13

cd ~/environment/ban3 node ban2ban_connection.js 31

Here number 13 represents connection from ban1 to ban3.
Similarly scripts can be run for other bans(Ban1, ban2, ban3, ban4, ban5, ban6)
We did it in each folder in order to show demo. It can automated in a single script and can be triggered by Lambda function.
                ### How to send data to SINK(BAN7) using AWS Greengrass
Since we already have bans created. Now we have to install greengrass and use it as Sink for edge computing.

We shall be sending data from each ban to topic (ban/messaging) and lambda function will be taking data from ban/messaging and publishing it to ban/greengrass/messaging These things and lambda function will be part of greengrass group.

We have to create a group called SCIoTGGGroup in which we have to register Ban 1 to Ban8 and lambda function in order to it working. Screenshots are provided in final module report.

Create a new user and group on cloud9

sudo adduser --system ggc_user sudo groupadd --system ggc_group

Greengrass requires that the security on the instance be improved by enabling hardlink and softlink protection on the operating system echo 'fs.protected_hardlinks = 1' | sudo tee -a /etc/sysctl.d/00-defaults.conf echo 'fs.protected_symlinks = 1' | sudo tee -a /etc/sysctl.d/00-defaults.conf sudo sysctl --system

Downloading and running AWS greengrass dependency(taken from AWS IOT SDK github). This is there to mount Linux control groups (cgroups).

chmod +x cgroupfs-mount.sh sudo bash ./cgroupfs-mount.sh

Downloading greengrass and installing it.
cd /tmp wget https://d1onfpft10uf5o.cloudfront.net/greengrass-core/downloads/1.8.0/greengrass-linux-x86-64-1.8.0.tar.gz sudo tar -xzf greengrass-linux-x86-64-1.8.0.tar.gz -C /

cd /tmp mv ~/environment/*-setup.tar.gz setup.tar.gz sudo tar -xzf setup.tar.gz -C /greengrass

Place the AWS IoT Root Certificate Authority in the /greengrass/certs folder
cd /greengrass/certs/ sudo wget -O root.ca.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem

Starting greengrass.
cd /greengrass/ggc/core/ sudo ./greengrassd start

It will show us output when it is running.
Create a lambda function and put lambda_function.py given in code and publish its version 1.

Create subscriptions in AWS greengrass from Ban1 to Lambda,Ban2 to Lambda , Ban3 to lambda , Ban4 to Lambda, Ban5 to Lambda, Ban6 to Lambda and from lambda to AWS IOT core.

Now deploy group by selecting Automatic Detection in AWS console. It is available in Screenshot in Final Report.

Time to fire-up our devices. Please run below scripts.

cd ~/environment/ban1 node local_greengrass.js 12

cd ~/environment/ban2 node local_greengrass.js 24

cd ~/environment/ban3 node local_greengrass.js 13

cd ~/environment/ban4 node local_greengrass.js 14

cd ~/environment/ban5 node local_greengrass.js 36

cd ~/environment/ban6 node local_greengrass.js 48

cd ~/environment/ban7 node p2p_connection.js

Ban7 is our sink and it will receive data from each Devices using MQTT connections.
Number(12, 24, 13, 14, 36 and 48 are nothing but time to sleep before sending data. This number will be multiplied by 5. Hence 12 will become
(12*5) = 1 min, sensor will sleep for 1 min. Similarly, it will done for other sensors.

It can configured to run via a single script and can be triggered by lambda function. I did it to run from individual folder in order to show demo.
########################HAPPY JOURNEY to IOT BANS##################################### I have not put it to my github as have provided here everything. Still if it does not work, please connect me with email. I will be putting everything on github. I have refered AWS-IOT-SDK github for our development. For certificates for each Bans, we can have separate certificate created and put it in each Ban Directory
